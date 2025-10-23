import React, { useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import ProfileHeader from '../components/ProfileHeader';
import ActiveTabSwitch from '../components/ActiveTabSwitch';
import ChatsList from '../components/ChatsList';
import ContactsList from '../components/ContactsList';
import ChatContainer from '../components/ChatContainer';
import NoSelectedUserPlaceHolder from '../components/NoSelectedUserPlaceHolder';

function ChatPage() {
    const { activeTab, selectedUser } = useChatStore();
    const [sidebarWidth, setSidebarWidth] = useState(300); // initial width in px
    const sidebarRef = useRef(null);
    const isResizingRef = useRef(false);

    const startResizing = () => {
        isResizingRef.current = true;
        document.body.style.cursor = 'col-resize';
    };

    const stopResizing = () => {
        isResizingRef.current = false;
        document.body.style.cursor = 'default';
    };

    const resizeSidebar = (e) => {
        if (!isResizingRef.current) return;
        const newWidth = e.clientX;
        if (newWidth < 200) return; // min width
        if (newWidth > 500) return; // max width
        setSidebarWidth(newWidth);
    };

    return (
        <div
            className="relative w-full max-w-7xl h-[900px] flex rounded-xl shadow-lg overflow-hidden select-none"
            onMouseMove={resizeSidebar}
            onMouseUp={stopResizing}
        >
            {/* LEFT PANEL */}
            <div
                ref={sidebarRef}
                style={{ width: sidebarWidth }}
                className="flex flex-col bg-slate-900/80 backdrop-blur-md border-r border-slate-700 transition-all"
            >
                <ProfileHeader />
                <ActiveTabSwitch />
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {activeTab === 'chats' ? <ChatsList /> : <ContactsList />}
                </div>
            </div>

            {/* RESIZE BAR */}
            <div
                onMouseDown={startResizing}
                className="w-1 cursor-col-resize bg-slate-700/50 hover:bg-slate-500 transition-colors"
            ></div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex flex-col bg-slate-800/80 backdrop-blur-md">
                {selectedUser ? <ChatContainer /> : <NoSelectedUserPlaceHolder />}
            </div>
        </div>
    );
}

export default ChatPage;
