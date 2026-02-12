import React from "react";
import { X as XIcon, ArrowLeft, Phone, Video, Search, MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { getRelativeTime } from "../lib/utils";

function ChatHeader() {
    const { selectedUser, setSelectedUser, selectedChat, setSelectedChat, onlineUsers } = useChatStore();

    if (!selectedUser && !selectedChat) {
        return (
            <div className="telegram-header text-center text-slate-400 text-sm">
                Select a conversation to start messaging
            </div>
        );
    }

    const isGroup = selectedChat?.type === 'group';
    const displayInfo = isGroup ? {
        name: selectedChat.groupName,
        image: selectedChat.groupImage,
        status: `${selectedChat.members?.length || 0} members`,
        isOnline: false
    } : {
        name: selectedUser?.name || "User",
        image: selectedUser?.profilePic,
        status: (selectedUser?.isOnline || onlineUsers.includes(selectedUser?._id)) ? 'online' : getRelativeTime(selectedUser?.lastSeen),
        isOnline: (selectedUser?.isOnline || onlineUsers.includes(selectedUser?._id))
    };

    const handleBack = () => {
        if (selectedUser) setSelectedUser(null);
        if (selectedChat) setSelectedChat(null);
    };

    return (
        <div className="telegram-header flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Back Button (Mobile) */}
                <button
                    onClick={handleBack}
                    className="lg:hidden telegram-icon-button"
                    title="Back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                        {displayInfo.image ? (
                            <img
                                src={displayInfo.image}
                                alt={displayInfo.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-semibold">
                                {displayInfo.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    {/* Online Indicator */}
                    {displayInfo.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-telegram-dark"></div>
                    )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <h3 className="text-title text-slate-100 truncate">
                        {displayInfo.name}
                    </h3>
                    <p className="text-caption text-slate-400 truncate">
                        {displayInfo.status}
                    </p>
                </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-1">
                {/* Search Button */}
                <button
                    className="telegram-icon-button hidden sm:flex"
                    title="Search"
                >
                    <Search className="w-5 h-5" />
                </button>

                {/* Voice Call Button */}
                <button
                    className="telegram-icon-button hidden sm:flex"
                    title="Voice call"
                >
                    <Phone className="w-5 h-5" />
                </button>

                {/* More Options Button */}
                <button
                    className="telegram-icon-button"
                    title="More options"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default ChatHeader;
