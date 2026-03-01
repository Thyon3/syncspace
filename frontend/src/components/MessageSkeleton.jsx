import React from 'react';

const MessageSkeleton = () => {
    const skeletonMessages = Array(6).fill(null);

    return (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            {skeletonMessages.map((_, idx) => {
                const isMe = idx % 2 === 0;
                return (
                    <div
                        key={idx}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-pulse`}
                    >
                        <div className={`flex flex-col gap-1 max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                            {!isMe && <div className="h-3 bg-slate-700/30 rounded-md w-20 mb-1" />}
                            <div
                                className={`
                  h-12 rounded-2xl p-4 
                  ${isMe
                                        ? 'bg-telegram-blue/20 rounded-tr-none w-48'
                                        : 'bg-slate-800/40 rounded-tl-none w-64'}
                `}
                            />
                            <div className="h-2 bg-slate-800/30 rounded-md w-12 mt-1" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MessageSkeleton;
