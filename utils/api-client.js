import { auth } from '@/lib/firebase';

/**
 * Authenticated fetch wrapper for admin API calls
 */
export async function adminFetch(url, options = {}) {
    try {
        const token = await auth.currentUser?.getIdToken();
        
        const headers = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...options.headers,
        };
 
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
 
        // Add timestamp to URL to bypass any possible aggressive caching
        const separator = url.includes('?') ? '&' : '?';
        const cacheBustUrl = `${url}${separator}t=${Date.now()}`;
 
        const response = await fetch(cacheBustUrl, {
            cache: 'no-store',
            ...options,
            headers
        });

        return response;
    } catch (error) {
        console.error('adminFetch error:', error);
        throw error;
    }
}
