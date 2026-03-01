import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { userAuthStore } from "../store/userAuthStore";
import ChatListSkeleton from "../components/ChatListSkeleton";
import NoChatsFound from "../components/noChatsFound";
import { Check, CheckCheck, Pin, Mute, Camera, Users } from "lucide-react";

function ChatsList({ onSelectChat, onCloseMobile, activeFolder = 'all' }) {
    const { isChatLoading, chats, getAllChats, setSelectedChat, onlineUsers, toggleArchive, toggleMute } = useChatStore();
    const { authUser } = userAuthStore();
    const [contextMenu, setContextMenu] = React.useState(null); // { x, y, chatId, isArchived, isMuted }

    useEffect(() => {
        getAllChats();
    }, [getAllChats]);

    if (isChatLoading) return <ChatListSkeleton />;
    if (!chats || chats.length === 0) return <NoChatsFound />;



    const handleChatSelect = (chat) => {
        if (contextMenu) {
            setContextMenu(null);
            return;
        }
        setSelectedChat(chat);
        if (onSelectChat) onSelectChat();
        if (onCloseMobile) onCloseMobile();
    };

    const handleContextMenu = (e, chat) => {
        e.preventDefault();
        const isArchived = chat.archivedBy?.includes(authUser?._id);
        const isMuted = chat.mutedBy?.some(m => m.userId === authUser?._id);

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            chatId: chat._id,
            isArchived,
            isMuted
        });
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

    const filteredChats = chats?.filter(chat => {
        const isArchived = chat.archivedBy?.includes(authUser?._id);

        if (activeFolder === 'archive') return isArchived;
        if (isArchived) return false;

        if (activeFolder === 'personal') return chat.type === 'direct';
        if (activeFolder === 'groups') return chat.type === 'group';

        return true;
    });

    return (
        <div className="flex flex-col h-full bg-telegram-dark relative" onClick={() => setContextMenu(null)}>
            <div className="flex-1 overflow-y-auto">
                {filteredChats?.map((chat, index) => {
                    const displayInfo = getChatDisplayInfo(chat);
                    const lastMessage = chat.lastMessage;

                    return (
                        <div
                            key={chat._id}
                            onClick={() => handleChatSelect(chat)}
                            onContextMenu={(e) => handleContextMenu(e, chat)}
                            className={`telegram-chat-item relative group ${chat._id === useChatStore.getState().selectedChat?._id ? 'telegram-chat-item-active' : ''
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
                                            {chat.mutedBy?.some(m => m.userId === authUser?._id) && (
                                                <Mute className="w-3 h-3 text-slate-500" />
                                            )}
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
                                                    {useChatStore.getState().drafts[chat._id] ? (
                                                        <span className="text-red-500 font-medium">Draft: </span>
                                                    ) : null}
                                                    {useChatStore.getState().drafts[chat._id] || lastMessage?.text || (lastMessage?.image ? "Photo" : (lastMessage?.fileUrl ? "File" : "Start a conversation"))}
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

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-[1000] bg-telegram-sidebar border border-slate-700 rounded-xl shadow-2xl py-1 min-w-[160px] animate-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={() => { toggleArchive(contextMenu.chatId); setContextMenu(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-100 hover:bg-slate-700 transition-colors flex items-center gap-3"
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        {contextMenu.isArchived ? "Unarchive" : "Archive"}
                    </button>
                    <button
                        onClick={() => { toggleMute(contextMenu.chatId); setContextMenu(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-100 hover:bg-slate-700 transition-colors flex items-center gap-3"
                    >
                        <Mute className="w-4 h-4 text-slate-400" />
                        {contextMenu.isMuted ? "Unmute" : "Mute Notifications"}
                    </button>
                    <div className="h-[1px] bg-slate-700 my-1 mx-2"></div>
                    <button
                        onClick={() => setContextMenu(null)}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-3"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

export default ChatsList;
