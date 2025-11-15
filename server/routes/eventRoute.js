import express from 'express';
import { createEvent, getAllEvents } from '../controllers/eventController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/create", authMiddleware,roleMiddleware("organizer"), createEvent)
router.get("/all-events", getAllEvents)

export default router;