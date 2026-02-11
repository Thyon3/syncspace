import React from "react";

function MessagesLoadingSkeleton() {
    return (
        <div className="flex flex-col justify-center items-center h-full p-8">
            {/* Loading animation */}
            <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce"></div>
            </div>

            {/* Loading text */}
            <p className="text-slate-400 text-sm animate-pulse">Loading messages...</p>

            {/* Message skeleton previews */}
            <div className="w-full max-w-md mt-8 space-y-4">
                {/* Received message skeleton */}
                <div className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-slate-700/50 rounded-full flex-shrink-0"></div>
                    <div className="glass rounded-2xl rounded-bl-sm p-3 max-w-[70%]">
                        <div className="h-4 bg-slate-700/50 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-slate-700/30 rounded w-24"></div>
                    </div>
                </div>

                {/* Sent message skeleton */}
                <div className="flex items-start gap-3 justify-end animate-pulse" style={{ animationDelay: '0.2s' }}>
                    <div className="glass-dark rounded-2xl rounded-br-sm p-3 max-w-[70%] bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
                        <div className="h-4 bg-slate-600/50 rounded w-40 mb-2"></div>
                        <div className="h-4 bg-slate-600/30 rounded w-28"></div>
                    </div>
                </div>

                {/* Typing indicator skeleton */}
                <div className="flex items-start gap-3 animate-pulse" style={{ animationDelay: '0.4s' }}>
                    <div className="w-8 h-8 bg-slate-700/50 rounded-full flex-shrink-0"></div>
                    <div className="glass rounded-2xl rounded-bl-sm p-3">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessagesLoadingSkeleton;
