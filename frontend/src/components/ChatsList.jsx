import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/usersLoadinSkeleton";
import NoChatsFound from "../components/noChatsFound";
import { Check, CheckCheck, Pin, Mute, Camera } from "lucide-react";

import { useChatStore } from "../store/useChatStore";
import { userAuthStore } from "../store/userAuthStore";
import UsersLoadingSkeleton from "../components/usersLoadinSkeleton";
import NoChatsFound from "../components/noChatsFound";
import { Check, CheckCheck, Pin, Mute, Camera, Users } from "lucide-react";

function ChatsList({ onSelectChat, onCloseMobile }) {
    const { isChatLoading, chats, getAllChats, setSelectedChat, onlineUsers } = useChatStore();
    const { authUser } = userAuthStore();

    useEffect(() => {
        getAllChats();
    }, [getAllChats]);

    if (isChatLoading) return <UsersLoadingSkeleton />;
    if (!chats || chats.length === 0) return <NoChatsFound />;



    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        if (onSelectChat) onSelectChat();
        if (onCloseMobile) onCloseMobile();
    };

    const getChatDisplayInfo = (chat) => {
        if (chat.type === 'group') {
            return {
                name: chat.groupName,
                image: chat.groupImage,
                isOnline: false, // Groups don't have online status generally (or maybe count online members)
                isGroup: true
            };
        } else {
            // Direct Chat
            const otherMemberId = chat.members.find(id => id._id !== authUser?._id)?._id;
            const otherMember = chat.members.find(id => id._id !== authUser?._id);

            // If otherMember is populated object
            const name = otherMember?.name || "User";
            const image = otherMember?.profilePic;
            const isOnline = otherMemberId ? onlineUsers.includes(otherMemberId) : false;

            return {
                name,
                image,
                isOnline,
                isGroup: false
            };
        }
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
            <div className="flex-1 overflow-y-auto">
                {chats.map((chat, index) => {
                    const displayInfo = getChatDisplayInfo(chat);
                    const lastMessage = chat.lastMessage;

                    return (
                        <div
                            key={chat._id}
                            onClick={() => handleChatSelect(chat)}
                            className={`telegram-chat-item relative group ${index === 0 ? 'telegram-chat-item-active' : ''
                                }`}
                        >
                            {/* Pinned indicator */}
                            {false && ( // TODO: Implement pinning
                                <Pin className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 opacity-50" />
                            )}

                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={displayInfo.image || "/vite.svg"}
                                        alt={displayInfo.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                                    />
                                    {/* Online indicator */}
                                    {displayInfo.isOnline && (
                                        <>
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-telegram-dark rounded-full"></span>
                                        </>
                                    )}
                                </div>

                                {/* Chat Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="text-subtitle text-slate-100 truncate flex items-center gap-2">
                                            {displayInfo.name}
                                            {displayInfo.isGroup && <Users className="w-3 h-3 text-slate-400" />}
                                        </h4>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <span className="text-caption text-slate-400">
                                                {formatMessageTime(chat.updatedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1 min-w-0">
                                            {/* Message status indicators */}
                                            {lastMessage?.senderId?._id === authUser?._id && (
                                                <div className="flex-shrink-0">
                                                    {lastMessage?.isRead ? (
                                                        <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5 text-slate-400" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Message preview */}
                                            <div className="flex items-center gap-1 min-w-0">
                                                {lastMessage?.image && (
                                                    <Camera className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                )}
                                                <p className="text-message text-slate-300 truncate">
                                                    {lastMessage?.text || (lastMessage?.image ? "Photo" : (lastMessage?.fileUrl ? "File" : "Start a conversation"))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>

    );
}

export default ChatsList;
