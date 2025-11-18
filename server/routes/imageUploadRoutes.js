import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import { uploadEventImage } from '../controllers/imageUploadController.js';

const router = express.Router();

router.post("/event-image", authMiddleware, roleMiddleware("organizer","admin"), upload.single("image"), uploadEventImage);

export default router;