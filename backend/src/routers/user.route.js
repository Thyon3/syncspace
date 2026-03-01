import express from 'express';
const router = express.Router();
import { updateProfile, changePassword, deleteAccount, toggleBlockUser } from '../controllers/user.controller.js';
import multer from "multer";
import { protectRoute } from '../middleware/auth.middleware.js';
const upload = multer({ storage: multer.memoryStorage() });

router.put("/updateProfile", upload.single("profilePic"), protectRoute, updateProfile);
router.post("/change-password", protectRoute, changePassword);
router.delete("/delete-account", protectRoute, deleteAccount);
router.post("/toggle-block", protectRoute, toggleBlockUser);

export default router; 