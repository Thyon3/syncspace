import React from 'react';
import { Pin, X } from 'lucide-react';

function PinnedMessages({ pinnedMessages, onUnpin, onNavigate }) {
    if (!pinnedMessages || pinnedMessages.length === 0) return null;

    return (
        <div className="bg-slate-800 border-b border-slate-700 p-3">
            <div className="flex items-center gap-2">
                <Pin size={16} className="text-blue-400" />
                <span className="text-sm text-slate-300">
                    {pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? 's' : ''}
                </span>
            </div>
            <div className="mt-2 space-y-1">
                {pinnedMessages.slice(0, 3).map((msg) => (
                    <div
                        key={msg._id}
                        className="flex items-center justify-between bg-slate-700/50 rounded p-2 cursor-pointer hover:bg-slate-700"
                        onClick={() => onNavigate(msg._id)}
                    >
                        <span className="text-sm text-slate-200 truncate flex-1">
                            {msg.text || 'Media message'}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnpin(msg._id);
                            }}
                            className="ml-2 p-1 hover:bg-slate-600 rounded"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PinnedMessages;
