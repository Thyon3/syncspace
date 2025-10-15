import express from 'express';
const router = express.Router();
import { updateProfile } from '../controllers/user.controller.js';
import multer from "multer";
import { protectRoute } from '../middleware/auth.middleware.js';
const upload = multer({ storage: multer.memoryStorage() });

router.put("/updateProfile", upload.single("profilePic"), protectRoute, updateProfile);

export default router; 