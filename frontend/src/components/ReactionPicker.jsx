import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '🤡', '🤔', '💯', '✨'];

function ReactionPicker({ messageId }) {
    const [showPicker, setShowPicker] = useState(false);
    const { toggleReaction } = useChatStore();

    const handleReaction = (emoji) => {
        toggleReaction(messageId, emoji);
        setShowPicker(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-1.5 bg-telegram-sidebar rounded-full hover:bg-slate-700 text-slate-400 hover:text-telegram-blue transition-all shadow-lg flex items-center justify-center"
                title="React"
            >
                <Smile className="w-4 h-4" />
            </button>

            {showPicker && (
                <>
                    {/* Backdrop to close picker */}
                    <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setShowPicker(false)}
                    />
                    <div className="absolute bottom-full mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 flex flex-wrap gap-1 z-[70] w-48 animate-in zoom-in-50 duration-200 origin-bottom">
                        {COMMON_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className="text-xl hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-slate-700/50"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default ReactionPicker;
