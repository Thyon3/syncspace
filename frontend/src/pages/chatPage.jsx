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
    const [showList, setShowList] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(320);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSelectChat = () => setShowList(false);
    const handleBackToList = () => setShowList(true);

    // Mobile layout
    if (isMobile) {
        return (
            <div className="w-full h-screen flex flex-col bg-gradient-dark">
                {showList ? (
                    <div className="flex-1 flex flex-col">
                        <div className="glass-dark border-b border-slate-700/30">
                            <ProfileHeader />
                        </div>
                        <div className="glass-dark border-b border-slate-700/30">
                            <ActiveTabSwitch />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {activeTab === "chats" ? (
                                <ChatsList onSelectChat={handleSelectChat} />
                            ) : (
                                <ContactsList onSelectChat={handleSelectChat} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="glass-dark border-b border-slate-700/30 p-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleBackToList}
                                    className="btn-primary p-2 rounded-lg flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back
                                </button>
                                <h2 className="text-lg font-semibold text-slate-200 truncate">
                                    {selectedUser?.name || "Chat"}
                                </h2>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-900/40">
                            <ChatContainer />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Desktop layout
    return (
        <div className="relative w-full h-screen flex bg-gradient-dark overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            {/* Sidebar */}
            <div
                className="flex flex-col glass-dark border-r border-slate-700/30 shadow-2xl z-10"
                style={{ width: sidebarWidth }}
            >
                <div className="border-b border-slate-700/30">
                    <ProfileHeader />
                </div>
                <div className="border-b border-slate-700/30">
                    <ActiveTabSwitch />
                </div>
                <div className="flex-1 overflow-hidden">
                    {activeTab === "chats" ? <ChatsList /> : <ContactsList />}
                </div>
            </div>

            {/* Resize handle */}
            <div
                className="cursor-col-resize w-1 bg-slate-700/30 hover:bg-cyan-500/50 transition-all duration-200 z-20 group"
                onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startWidth = sidebarWidth;

                    const handleMouseMove = (event) => {
                        const deltaX = event.clientX - startX;
                        const newWidth = Math.max(280, Math.min(500, startWidth + deltaX));
                        setSidebarWidth(newWidth);
                    };

                    const handleMouseUp = () => {
                        window.removeEventListener("mousemove", handleMouseMove);
                        window.removeEventListener("mouseup", handleMouseUp);
                    };

                    window.addEventListener("mousemove", handleMouseMove);
                    window.addEventListener("mouseup", handleMouseUp);
                }}
            >
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col bg-slate-900/20 backdrop-blur-sm">
                {selectedUser ? (
                    <div className="flex-1 flex flex-col fade-in">
                        <ChatContainer />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <NoSelectedUserPlaceHolder />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;
