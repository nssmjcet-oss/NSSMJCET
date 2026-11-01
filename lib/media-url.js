/**
 * Transforms Base64 data URLs into lightweight edge-cached /api/media/... URLs.
 * Keeps external URLs (http/https) and local static paths (/placeholder...) untouched.
 */
export function toMediaUrl(type, id, value, extraQuery = '') {
    if (!value || typeof value !== 'string') return value || '';
    if (value.startsWith('data:image')) {
        return `/api/media/${type}/${id}${extraQuery}`;
    }
    return value;
}
