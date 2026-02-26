import express from 'express';
import { addReaction, removeReaction } from '../controllers/reaction.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:messageId/add', protectRoute, addReaction);
router.post('/:messageId/remove', protectRoute, removeReaction);

export default router;
