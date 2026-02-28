export const formatDate = (date, locale = 'en-IN') => {
    if (!date) return '';
    try {
        // Handle Firestore Timestamp object
        let d;
        if (date && typeof date === 'object' && '_seconds' in date) {
            d = new Date(date._seconds * 1000);
        } else {
            d = new Date(date);
        }

        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return '';
    }
};

export const getRelativeTime = (date) => {
    if (!date) return '';
    try {
        const now = new Date();

        let then;
        if (date && typeof date === 'object' && '_seconds' in date) {
            then = new Date(date._seconds * 1000);
        } else {
            then = new Date(date);
        }

        if (isNaN(then.getTime())) return '';

        const diffInSeconds = Math.floor((now - then) / 1000);

        if (diffInSeconds < 0) return 'just now'; // Future date
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return formatDate(date);
    } catch (e) {
        return '';
    }
};
