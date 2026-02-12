import React from "react";
import { X as XIcon, ArrowLeft, Phone, Video, Search, MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { getRelativeTime } from "../lib/utils";

function ChatHeader() {
    const { selectedUser, setSelectedUser } = useChatStore();

    if (!selectedUser) {
        return (
            <div className="telegram-header text-center text-slate-400 text-sm">
                Select a conversation to start messaging
            </div>
        );
    }

    const isOnline = selectedUser.isOnline;

    return (
        <div className="telegram-header flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Back Button (Mobile) */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="lg:hidden telegram-icon-button"
                    title="Back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        {selectedUser.profilePic ? (
                            <img
                                src={selectedUser.profilePic}
                                alt={selectedUser.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-semibold">
                                {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    {/* Online Indicator */}
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-telegram-dark"></div>
                    )}
                </div>

                {/* User Info */}
                <div className="min-w-0 flex-1">
                    <h3 className="text-title text-slate-100 truncate">
                        {selectedUser.name || "Unknown User"}
                    </h3>
                    <p className="text-caption text-slate-400 truncate">
                        {isOnline ? 'online' : getRelativeTime(selectedUser.lastSeen)}
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
