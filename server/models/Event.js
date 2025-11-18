import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            required: true
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        maxParticipants: {
            type: Number,
            default: 100
        },
        registeredUsers: [{
            user: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
            qrcode: {type: String},
            registrationTime: {type: Date, default:Date.now},
            isScanned: {type: Boolean, default: false},
            scannedAt: {type: Date}
        }],
        attendedUsers: [
            {type: mongoose.Schema.Types.ObjectId, ref: "user"}
        ],
        thumbnail: {
            type: String,
            default: ""
        },
        isPublished: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true
    }
)

const Event = mongoose.model("event", eventSchema);
export default Event;