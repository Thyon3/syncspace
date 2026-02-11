
import express, { Router } from 'express';
import multer from 'multer';
const router = express.Router();

// message controller 
import { getAllContacts, getChatPartners, getMessagesById, messages, sendMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const upload = multer({ storage: multer.memoryStorage() });

router.get(
    "/contacts",
    protectRoute,
    getAllContacts
);
router.get('/findthemall', protectRoute, messages);
router.get(
    "/chats",
    protectRoute,
    getChatPartners
);
router.get(
    "/user/:userId",
    protectRoute,
    getMessagesById
);
router.post(
    "/user/:userId/send",
    protectRoute,
    upload.single('image'),
    sendMessage
);

export default router; 
