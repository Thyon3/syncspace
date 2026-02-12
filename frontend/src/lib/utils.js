// Time formatting utilities for Telegram-style timestamps

export const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format as HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const formatChatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Less than 1 minute ago
    if (diffMins < 1) return 'now';

    // Less than 1 hour ago
    if (diffHours < 1) return `${diffMins}m`;

    // Today
    if (diffDays === 0) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Yesterday
    if (diffDays === 1) return 'Yesterday';

    // This week (show day name)
    if (diffDays < 7) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }

    // Older (show date)
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Same year - show DD/MM
    if (year === now.getFullYear()) {
        return `${day}/${month}`;
    }

    // Different year - show DD/MM/YY
    return `${day}/${month}/${year.toString().slice(-2)}`;
};

export const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatChatTime(timestamp);
};
