/**
 * Format minutes into hours, minutes, and seconds
 * @param {number} totalMinutes - Total minutes
 * @returns {string} Formatted string like "2 hrs 15 mins" or "45 mins" or "30 secs"
 */
export const formatDuration = (totalMinutes) => {
    if (!totalMinutes || totalMinutes === 0) return '0 mins';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.floor((totalMinutes % 1) * 60);

    const parts = [];

    if (hours > 0) {
        parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    }

    if (minutes > 0) {
        parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
    }

    if (seconds > 0 && hours === 0) {
        // Only show seconds if less than 1 hour
        parts.push(`${seconds} sec${seconds > 1 ? 's' : ''}`);
    }

    return parts.join(' ') || '0 mins';
};

/**
 * Format late minutes for display
 * @param {number} lateMinutes - Late minutes
 * @returns {string} Formatted string
 */
export const formatLateTime = (lateMinutes) => {
    if (!lateMinutes || lateMinutes <= 0) return '-';
    return formatDuration(lateMinutes);
};
