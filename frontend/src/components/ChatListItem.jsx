import React from 'react';
import { formatChatTime } from '../lib/utils';

function ChatListItem({ chat, isActive, onClick, isOnline }) {
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    const truncateMessage = (text, maxLength = 35) => {
        if (!text) return 'No messages yet';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div
            onClick={onClick}
            className={`telegram-chat-item ${isActive ? 'telegram-chat-item-active' : ''} cursor-pointer`}
        >
            <div className="flex items-center gap-3">
                {/* Avatar with online status */}
                <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        {chat.profilePic ? (
                            <img
                                src={chat.profilePic}
                                alt={chat.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-semibold text-lg">
                                {getInitials(chat.name)}
                            </span>
                        )}
                    </div>

                    {/* Online status indicator */}
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-telegram-dark"></div>
                    )}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-subtitle text-slate-100 truncate">
                            {chat.name || 'Unknown User'}
                        </h4>
                        <span className="text-caption text-slate-400 flex-shrink-0">
                            {chat.lastMessageTime ? formatChatTime(chat.lastMessageTime) : ''}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-caption text-slate-400 truncate">
                            {truncateMessage(chat.lastMessage)}
                        </p>

                        {/* Unread count badge */}
                        {chat.unreadCount > 0 && (
                            <span className="text-unread flex-shrink-0">
                                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatListItem;
