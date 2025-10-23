import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/usersLoadinSkeleton";
import NoChatsFound from "./noChatsFound";

function ChatsList() {
    const { isChatLoading, chats, getAllChats, setSelectedUser } = useChatStore();

    useEffect(() => {
        getAllChats();
    }, [getAllChats]);

    if (isChatLoading) {
        return <UsersLoadingSkeleton />;
    }

    if (!chats || chats.length === 0) {
        return <NoChatsFound />;
    }

    return (
        <div className="space-y-2 px-2 py-2">
            {chats.map((chat) => (
                <div
                    key={chat._id}
                    onClick={() => setSelectedUser(chat)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-700/30 transition-colors cursor-pointer group"
                >
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={chat.profilePic || "/vite.svg"}
                            alt={chat.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-all"
                        />
                        {/* Online indicator */}
                        {chat.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                        )}
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-slate-100 font-semibold truncate">{chat.name}</h4>
                        {chat.lastMessage && (
                            <p className="text-slate-400 text-sm truncate mt-1">
                                {chat.lastMessage}
                            </p>
                        )}
                    </div>

                    {/* Optional timestamp */}
                    {chat.lastMessageTime && (
                        <span className="text-slate-500 text-xs">
                            {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ChatsList;
