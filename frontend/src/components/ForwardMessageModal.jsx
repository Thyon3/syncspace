import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

function ForwardMessageModal({ message, chats, onForward, onClose }) {
    const [selectedChats, setSelectedChats] = useState([]);

    const toggleChat = (chatId) => {
        setSelectedChats(prev =>
            prev.includes(chatId)
                ? prev.filter(id => id !== chatId)
                : [...prev, chatId]
        );
    };

    const handleForward = () => {
        if (selectedChats.length > 0) {
            onForward(message._id, selectedChats);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Forward Message</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-slate-700 rounded">
                    <p className="text-sm text-slate-300 line-clamp-2">
                        {message.text || 'Media message'}
                    </p>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                    {chats.map((chat) => (
                        <label
                            key={chat._id}
                            className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedChats.includes(chat._id)}
                                onChange={() => toggleChat(chat._id)}
                                className="w-4 h-4"
                            />
                            <span>{chat.groupName || chat.members[0]?.name || 'Unknown'}</span>
                        </label>
                    ))}
                </div>

                <button
                    onClick={handleForward}
                    disabled={selectedChats.length === 0}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded flex items-center justify-center gap-2 transition"
                >
                    <Send size={18} />
                    Forward to {selectedChats.length} chat{selectedChats.length !== 1 ? 's' : ''}
                </button>
            </div>
        </div>
    );
}

export default ForwardMessageModal;
