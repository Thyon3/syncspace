import React, { useState, useEffect } from 'react';
import { Circle, Clock, Moon, Zap, Settings } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

function UserStatusSelector({ currentUser, onStatusChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('online');
    const [customMessage, setCustomMessage] = useState('');
    const [showCustomMessage, setShowCustomMessage] = useState(false);

    const statusOptions = [
        { key: 'online', label: 'Online', icon: Circle, color: 'text-green-500' },
        { key: 'away', label: 'Away', icon: Clock, color: 'text-yellow-500' },
        { key: 'busy', label: 'Busy', icon: Zap, color: 'text-red-500' },
        { key: 'dnd', label: 'Do Not Disturb', icon: Moon, color: 'text-purple-500' },
        { key: 'offline', label: 'Invisible', icon: Circle, color: 'text-gray-500' }
    ];

    useEffect(() => {
        fetchCurrentStatus();
    }, []);

    const fetchCurrentStatus = async () => {
        try {
            const res = await axiosInstance.get(`/status/${currentUser._id}`);
            setCurrentStatus(res.data.status);
            setCustomMessage(res.data.customMessage || '');
        } catch (error) {
            console.error('Failed to fetch status:', error);
        }
    };

    const updateStatus = async (status, message = '') => {
        try {
            await axiosInstance.put('/status', {
                status,
                customMessage: message
            });
            
            setCurrentStatus(status);
            setCustomMessage(message);
            setIsOpen(false);
            setShowCustomMessage(false);
            
            if (onStatusChange) {
                onStatusChange(status, message);
            }
            
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleCustomMessageSubmit = (e) => {
        e.preventDefault();
        updateStatus(currentStatus, customMessage);
    };

    const getCurrentStatusOption = () => {
        return statusOptions.find(option => option.key === currentStatus) || statusOptions[0];
    };

    const currentOption = getCurrentStatusOption();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded-lg transition"
            >
                <div className="relative">
                    <img
                        src={currentUser.profilePic || '/default-avatar.png'}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                        currentStatus === 'online' ? 'bg-green-500' :
                        currentStatus === 'away' ? 'bg-yellow-500' :
                        currentStatus === 'busy' ? 'bg-red-500' :
                        currentStatus === 'dnd' ? 'bg-purple-500' :
                        'bg-gray-500'
                    }`} />
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    {customMessage ? (
                        <p className="text-xs text-slate-400 truncate">{customMessage}</p>
                    ) : (
                        <p className="text-xs text-slate-400">{currentOption.label}</p>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
                    <div className="p-3 border-b border-slate-700">
                        <h3 className="font-semibold text-sm">Set Status</h3>
                    </div>

                    <div className="p-2">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.key}
                                    onClick={() => updateStatus(option.key)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition ${
                                        currentStatus === option.key ? 'bg-slate-700' : ''
                                    }`}
                                >
                                    <Icon size={16} className={option.color} />
                                    <span className="text-sm">{option.label}</span>
                                    {currentStatus === option.key && (
                                        <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-2 border-t border-slate-700">
                        <button
                            onClick={() => setShowCustomMessage(!showCustomMessage)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition"
                        >
                            <Settings size={16} />
                            <span className="text-sm">Custom Message</span>
                        </button>

                        {showCustomMessage && (
                            <form onSubmit={handleCustomMessageSubmit} className="mt-2">
                                <input
                                    type="text"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="What's your status?"
                                    className="w-full p-2 bg-slate-700 rounded-lg text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
                                    maxLength={100}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 py-1 px-3 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomMessage('');
                                            setShowCustomMessage(false);
                                        }}
                                        className="flex-1 py-1 px-3 bg-slate-600 hover:bg-slate-500 rounded text-sm transition"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserStatusSelector;