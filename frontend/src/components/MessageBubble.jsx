import React from 'react';
import { formatMessageTime } from '../lib/utils';

function MessageBubble({ message, isOwnMessage }) {
    const bubbleClass = isOwnMessage
        ? 'telegram-message-bubble-sent ml-auto'
        : 'telegram-message-bubble-received mr-auto';

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1 telegram-fade-in`}>
            <div className={bubbleClass}>
                <div className="flex flex-col">
                    {/* Message content */}
                    <p className="text-message break-words whitespace-pre-wrap">
                        {message.text}
                    </p>

                    {/* Timestamp and status */}
                    <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-70">
                            {formatMessageTime(message.createdAt)}
                        </span>

                        {/* Read receipts for sent messages */}
                        {isOwnMessage && (
                            <div className="flex items-center">
                                {/* Double check mark for read messages */}
                                <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M14.707 5.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L8 10.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;
