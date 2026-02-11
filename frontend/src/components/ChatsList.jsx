import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/usersLoadinSkeleton";
import NoChatsFound from "../components/noChatsFound";
import { XIcon, Check, CheckCheck } from "lucide-react";

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
        <div className="flex flex-col h-full bg-slate-900/20">
            {/* Mobile header */}
            {onCloseMobile && (
                <div className="md:hidden glass-dark border-b border-slate-700/30 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-slate-200 font-semibold text-lg">Messages</h2>
                        <button
                            onClick={onCloseMobile}
                            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                            <XIcon className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chats.map((chat) => (
                    <div
                        key={chat._id}
                        onClick={() => handleChatSelect(chat)}
                        className="group relative flex items-center gap-3 p-3 rounded-xl glass hover:glass-dark transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-slate-700/30 hover:border-cyan-500/30"
                    >
                        {/* Unread indicator */}
                        {chat.unreadCount > 0 && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-r-full"></div>
                        )}

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="relative">
                                <img
                                    src={chat.profilePic || "/vite.svg"}
                                    alt={chat.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 group-hover:border-cyan-400 transition-all duration-200"
                                />
                                {chat.isOnline && (
                                    <>
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="text-slate-100 font-semibold truncate text-sm">
                                    {chat.name}
                                </h4>
                                <span className="text-slate-500 text-xs flex-shrink-0">
                                    {formatMessageTime(chat.lastMessageTime)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1 min-w-0">
                                    {chat.lastMessageSender === 'me' && (
                                        chat.isMessageRead ? (
                                            <CheckCheck className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                        ) : (
                                            <Check className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                        )
                                    )}
                                    <p className="text-slate-400 text-sm truncate">
                                        {chat.lastMessage || "Start a conversation"}
                                    </p>
                                </div>

                                {chat.unreadCount > 0 && (
                                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex-shrink-0">
                                        {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatsList;
