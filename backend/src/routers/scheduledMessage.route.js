import express from 'express';
import { 
    scheduleMessage,
    getScheduledMessages,
    cancelScheduledMessage,
    updateScheduledMessage,
    getScheduledMessageStats
} from '../controllers/scheduledMessage.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, scheduleMessage);
router.get('/', protectRoute, getScheduledMessages);
router.patch('/:messageId/cancel', protectRoute, cancelScheduledMessage);
router.put('/:messageId', protectRoute, updateScheduledMessage);
router.get('/stats', protectRoute, getScheduledMessageStats);

export default router;