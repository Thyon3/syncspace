import express from 'express';
import { 
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications
} from '../controllers/notification.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protectRoute, getNotifications);
router.patch('/:notificationId/read', protectRoute, markNotificationAsRead);
router.patch('/read-all', protectRoute, markAllNotificationsAsRead);
router.delete('/:notificationId', protectRoute, deleteNotification);
router.delete('/', protectRoute, clearAllNotifications);

export default router;