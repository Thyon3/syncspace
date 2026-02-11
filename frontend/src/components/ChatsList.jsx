import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/usersLoadinSkeleton";
import NoChatsFound from "../components/noChatsFound";
import { Check, CheckCheck, Pin, Mute, Camera } from "lucide-react";

function ChatsList({ onSelectChat, onCloseMobile }) {
    const { isChatLoading, chats, getAllChats, setSelectedUser } = useChatStore();

    useEffect(() => {
        getAllChats();
    }, [getAllChats]);

    if (isChatLoading) return <UsersLoadingSkeleton />;
    if (!chats || chats.length === 0) return <NoChatsFound />;

    const handleChatSelect = (chat) => {
        setSelectedUser(chat);
        if (onSelectChat) onSelectChat();
        if (onCloseMobile) onCloseMobile();
    };

    const formatMessageTime = (time) => {
        if (!time) return "";
        const date = new Date(time);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (diffInHours < 48) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-telegram-dark">
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {chats.map((chat, index) => (
                    <div
                        key={chat._id}
                        onClick={() => handleChatSelect(chat)}
                        className={`telegram-chat-item relative group ${index === 0 ? 'telegram-chat-item-active' : ''
                            }`}
                    >
                        {/* Pinned indicator */}
                        {index < 2 && (
                            <Pin className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 opacity-50" />
                        )}

                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <img
                                    src={chat.profilePic || "/vite.svg"}
                                    alt={chat.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                                />
                                {/* Online indicator */}
                                {chat.isOnline && (
                                    <>
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-telegram-dark rounded-full"></span>
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full animate-ping"></span>
                                    </>
                                )}
                                {/* Last seen indicator for offline */}
                                {!chat.isOnline && chat.lastSeen && (
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-600 border-2 border-telegram-dark rounded-full"></span>
                                )}
                            </div>

                            {/* Chat Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="text-subtitle text-slate-100 truncate flex items-center gap-2">
                                        {chat.name}
                                        {chat.isVerified && (
                                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </h4>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {chat.isPinned && (
                                            <Pin className="w-3 h-3 text-slate-500" />
                                        )}
                                        {chat.isMuted && (
                                            <Mute className="w-3 h-3 text-slate-500" />
                                        )}
                                        <span className="text-caption text-slate-400">
                                            {formatMessageTime(chat.lastMessageTime)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1 min-w-0">
                                        {/* Message status indicators */}
                                        {chat.lastMessageSender === 'me' && (
                                            <div className="flex-shrink-0">
                                                {chat.isMessageRead ? (
                                                    <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5 text-slate-400" />
                                                )}
                                            </div>
                                        )}

                                        {/* Message preview */}
                                        <div className="flex items-center gap-1 min-w-0">
                                            {chat.lastMessageType === 'photo' && (
                                                <Camera className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                            )}
                                            {chat.lastMessageType === 'video' && (
                                                <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                </svg>
                                            )}
                                            {chat.lastMessageType === 'voice' && (
                                                <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <p className="text-message text-slate-300 truncate">
                                                {chat.lastMessage || "Start a conversation"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Unread count */}
                                    {chat.unreadCount > 0 && (
                                        <span className="text-unread flex-shrink-0">
                                            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-telegram-hover opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatsList;
