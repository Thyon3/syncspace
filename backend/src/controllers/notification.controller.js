import Notification from '../model/notification.model.js';
import { getIO, getReceiverSocketId } from '../config/socket.js';

export const createNotification = async (userId, type, title, body, data = {}) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            body,
            data
        });
        
        await notification.save();
        
        // Emit real-time notification
        const io = getIO();
        const socketId = getReceiverSocketId(userId.toString());
        if (socketId) {
            io.to(socketId).emit('notification', notification);
        }
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;
        
        const notifications = await Notification.find({ userId })
            .populate('data.senderId', 'name profilePic')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });
        
        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error in getNotifications:', error);
        res.status(500).json({ message: error.message });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;
        
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        console.error('Error in markNotificationAsRead:', error);
        res.status(500).json({ message: error.message });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error in markAllNotificationsAsRead:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;
        
        const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error in deleteNotification:', error);
        res.status(500).json({ message: error.message });
    }
};

export const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        
        await Notification.deleteMany({ userId });
        
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        console.error('Error in clearAllNotifications:', error);
        res.status(500).json({ message: error.message });
    }
};