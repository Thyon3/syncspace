import React from 'react';
import { formatMessageTime } from '../lib/utils';
import { FileText, Download, Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';

function MessageBubble({ message, isOwnMessage }) {
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
            <p className="text-message break-words whitespace-pre-wrap">
                {message.text}
            </p>
        );
    };

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1 telegram-fade-in`}>
            <div className={bubbleClass}>
                <div className="flex flex-col">
                    {/* Message content */}
                    {renderContent()}

                    {/* Timestamp and status */}
                    <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-70">
                            {formatMessageTime(message.createdAt)}
                        </span>

                        {/* Read receipts for sent messages */}
                        {isOwnMessage && (
                            <div className="flex items-center">
                                {/* Double check mark for read messages */}
                                {message.isRead ? (
                                    <svg className="w-4 h-4 text-telegram-blue-hover" fill="currentColor" viewBox="0 0 20 20"> {/* Highlighted blue for read */}
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M14.707 5.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L8 10.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;
