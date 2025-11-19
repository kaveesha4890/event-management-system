import Event from "../models/Event.js";
import QRCode from "qrcode";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js";

//Register for event
export const registerForEvent = async(req,res) => {
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const event = await Event.findById(id);

        if(!event){
            return res.status(404).json({message:"Event not found"});
        }

        if(event.organizer.toString() === userId.toString()){
            return res.status(400).json({message: "Organizer cannot register for own event"});
        }

        const alreadyRegistered = event.registeredUsers.find((r)=> r.user?.toString() === userId.toString());

        if(alreadyRegistered){
            return res.status(400).json({message:"Already registered for this event"})
        }

        if(event.registeredUsers.length >= event.maxParticipants){
            return res.status(400).json({message:"Event is full"});
        }

        //genarate QR payload
        const qrPayload = {
            id,
            userId,
            timestamp: Date.now()
        };

        //convert payload into QR base64 image
        const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrPayload));

        event.registeredUsers.push({
            user: userId,
            qrcode: qrCodeImage,
            isScanned: false
        });

        const user = await User.findById(userId);

        const emailHtml = `
            <p>Hello ${user.name},</p>
            <p>Thanks for registering for <strong>${event.title}</strong> on ${event.date} at ${event.time || ""}.</p>
            <p>Location: ${event.location}</p>
            <p>Please present this QR code at the entrance:</p>
            <img src="${qrCodeImage}" alt="Ticket QR" style="max-width:300px"/>
            <p>Registration ID: <code>${userId}-${id}</code></p>
            <p>See you there!</p>
        `;
        const base64Data = qrCodeImage.split(",")[1];
        const qrBuffer = Buffer.from(base64Data, "base64");

        const mailOptions = {
            to: user.email,
            subject: `Your ticket for ${event.title}`,
            html: emailHtml,
            attachments: [
                {
                    filename: `ticket=${id}.png`,
                    content: qrBuffer,
                    contentType: "image/png"
                }
            ]
        }

        await sendMail(mailOptions);
        await event.save();

        return res.status(201).json({
            message:"Registered successfully",
            ticket: {
                eventId: id,
                userId: userId,
                qrCode: qrCodeImage
            }
        });

    } catch (error) {
        console.error("Register Event Error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}

//Cancel Registration
export const cancelRegistration = async(req,res) => {
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const event = await Event.findById(id);

        if(!event){
            return res.status(404).json({message:"Event not found"});
        }

        if(!event.registeredUsers.includes(userId)){
            return res.status(400).json({message:"You are not registered for this event"})
        }

        event.registeredUsers = event.registeredUsers.filter((u)=>u.toString() !== userId.toString());

        await event.save();

        return res.status(200).json({message:"Registration cancelled successfully"});
        

    } catch (error) {
        console.error("Cansel registration Event Error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}

//Get event attendees
export const getEventAttendees = async(req,res) => {
    try {
        const {id} = req.params;

        const event = await Event.findById(id)
            .populate("registeredUsers", "name email role")
            .populate("attendedUsers", "name email");

        if(!event){
            return res.status(404).json({message:"Event not found"});
        }

        if(event.organizer.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Not allowed"});
        }

        const totalRegistered = event.registeredUsers.length;
        const totalAttended = event.attendedUsers.length;
        const scannedTickets = event.registeredUsers.filter(r=>r.isScanned).length;

        const attendanceRate = totalRegistered > 0 ? (totalAttended/totalRegistered) * 100 : 0;

        return res.status(200).json({
            event: {
                id: event._id,
                title: event.title,
                date: event.date,
                location: event.location
            },
            statistics: {
                totalRegistered: totalRegistered,
                totalAttended: totalAttended,
                scannedTickets: scannedTickets,
                attendanceRate: Math.round(attendanceRate * 100) / 100,
                remainingCapacity: event.maxParticipants - totalRegistered
            },
            registeredUsers: event.registeredUsers.map(reg => ({
                user: reg.user,
                registrationTime: reg.registrationTime,
                isScanned: reg.isScanned,
                scannedAt: reg.scannedAt
            })),
            attendedUsers: event.attendedUsers
        })
    } catch (error) {
        console.error("Get Event stats Error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}

//scan QR code
export const scanQRCode = async (req,res) => {
    try {
        const {qrData} = req.body;
        const organizerId = req.user._id;

        if(!qrData){
            return res.status(400).json({message:"QR data is required"});
        }

        let qrPayload;
        try{
            qrPayload = JSON.parse(qrData);
        }catch(error){
            return res.status(400).json({message: "Invalid QR code format"});
        }

        const {id: eventId, userId} = qrPayload;
        const event = await Event.findById(eventId);
        
        if(!event){
            return res.status(404).json({message: "Event not found"});
        }

        if(event.organizer.toString() !== organizerId.toString()){
            return res.status(403).json({message: "Not allowed"})
        }

        const registration = event.registeredUsers.find((r) => r.user?.toString() === userId.toString());

        if(!registration){
            return res.status(404).json({message: "User not registered for this event"});
        }

        if(registration.isScanned){
            return res.status(400).json({
                message: "Ticket already scanded",
                user: await User.findById(userId).select("name email"),
                scannedAt: registration.scannedAt
            })
        }

        registration.isScanned = true;
        registration.scannedAt = new Date();

        if(!event.attendedUsers.includes(userId)){
            event.attendedUsers.push(userId);
        }

        await event.save();

        const user = await User.findById(userId).select("name email");

        return res.status(200).json({
            message: "Attendance marked successfully",
            attendace: {
                user:{
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
                event:{
                    id: event._id,
                    title: event.title,
                    date: event.date,
                    time: event.time
                },
                scannedAt: registration.scannedAt,
                isScanned: registration.isScanned
            }
        });

    } catch (error) {
        console.error("Scan QRCode Error: ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}