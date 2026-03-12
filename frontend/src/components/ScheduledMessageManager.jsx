import React, { useState, useEffect } from 'react';
import { Clock, Edit, Trash2, Send, Calendar, X } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

function ScheduledMessageManager({ isOpen, onClose }) {
    const [scheduledMessages, setScheduledMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [stats, setStats] = useState({ pending: 0, sent: 0, failed: 0, cancelled: 0 });

    useEffect(() => {
        if (isOpen) {
            fetchScheduledMessages();
            fetchStats();
        }
    }, [isOpen]);

    const fetchScheduledMessages = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/scheduled');
            setScheduledMessages(res.data);
        } catch (error) {
            toast.error('Failed to load scheduled messages');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axiosInstance.get('/scheduled/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const cancelMessage = async (messageId) => {
        if (!confirm('Are you sure you want to cancel this scheduled message?')) return;
        
        try {
            await axiosInstance.delete(`/scheduled/${messageId}`);
            setScheduledMessages(prev => prev.filter(msg => msg._id !== messageId));
            toast.success('Scheduled message cancelled');
            fetchStats();
        } catch (error) {
            toast.error('Failed to cancel message');
        }
    };

    const updateMessage = async (messageId, updates) => {
        try {
            await axiosInstance.put(`/scheduled/${messageId}`, updates);
            setScheduledMessages(prev => 
                prev.map(msg => msg._id === messageId ? { ...msg, ...updates } : msg)
            );
            setEditingMessage(null);
            toast.success('Message updated');
        } catch (error) {
            toast.error('Failed to update message');
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-500';
            case 'sent': return 'text-green-500';
            case 'failed': return 'text-red-500';
            case 'cancelled': return 'text-gray-500';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return Clock;
            case 'sent': return Send;
            case 'failed': return X;
            case 'cancelled': return X;
            default: return Clock;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg w-full max-w-4xl h-3/4 flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Scheduled Messages</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* Stats */}
                <div className="p-4 border-b border-slate-700">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                            <div className="text-sm text-slate-400">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{stats.sent}</div>
                            <div className="text-sm text-slate-400">Sent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
                            <div className="text-sm text-slate-400">Failed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-500">{stats.cancelled}</div>
                            <div className="text-sm text-slate-400">Cancelled</div>
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : scheduledMessages.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No scheduled messages</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {scheduledMessages.map((message) => {
                                const StatusIcon = getStatusIcon(message.status);
                                return (
                                    <div key={message._id} className="bg-slate-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <StatusIcon size={16} className={getStatusColor(message.status)} />
                                                <span className={`text-sm font-medium capitalize ${getStatusColor(message.status)}`}>
                                                    {message.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {message.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingMessage(message)}
                                                            className="p-1 hover:bg-slate-600 rounded"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => cancelMessage(message._id)}
                                                            className="p-1 hover:bg-red-600 rounded"
                                                            title="Cancel"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-sm text-slate-300 mb-1">
                                                To: {message.chatId?.groupName || 'Direct Message'}
                                            </p>
                                            <p className="text-sm">
                                                Scheduled: {formatDateTime(message.scheduledTime)}
                                            </p>
                                            {message.sentAt && (
                                                <p className="text-sm text-green-400">
                                                    Sent: {formatDateTime(message.sentAt)}
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-slate-600 rounded p-3">
                                            {message.text && <p className="text-sm">{message.text}</p>}
                                            {message.image && (
                                                <img src={message.image} alt="Scheduled" className="max-w-xs rounded mt-2" />
                                            )}
                                            {message.fileName && (
                                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
                                                    <span>📎</span>
                                                    <span>{message.fileName}</span>
                                                </div>
                                            )}
                                        </div>

                                        {message.failureReason && (
                                            <div className="mt-3 p-2 bg-red-900/30 rounded text-sm text-red-300">
                                                Error: {message.failureReason}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingMessage && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60">
                    <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Edit Scheduled Message</h3>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            updateMessage(editingMessage._id, {
                                text: formData.get('text'),
                                scheduledTime: formData.get('scheduledTime')
                            });
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <textarea
                                    name="text"
                                    defaultValue={editingMessage.text}
                                    className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                    rows={3}
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Scheduled Time</label>
                                <input
                                    type="datetime-local"
                                    name="scheduledTime"
                                    defaultValue={new Date(editingMessage.scheduledTime).toISOString().slice(0, 16)}
                                    className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                                >
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingMessage(null)}
                                    className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScheduledMessageManager;