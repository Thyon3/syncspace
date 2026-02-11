import React, { useState, useEffect } from "react";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactsList from "../components/ContactsList";
import ChatContainer from "../components/ChatContainer";
import NoSelectedUserPlaceHolder from "../components/NoSelectedUserPlaceHolder";
import { useChatStore } from "../store/useChatStore";

function ChatPage() {
    const { activeTab, selectedUser } = useChatStore();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showList, setShowList] = useState(true); // mobile: show list initially
    const [sidebarWidth, setSidebarWidth] = useState(300); // desktop: initial sidebar width

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Mobile handlers
    const handleSelectChat = () => setShowList(false);
    const handleBackToList = () => setShowList(true);

    // Mobile layout
    if (isMobile) {
        return (
            <div className="w-full h-screen flex flex-col bg-slate-900">
                {showList ? (
                    <div className="flex-1 flex flex-col">
                        <ProfileHeader />
                        <ActiveTabSwitch />
                        {activeTab === "chats" ? (
                            <ChatsList onSelectChat={handleSelectChat} />
                        ) : (
                            <ContactsList onSelectChat={handleSelectChat} />
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        {/* Back button */}
                        <div className="flex items-center p-4 bg-slate-800 border-b border-slate-700">
                            <button
                                onClick={handleBackToList}
                                className="text-cyan-400 font-semibold mr-4"
                            >
                                Back
                            </button>
                            <h2 className="text-slate-100 font-semibold">
                                {selectedUser?.name || "Chat"}
                            </h2>
                        </div>
                        {/* Chat container */}
                        <ChatContainer />
                    </div>
                )}
            </div>
        );
    }

    // Desktop layout (full screen)
    return (
        <div className="relative w-full h-screen flex rounded-lg overflow-hidden">
            {/* Sidebar */}
            <div
                className="flex flex-col bg-slate-900 backdrop-blur-sm"
                style={{ width: sidebarWidth }}
            >
                <ProfileHeader />
                <ActiveTabSwitch />
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-900">
                    {activeTab === "chats" ? <ChatsList /> : <ContactsList />}
                </div>
            </div>

            {/* Drag bar */}
            <div
                className="cursor-col-resize w-1 bg-slate-700/50 hover:bg-cyan-500 transition-colors"
                onMouseDown={(e) => {
                    e.preventDefault();
                    const handleMouseMove = (event) => {
                        const newWidth = event.clientX;
                        if (newWidth > 200 && newWidth < 500) setSidebarWidth(newWidth);
                    };
                    const handleMouseUp = () => {
                        window.removeEventListener("mousemove", handleMouseMove);
                        window.removeEventListener("mouseup", handleMouseUp);
                    };
                    window.addEventListener("mousemove", handleMouseMove);
                    window.addEventListener("mouseup", handleMouseUp);
                }}
            />

            {/* Chat container */}
            <div className="flex-1 flex flex-col bg-slate-800/90 backdrop-blur-md">
                {selectedUser ? (
                    <ChatContainer />
                ) : (
                    <NoSelectedUserPlaceHolder />
                )}
            </div>
        </div>
    );
}

export default ChatPage;
