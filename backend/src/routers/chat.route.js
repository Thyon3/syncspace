import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getChats, createGroup, addMember, searchUsersAndGroups } from '../controllers/chat.controller.js';

const router = express.Router();

router.get('/', protectRoute, getChats);
router.post('/create-group', protectRoute, createGroup);
router.post('/add-member', protectRoute, addMember);
router.get('/search', protectRoute, searchUsersAndGroups);

export default router;
