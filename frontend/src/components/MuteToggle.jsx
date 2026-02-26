import React from 'react';
import { Bell, BellOff } from 'lucide-react';

function MuteToggle({ chatId, isMuted, onMute, onUnmute }) {
    const handleClick = () => {
        if (isMuted) {
            onUnmute(chatId);
        } else {
            onMute(chatId);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="p-2 hover:bg-slate-700 rounded transition flex items-center gap-2"
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
        >
            {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
            <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
    );
}

export default MuteToggle;
