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