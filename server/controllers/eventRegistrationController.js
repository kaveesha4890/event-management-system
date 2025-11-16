import Event from "../models/Event.js";

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

        if(event.registeredUsers.includes(userId)){
            return res.status(400).json({message:"Already registered for this event"});
        }

        if(event.registeredUsers.length >= event.maxParticipants){
            return res.status(400).json({message:"Event is full"});
        }

        event.registeredUsers.push(userId);
        await event.save();

        return res.status(201).json({message:"Registered successfully"});

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

        const event = await Event.findById(id).populate(
            "registeredUsers",
            "name email role"
        );

        if(!event){
            return res.status(404).json({message:"Event not found"});
        }

        if(event.organizer.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Not allowed"});
        }

        return res.status(200).json(event.registeredUsers);
    } catch (error) {
        console.error("Get Attendees Error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}