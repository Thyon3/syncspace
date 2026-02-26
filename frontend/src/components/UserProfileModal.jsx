import React from 'react';
import { X, Mail, Clock, Info } from 'lucide-react';

function UserProfileModal({ user, onClose, onBlock, isBlocked }) {
    if (!user) return null;

    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return 'Unknown';
        const date = new Date(lastSeen);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">User Profile</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <img
                        src={user.profilePic || '/default-avatar.png'}
                        alt={user.name}
                        className="w-24 h-24 rounded-full mb-3"
                    />
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    {user.isOnline ? (
                        <span className="text-green-400 text-sm">Online</span>
                    ) : (
                        <span className="text-slate-400 text-sm">
                            Last seen {formatLastSeen(user.lastSeen)}
                        </span>
                    )}
                </div>

                <div className="space-y-3">
                    {user.email && (
                        <div className="flex items-center gap-3 text-slate-300">
                            <Mail size={18} />
                            <span>{user.email}</span>
                        </div>
                    )}
                    
                    {user.bio && (
                        <div className="flex items-start gap-3 text-slate-300">
                            <Info size={18} className="mt-1" />
                            <p>{user.bio}</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => onBlock(user._id)}
                        className={`flex-1 py-2 rounded ${
                            isBlocked
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                        } transition`}
                    >
                        {isBlocked ? 'Unblock' : 'Block'} User
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserProfileModal;
