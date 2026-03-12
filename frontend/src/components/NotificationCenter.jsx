import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

function NotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axiosInstance.patch(`/notifications/${notificationId}/read`);
            setNotifications(prev => 
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosInstance.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axiosInstance.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const clearAll = async () => {
        try {
            await axiosInstance.delete('/notifications');
            setNotifications([]);
            setUnreadCount(0);
            toast.success('All notifications cleared');
        } catch (error) {
            toast.error('Failed to clear notifications');
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diff = now - notifDate;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return notifDate.toLocaleDateString();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-slate-700 rounded-full transition"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Notifications</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-slate-700 rounded"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-slate-400">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-400">No notifications</div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-3 border-b border-slate-700 hover:bg-slate-700/50 ${
                                        !notification.isRead ? 'bg-blue-900/20' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">{notification.title}</h4>
                                            <p className="text-sm text-slate-300 mt-1">{notification.body}</p>
                                            <span className="text-xs text-slate-400 mt-2 block">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 ml-2">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-1 hover:bg-slate-600 rounded"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-1 hover:bg-red-600 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-700">
                            <button
                                onClick={clearAll}
                                className="w-full text-sm text-red-400 hover:text-red-300 py-2"
                            >
                                Clear All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationCenter;