import { FileText, Download, Play, Pause, Reply, Edit, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { userAuthStore } from '../store/userAuthStore';

function MessageBubble({ message, isOwnMessage }) {
    const { selectedChat, setReplyingTo, setEditingMessage, deleteMessage } = useChatStore();
    const { authUser } = userAuthStore();
    const isGroup = selectedChat?.type === 'group';
    const bubbleClass = isOwnMessage
        ? 'telegram-message-bubble-sent ml-auto'
        : 'telegram-message-bubble-received mr-auto';

    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    const renderContent = () => {
        // 1. Image (Legacy or New)
        if (message.image || (message.fileType === 'image' && message.fileUrl)) {
            return (
                <div className="mb-1">
                    <img
                        src={message.image || message.fileUrl}
                        alt="Message attachment"
                        className="rounded-lg max-w-full h-auto object-cover cursor-pointer"
                        loading="lazy"
                    />
                    {message.text && <p className="mt-1 text-message break-words whitespace-pre-wrap">{message.text}</p>}
                </div>
            );
        }

        // 2. File
        if (message.fileType === 'file' && message.fileUrl) {
            return (
                <div className="mb-1">
                    <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg max-w-[250px]">
                        <div className="bg-telegram-blue p-2 rounded-full">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.fileName || 'Document'}</p>
                            <p className="text-xs opacity-70">{message.fileSize || 'Unknown size'}</p>
                        </div>
                        <a
                            href={message.fileUrl}
                            download={message.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-black/10 rounded-full transition-colors"
                        >
                            <Download className="w-5 h-5 opacity-80" />
                        </a>
                    </div>
                    {message.text && <p className="mt-1 text-message break-words whitespace-pre-wrap">{message.text}</p>}
                </div>
            );
        }

        // 3. Audio (Voice)
        if (message.fileType === 'audio' && message.fileUrl) {
            return (
                <div className="mb-1 flex items-center gap-2 min-w-[150px]">
                    <audio
                        ref={audioRef}
                        src={message.fileUrl}
                        className="hidden"
                        onEnded={handleAudioEnded}
                    />
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 bg-telegram-blue hover:bg-telegram-blue-hover rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 text-white fill-current" /> : <Play className="w-5 h-5 text-white fill-current ml-1" />}
                    </button>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="h-1 bg-white/30 rounded-full w-full mb-1 overflow-hidden mt-2">
                            <div className={`h-full bg-white transition-all duration-300 ${isPlaying ? 'w-full animate-[width_linear]' : 'w-0'}`} style={{ width: isPlaying ? '100%' : '0%' }}></div>
                        </div>
                        <p className="text-xs opacity-70">Voice Message</p>
                    </div>
                    {message.text && <p className="mt-1 text-message break-words whitespace-pre-wrap">{message.text}</p>}
                </div>
            );
        }

        // 4. Text Only
        return (
            <p className={`text-message break-words whitespace-pre-wrap ${message.isDeleted ? 'italic opacity-60' : ''}`}>
                {message.text}
            </p>
        );
    };

    if (message.isDeleted) {
        return (
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1 telegram-fade-in`}>
                <div className={bubbleClass + ' opacity-50 italic text-[13px] py-1 px-3 border border-slate-700/30'}>
                    Message deleted
                </div>
            </div>
        );
    }

    return (
        <div id={`msg-${message._id}`} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1 telegram-fade-in group relative`}>
            <div className={bubbleClass}>
                <div className="flex flex-col">
                    {/* Reply Context */}
                    {message.replyTo && (
                        <div
                            className="bg-black/10 border-l-2 border-telegram-blue p-1.5 mb-1 rounded-sm cursor-pointer hover:bg-black/20 transition-colors"
                            onClick={() => {
                                // Scroll to message logic could be added here
                                const el = document.getElementById(`msg-${message.replyTo._id}`);
                                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                        >
                            <p className="text-[11px] font-bold text-telegram-blue truncate">
                                {message.replyTo.senderId?.name || "User"}
                            </p>
                            <p className="text-[12px] text-slate-300 truncate opacity-80">
                                {message.replyTo.text || (message.replyTo.image ? "Photo" : "Attachment")}
                            </p>
                        </div>
                    )}

                    {/* Message content */}
                    {renderContent()}

                    {/* Timestamp and status */}
                    <div className="flex items-center justify-end gap-1.5 mt-0.5 select-none">
                        {message.isEdited && (
                            <span className="text-[10px] opacity-50 italic">edited</span>
                        )}
                        <span className="text-[10px] opacity-70">
                            {formatMessageTime(message.createdAt)}
                        </span>

                        {/* Read receipts for sent messages */}
                        {isOwnMessage && (
                            <div className="flex items-center">
                                {/* Double check mark for read messages */}
                                {message.isRead ? (
                                    <svg className="w-3.5 h-3.5 text-telegram-blue-hover" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M14.707 5.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L8 10.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-3.5 h-3.5 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Actions Menu (Absolute positioned or sibling) */}
                <div className={`message-actions absolute ${isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <button
                        onClick={() => setReplyingTo(message)}
                        className="p-1.5 bg-telegram-sidebar rounded-full hover:bg-slate-700 text-slate-400 hover:text-telegram-blue transition-all shadow-lg"
                        title="Reply"
                    >
                        <Reply className="w-4 h-4" />
                    </button>
                    {isOwnMessage && (
                        <>
                            <button
                                onClick={() => setEditingMessage(message)}
                                className="p-1.5 bg-telegram-sidebar rounded-full hover:bg-slate-700 text-slate-400 hover:text-emerald-500 transition-all shadow-lg"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm("Delete this message?")) {
                                        deleteMessage(message._id);
                                    }
                                }}
                                className="p-1.5 bg-telegram-sidebar rounded-full hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-all shadow-lg"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;
