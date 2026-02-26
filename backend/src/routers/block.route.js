import express from 'express';
import { blockUser, unblockUser, getBlockedUsers } from '../controllers/block.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:userId/block', protectRoute, blockUser);
router.post('/:userId/unblock', protectRoute, unblockUser);
router.get('/blocked', protectRoute, getBlockedUsers);

export default router;
