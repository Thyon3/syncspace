import React from 'react';

const ChatListSkeleton = () => {
    const skeletonItems = Array(8).fill(null);

    return (
        <div className="flex flex-col gap-1 p-2">
            {skeletonItems.map((_, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                >
                    {/* Avatar Skeleton */}
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-700/50" />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-slate-800 border-2 border-telegram-sidebar" />
                    </div>

                    {/* Text Content Skeleton */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="h-4 bg-slate-700/50 rounded-md w-24" />
                            <div className="h-3 bg-slate-800/50 rounded-md w-12" />
                        </div>
                        <div className="h-3 bg-slate-800/50 rounded-md w-full max-w-[180px]" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatListSkeleton;
