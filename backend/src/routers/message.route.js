
import express, { Router } from 'express';
import multer from 'multer';
const router = express.Router();

// message controller 
import {
    getAllContacts, getChatPartners, getMessagesById, messages, sendMessage, markMessageAsRead,
    getMessagesByChatId, searchMessages, editMessage, deleteMessage
} from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const upload = multer({ storage: multer.memoryStorage() });

router.get(
    "/contacts",
    protectRoute,
    getAllContacts
);
router.get("/search", protectRoute, searchMessages);
router.get('/findthemall', protectRoute, messages);
router.get(
    "/chats",
    protectRoute,
    getChatPartners
);
router.get(
    "/:userId",
    protectRoute,
    getMessagesById
);

router.get(
    "/chat/:chatId",
    protectRoute,
    getMessagesByChatId
);

router.post(
    "/send",
    protectRoute,
    upload.single('image'),
    sendMessage
);

router.post(
    "/user/:userId/send",
    protectRoute,
    upload.single('image'),
    sendMessage
);

router.post(
    "/read",
    protectRoute,
    markMessageAsRead
);

router.patch("/:id", protectRoute, editMessage);
router.delete("/:id", protectRoute, deleteMessage);

export default router; 
