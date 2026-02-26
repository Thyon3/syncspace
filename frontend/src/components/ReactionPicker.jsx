import React, { useState } from 'react';
import { Smile } from 'lucide-react';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'];

function ReactionPicker({ onReact, messageId }) {
    const [showPicker, setShowPicker] = useState(false);

    const handleReaction = (emoji) => {
        onReact(messageId, emoji);
        setShowPicker(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-1 hover:bg-slate-700 rounded transition"
            >
                <Smile size={16} />
            </button>

            {showPicker && (
                <div className="absolute bottom-full mb-2 bg-slate-800 rounded-lg shadow-lg p-2 flex gap-1 z-50">
                    {COMMON_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="text-2xl hover:scale-125 transition p-1"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReactionPicker;
