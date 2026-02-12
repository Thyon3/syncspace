import React from 'react';
import { useChatStore } from '../store/useChatStore';

const TypingIndicator = () => {
    const { isTyping, typingUser } = useChatStore();

    if (!isTyping || !typingUser) return null;

    return (
        <div className="flex items-center gap-2 mb-2 telegram-fade-in pl-4">
            <div className="flex items-center gap-1 bg-telegram-sidebar px-3 py-2 rounded-xl rounded-tl-none">
                <div className="w-1.5 h-1.5 bg-telegram-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-telegram-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-telegram-blue rounded-full animate-bounce"></div>
            </div>
            <span className="text-caption text-slate-400">
                {typingUser.name} is typing...
            </span>
        </div>
    );
};

export default TypingIndicator;
