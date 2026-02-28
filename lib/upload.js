/**
 * This function previously handled local and Firebase uploads.
 * Now that we use client-side Base64 storage for zero-cost persistence on Vercel,
 * this server-side upload endpoint is deprecated and strictly disabled
 * to prevent accidental non-persistent storage.
 */
export async function saveFile(file) {
    throw new Error('Server-side uploads are disabled. Please use client-side Base64 compression.');
}
