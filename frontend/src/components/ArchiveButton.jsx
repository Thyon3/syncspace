import React from 'react';
import { Archive, ArchiveRestore } from 'lucide-react';

function ArchiveButton({ chatId, isArchived, onArchive, onUnarchive }) {
    const handleClick = () => {
        if (isArchived) {
            onUnarchive(chatId);
        } else {
            onArchive(chatId);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="p-2 hover:bg-slate-700 rounded transition flex items-center gap-2"
            title={isArchived ? 'Unarchive chat' : 'Archive chat'}
        >
            {isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
            <span className="text-sm">{isArchived ? 'Unarchive' : 'Archive'}</span>
        </button>
    );
}

export default ArchiveButton;
