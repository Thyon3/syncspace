import { FileText, Download, Play, Pause, Reply, Edit, Trash2, Pin, Forward } from 'lucide-react';
import { useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { userAuthStore } from '../store/userAuthStore';
import { formatMessageTime } from '../lib/utils';
import { parseRichText } from '../lib/textParser';
import ReactionPicker from './ReactionPicker';
import ForwardModal from './ForwardModal';

function MessageBubble({ message, isOwnMessage }) {
    const { selectedChat, setReplyingTo, setEditingMessage, deleteMessage, toggleReaction, pinMessage } = useChatStore();
    const { authUser } = userAuthStore();
    const [showForwardModal, setShowForwardModal] = useState(false);

    const isAdmin = selectedChat?.admin === authUser?._id || selectedChat?.admin?._id === authUser?._id;
    const isModerator = selectedChat?.moderators?.some(m => m === authUser?._id || m?._id === authUser?._id);
    const canPin = selectedChat?.type === 'group' && (isAdmin || isModerator);
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
        if (message.image || (message.fileType === 'image' && message.fileUrl)) {
            return (
                <div className="mb-1">
                    <img
                        src={message.image || message.fileUrl}
                        alt="Message attachment"
                        className="rounded-lg max-w-full h-auto object-cover cursor-pointer"
                        loading="lazy"
                    />
                    {message.text && <p className="mt-1 text-message break-words whitespace-pre-wrap">{parseRichText(message.text)}</p>}
                </div>
            );
        }

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
                    {message.text && <p className="mt-1 text-message break-words whitespace-pre-wrap">{parseRichText(message.text)}</p>}
                </div>
            );
        }

        if (message.fileType === 'audio' && message.fileUrl) {
            return (
                <div className="mb-1 flex items-center gap-2 min-w-[200px]">
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
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="h-1 bg-white/20 rounded-full w-full overflow-hidden">
                            <div className={`h-full bg-white transition-all ${isPlaying ? 'w-full duration-[30s]' : 'w-0'}`} />
                        </div>
                        <p className="text-[10px] opacity-70">Voice Message</p>
                    </div>
                    {message.text && <p className="mt-1 text-message break-words whitespace-pre-wrap">{parseRichText(message.text)}</p>}
                </div>
            );
        }

        return (
            <p className={`text-message break-words whitespace-pre-wrap ${message.isDeleted ? 'italic opacity-60' : ''}`}>
                {parseRichText(message.text)}
            </p>
        );
    };

    if (message.isServiceMessage) {
        return (
            <div className="flex justify-center my-3 telegram-fade-in px-4">
                <div className="bg-black/20 backdrop-blur-md px-4 py-1 rounded-full text-[12px] text-slate-300 font-medium text-center shadow-sm border border-white/5">
                    {message.text}
                </div>
            </div>
        );
    }

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
                                const el = document.getElementById(`msg-${message.replyTo._id}`);
                                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                        >
                            <p className="text-[11px] font-bold text-telegram-blue truncate">
                                {message.replyTo.senderId?.name || "User"}
                            </p>
                            <p className="text-[12px] text-slate-300 truncate opacity-80">
                                {typeof message.replyTo.text === 'string' ? message.replyTo.text.substring(0, 50) : (message.replyTo.image ? "Photo" : "Attachment")}
                            </p>
                        </div>
                    )}

                    {/* Forwarded Header */}
                    {message.forwardFrom && (
                        <div className="mb-1 flex items-center gap-1.5 opacity-80 px-1 border-l-2 border-telegram-blue/30 ml-0.5">
                            <Forward className="w-3 h-3 text-telegram-blue" />
                            <span className="text-[11px] font-medium text-telegram-blue italic">
                                Forwarded from {message.forwardFrom?.name || "User"}
                            </span>
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

                        {isOwnMessage && (
                            <div className="flex items-center">
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

                    {/* Reactions Display */}
                    {message.reactions?.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(
                                message.reactions.reduce((acc, curr) => {
                                    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                                    return acc;
                                }, {})
                            ).map(([emoji, count]) => {
                                const hasReacted = message.reactions.some(r => r.userId === authUser?._id && r.emoji === emoji);
                                return (
                                    <button
                                        key={emoji}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleReaction(message._id, emoji);
                                        }}
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] transition-all border
                                            ${hasReacted
                                                ? 'bg-telegram-blue/20 border-telegram-blue/40 text-white'
                                                : 'bg-black/10 border-transparent text-slate-300 hover:bg-black/20'}`}
                                    >
                                        <span>{emoji}</span>
                                        {count > 1 && <span className="font-bold opacity-90">{count}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Actions Menu */}
                <div className={`absolute ${isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                    <ReactionPicker messageId={message._id} />
                    <button
                        onClick={() => setReplyingTo(message)}
                        className="p-1.5 bg-telegram-sidebar rounded-full hover:bg-slate-700 text-slate-400 hover:text-telegram-blue transition-all"
                        title="Reply"
                    >
                        <Reply className="w-4 h-4" />
                    </button>
                    {canPin && (
                        <button
                            onClick={() => pinMessage(selectedChat._id, message._id)}
                            className="p-1.5 bg-telegram-sidebar rounded-full hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-all"
                            title="Pin"
                        >
                            <Pin className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setShowForwardModal(true)}
                        className="p-1.5 bg-telegram-sidebar rounded-full hover:bg-slate-700 text-slate-400 hover:text-green-400 transition-all"
                        title="Forward"
                    >
                        <Forward className="w-4 h-4" />
                    </button>
                    {isOwnMessage && (
                        <>
                            <button
                                onClick={() => setEditingMessage(message)}
                                className="p-1.5 bg-telegram-sidebar rounded-full hover:bg-slate-700 text-slate-400 hover:text-emerald-500 transition-all"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm("Delete message?")) deleteMessage(message._id);
                                }}
                                className="p-1.5 bg-telegram-sidebar rounded-full hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-all"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showForwardModal && (
                <ForwardModal
                    message={message}
                    onClose={() => setShowForwardModal(false)}
                />
            )}
        </div>
    );
}

export default MessageBubble;
