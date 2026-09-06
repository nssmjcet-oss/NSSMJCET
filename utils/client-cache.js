/**
 * CLIENT-SIDE CACHE & REQUEST DEDUPLICATION UTILITY
 * 
 * Solves:
 * 1. Duplicate in-flight requests (e.g. page and sub-components requesting /api/events simultaneously)
 * 2. Instant tab-switching & back/forward navigation without hitting the network
 * 3. Reduces Vercel Origin data transfer by caching responses in memory & sessionStorage
 */

const memoryCache = new Map();
const inFlightRequests = new Map();

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes default for public content

/**
 * Centralized fetch with memory + sessionStorage caching and request deduplication.
 * 
 * @param {string} url - Target API URL
 * @param {Object} options - Fetch options & cache options
 * @param {number} [options.ttlMs=600000] - Cache validity time in ms (default 10 mins)
 * @param {boolean} [options.bypassCache=false] - Force network fetch
 * @returns {Promise<any>}
 */
export async function fetchWithCache(url, options = {}) {
    const { ttlMs = DEFAULT_TTL_MS, bypassCache = false, ...fetchOptions } = options;
    const cacheKey = `nss_cache_${url}`;
    const now = Date.now();

    // 1. Check in-memory cache if not bypassing
    if (!bypassCache && memoryCache.has(cacheKey)) {
        const item = memoryCache.get(cacheKey);
        if (now < item.expiresAt) {
            return item.data;
        }
        memoryCache.delete(cacheKey);
    }

    // 2. Check sessionStorage if available (browser-side only)
    if (!bypassCache && typeof window !== 'undefined' && window.sessionStorage) {
        try {
            const stored = sessionStorage.getItem(cacheKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (now < parsed.expiresAt) {
                    memoryCache.set(cacheKey, parsed); // populate memory
                    return parsed.data;
                }
                sessionStorage.removeItem(cacheKey);
            }
        } catch (e) {
            // sessionStorage errors (e.g. quota/disabled), silently proceed to network
        }
    }

    // 3. Deduplicate in-flight requests
    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    // 4. Perform actual network request
    const requestPromise = (async () => {
        try {
            const res = await fetch(url, {
                ...fetchOptions,
                headers: {
                    'Accept': 'application/json',
                    ...(fetchOptions.headers || {})
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error ${res.status} fetching ${url}`);
            }

            const data = await res.json();
            const cacheEntry = { data, expiresAt: now + ttlMs };

            // Store in memory
            memoryCache.set(cacheKey, cacheEntry);

            // Store in sessionStorage (if under ~500KB to avoid quota issues)
            if (typeof window !== 'undefined' && window.sessionStorage) {
                try {
                    const serialized = JSON.stringify(cacheEntry);
                    if (serialized.length < 500000) {
                        sessionStorage.setItem(cacheKey, serialized);
                    }
                } catch (e) {
                    // Ignore quota exceeded
                }
            }

            return data;
        } finally {
            inFlightRequests.delete(cacheKey);
        }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
}

/**
 * Invalidate a specific cache entry or all cache entries
 * @param {string} [url] - Specific URL to clear, or omit to clear all
 */
export function invalidateCache(url) {
    if (url) {
        const cacheKey = `nss_cache_${url}`;
        memoryCache.delete(cacheKey);
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try { sessionStorage.removeItem(cacheKey); } catch (e) {}
        }
    } else {
        memoryCache.clear();
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                Object.keys(sessionStorage)
                    .filter(k => k.startsWith('nss_cache_'))
                    .forEach(k => sessionStorage.removeItem(k));
            } catch (e) {}
        }
    }
}
