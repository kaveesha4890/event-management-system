import Event from "../models/Event.js";

//create event
export const  createEvent = async(req,res) => {
    try {
        const {title, description, date, time, location, maxParticipants} = req.body;

        if(!title || !description || !date || !location){
            return res.status(400).json({message:"All required fields must be fields"});
        }

        const event = await Event.create({
            title,
            description,
            date,
            time,
            location,
            organizer: req.user._id,
            maxParticipants,
        });

        return res.status(201).json({
            message: "Event created successsfully",
            event,
        });

    } catch (error) {
        console.error("Create Event Error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}

//Get all Events
export const getAllEvents = async(req,res) => {
    try {
        const events = await Event.find().populate("organizer", "name email role").sort({createdAt: -1});

        return res.status(200).json(events);
    } catch (error) {
        console.error("Get all Event Error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}

//Get single event
export const getEventById = async(req,res) => {
    try {
        const event = await Event.findById(req.params.id).populate("organizer", "name email role");

        if(!event){
            return res.status(404).json({message: "Event not found"});
        }

        return res.status(200).json(event);
    } catch (error) {
        console.error("Get all Event Error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}

//Update Event
export const UpdateEvent = async(req,res) => {
    try {
        const event = await Event.findById(req.params.id)

        if(!event){
            return res.status(404).json({message: "Event not found"});
        }

        if(event.organizer.toString() !== user._id.toString()){
            return res.status(403).json({message: 'Not allowed'});
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        );

        return res.status(200).json({
            message:"Event updated successfully",
            event: updatedEvent,
        });
    } catch (error) {
        console.error("Get all Event Error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}

//Delete Event
export const deleteEvent = async(req,res) => {
    try {
        const event = await Event.findById(req.params.id)

        if(!event){
            return res.status(404).json({message: "Event not found"});
        }

         if(event.organizer.toString() !== user._id.toString()){
            return res.status(403).json({message: 'Not allowed'});
        }
        await event.deleteOne();

        return res.status(200).json({message: "Event deleted successfully"});
    } catch (error) {
        console.error("Get all Event Error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}