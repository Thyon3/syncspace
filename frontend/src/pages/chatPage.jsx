import React, { useState } from 'react';
import ProfileHeader from '../components/ProfileHeader';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import ChatsList from '../components/ChatsList';
import ContactsList from '../components/ContactsList';
import ChatContainer from '../components/ChatContainer';
import NoSelectedUserPlaceHolder from '../components/NoSelectedUserPlaceHolder';
import { useChatStore } from '../store/useChatStore';

function ChatPage() {
    const { activeTab, selectedUser } = useChatStore();
    const [sidebarWidth, setSidebarWidth] = useState(300); // Initial width of left panel

    // For dragging the sidebar
    const handleMouseMove = (e) => {
        const newWidth = e.clientX;
        if (newWidth > 200 && newWidth < 500) setSidebarWidth(newWidth);
    };

    return (
        <div className="relative w-full max-w-6xl h-[900px] flex rounded-lg overflow-hidden">
            {/* LEFT PANEL */}
            <div
                className="flex flex-col bg-slate-900 backdrop-blur-sm"
                style={{ width: sidebarWidth }}
            >
                <ProfileHeader />
                <ActiveTabSwitch />
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-900">
                    {activeTab === 'chats' ? <ChatsList /> : <ContactsList />}
                </div>
            </div>

            {/* DRAG BAR */}
            <div
                className="cursor-col-resize w-1 bg-slate-700/50 hover:bg-cyan-500 transition-colors"
                onMouseDown={(e) => {
                    e.preventDefault();
                    const handleMouseUp = () => {
                        window.removeEventListener('mousemove', handleMouseMove);
                        window.removeEventListener('mouseup', handleMouseUp);
                    };
                    window.addEventListener('mousemove', handleMouseMove);
                    window.addEventListener('mouseup', handleMouseUp);
                }}
            />

            {/* RIGHT PANEL */}
            <div className="flex-1 flex flex-col bg-slate-800/90 backdrop-blur-md">
                {selectedUser ? <ChatContainer /> : <NoSelectedUserPlaceHolder />}
            </div>
        </div>
    );
}

export default ChatPage;
