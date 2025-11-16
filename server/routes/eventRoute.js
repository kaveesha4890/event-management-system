import express from 'express';
import { createEvent, deleteEvent, getAllEvents, getEventById, UpdateEvent } from '../controllers/eventController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware.js';
import { registerForEvent, cancelRegistration, getEventAttendees } from '../controllers/eventRegistrationController.js';

const router = express.Router();

router.post("/create", authMiddleware,roleMiddleware("organizer"), createEvent)
router.get("/", authMiddleware, getAllEvents)
router.get("/:id", getEventById)
router.put("/:id", authMiddleware, roleMiddleware("organizer"), UpdateEvent)
router.delete("/:id", authMiddleware, roleMiddleware("organizer"), deleteEvent)

router.post("/:id/register", authMiddleware, registerForEvent)
router.post("/:id/cancel", authMiddleware, cancelRegistration)
router.get("/:id/attendees", authMiddleware, roleMiddleware("organizer"), getEventAttendees)

export default router;