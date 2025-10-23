import React from "react";

function MessagesLoadingSkeleton() {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="flex space-x-2  justify-center items-center">
                <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce delay-300"></span>
            </div>
        </div>
    );
}

export default MessagesLoadingSkeleton;
