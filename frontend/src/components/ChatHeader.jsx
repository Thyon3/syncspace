import React from "react";
import { X as XIcon, ArrowLeft, Phone, Video, MoreVertical, Circle } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function ChatHeader() {
    const { selectedUser, setSelectedUser } = useChatStore();

    if (!selectedUser) {
        return (
            <div className="w-full glass-dark border-b border-slate-700/30 py-4 text-center text-slate-400 text-sm">
                Select a conversation to start messaging
            </div>
        );
    }

    const isOnline = selectedUser.isOnline;
    const lastActive = selectedUser.lastActive;

    const formatLastActive = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = (now - date) / (1000 * 60);

        if (diffInMinutes < 1) return "Active now";
        if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return (
        <div className="w-full flex items-center justify-between glass-dark border-b border-slate-700/30 px-4 py-3 shadow-lg">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                {/* Back Button (Mobile) */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-300" />
                </button>

                {/* Avatar and User Info */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={selectedUser.profilePic ?? "/vite.svg"}
                            alt={selectedUser.name ?? "User"}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                        />
                        {/* Online Indicator */}
                        {isOnline ? (
                            <>
                                <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-slate-900"></span>
                                <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                            </>
                        ) : (
                            <span className="absolute bottom-0 right-0 block w-3 h-3 bg-slate-500 rounded-full ring-2 ring-slate-900"></span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-slate-100 font-semibold text-sm truncate">
                            {selectedUser.name ?? "Unknown User"}
                        </h3>
                        <div className="flex items-center gap-1">
                            <Circle className={`w-1.5 h-1.5 fill-current ${isOnline ? 'text-green-400' : 'text-slate-500'
                                }`} />
                            <p className="text-xs text-slate-400 truncate">
                                {isOnline ? 'Active now' : formatLastActive(lastActive)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-1">
                {/* Voice Call Button */}
                <button
                    className="p-2.5 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group hidden sm:flex"
                    title="Voice call"
                >
                    <Phone className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                </button>

                {/* Video Call Button */}
                <button
                    className="p-2.5 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group hidden sm:flex"
                    title="Video call"
                >
                    <Video className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                </button>

                {/* More Options Button */}
                <button
                    className="p-2.5 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
                    title="More options"
                >
                    <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                </button>

                {/* Close Button (Desktop) */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
                    title="Close chat"
                >
                    <XIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                </button>
            </div>
        </div>
    );
}

export default ChatHeader;
