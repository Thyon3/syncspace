
import express, { Router } from 'express';
const router = express.Router();

// message controller 
import { getAllContacts, getChatPartners, getMessagesById, sendMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

router.get(
    "/contacts",
    protectRoute,
    getAllContacts
);
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
    sendMessage
);

export default router; 
