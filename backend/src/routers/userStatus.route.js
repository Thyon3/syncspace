import express from 'express';
import { 
    updateUserStatus,
    getUserStatus,
    updateActivity,
    getMultipleUserStatuses
} from '../controllers/userStatus.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.put('/status', protectRoute, updateUserStatus);
router.get('/status/:userId', protectRoute, getUserStatus);
router.post('/activity', protectRoute, updateActivity);
router.post('/statuses', protectRoute, getMultipleUserStatuses);

export default router;