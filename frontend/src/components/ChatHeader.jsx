import React from "react";
import { X as XIcon, ArrowLeft } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function ChatHeader() {
    const { selectedUser, setSelectedUser } = useChatStore();

    if (!selectedUser) {
        return (
            <div className="w-full bg-slate-900/70 backdrop-blur-md border-b border-slate-700 py-4 text-center text-slate-400 text-sm">
                No user selected
            </div>
        );
    }

    return (
        <div className="w-full flex items-center justify-between bg-slate-900/70 backdrop-blur-md border-b border-slate-700 px-4 py-3 shadow-sm">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                {/* Back Button (like Telegram mobile header) */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-full hover:bg-slate-800 transition"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-300" />
                </button>

                {/* Avatar and User Info */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={selectedUser.profilePic ?? "/vite.png"}
                            alt={selectedUser.name ?? "User"}
                            className="w-12 h-12 rounded-full object-cover border border-slate-700"
                        />
                        {/* Online Indicator */}
                        <span className="absolute bottom-1 right-1 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-slate-900" />
                    </div>

                    <div>
                        <h3 className="text-slate-100 font-semibold text-[16px]">
                            {selectedUser.name ?? "Unknown User"}
                        </h3>
                        <p className="text-green-400 text-sm font-light">online</p>
                    </div>
                </div>
            </div>

            {/* Right Section (Close Icon on desktop) */}
            <button
                onClick={() => setSelectedUser(null)}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-800 transition"
            >
                <XIcon className="w-5 h-5 text-slate-300" />
            </button>
        </div>
    );
}

export default ChatHeader;
