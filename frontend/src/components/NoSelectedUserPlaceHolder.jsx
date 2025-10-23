import React from 'react';
import { MessageCircle } from 'lucide-react';

function NoSelectedUserPlaceHolder() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
            <div className="text-cyan-500 mb-4">
                <MessageCircle size={64} />
            </div>
            <h2 className="text-2xl font-semibold text-slate-200 mb-2">
                Select a conversation
            </h2>
            <p className="text-slate-400 max-w-xs">
                Click on a chat or contact from the left sidebar to start messaging.
                You can drag the sidebar to adjust its width.
            </p>
        </div>
    );
}

export default NoSelectedUserPlaceHolder;
