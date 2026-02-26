import React from 'react';

function UnreadBadge({ count }) {
    if (!count || count === 0) return null;

    return (
        <div className="bg-blue-600 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
            {count > 99 ? '99+' : count}
        </div>
    );
}

export default UnreadBadge;
