import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { X, Search, Send, User, Users, Check, EyeOff } from 'lucide-react';

function ForwardModal({ message, onClose }) {
    const { chats, forwardMessages } = useChatStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedChatIds, setSelectedChatIds] = useState([]);
    const [hideSender, setHideSender] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredChats = chats.filter(chat => {
        const name = chat.type === 'direct'
            ? chat.participants[0]?.name
            : chat.groupName;
        return name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const toggleChat = (chatId) => {
        if (selectedChatIds.includes(chatId)) {
            setSelectedChatIds(selectedChatIds.filter(id => id !== chatId));
        } else {
            setSelectedChatIds([...selectedChatIds, chatId]);
        }
    };

    const handleForward = async () => {
        if (selectedChatIds.length === 0) return;
        setIsSubmitting(true);
        try {
            await forwardMessages(message._id, selectedChatIds, hideSender);
            onClose();
        } catch (error) {
            console.error("Forwarding failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-telegram-sidebar w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-slate-700">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-telegram-sidebar/50">
                    <h3 className="text-lg font-bold text-white">Forward Message</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-telegram-dark border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-telegram-blue"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Chats List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {filteredChats.length > 0 ? (
                        filteredChats.map(chat => {
                            const isSelected = selectedChatIds.includes(chat._id);
                            const chatName = chat.type === 'direct'
                                ? (chat.participants[0]?.name || "User")
                                : (chat.groupName || "Group");

                            return (
                                <div
                                    key={chat._id}
                                    onClick={() => toggleChat(chat._id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-telegram-blue/20' : 'hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="relative">
                                        {chat.type === 'direct' ? (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
                                                <User className="w-6 h-6 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center">
                                                <Users className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-telegram-blue rounded-full border-2 border-telegram-sidebar flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{chatName}</p>
                                        <p className="text-xs text-slate-400">
                                            {chat.type === 'group' ? `${chat.members?.length || 0} members` : 'Direct message'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                            <Search className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">No chats found</p>
                        </div>
                    )}
                </div>

                {/* Footer Options */}
                <div className="p-4 bg-telegram-dark/50 border-t border-slate-700 flex flex-col gap-4">
                    <button
                        onClick={() => setHideSender(!hideSender)}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-all text-sm self-start ${hideSender ? 'text-telegram-blue bg-telegram-blue/10' : 'text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        <EyeOff className="w-4 h-4" />
                        <span>Hide original sender's name</span>
                    </button>

                    <button
                        onClick={handleForward}
                        disabled={selectedChatIds.length === 0 || isSubmitting}
                        className="w-full bg-telegram-blue hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Forward to {selectedChatIds.length} {selectedChatIds.length === 1 ? 'chat' : 'chats'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ForwardModal;
