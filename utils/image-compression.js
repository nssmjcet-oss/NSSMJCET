/**
 * Compresses an image file on the client side using the Canvas API.
 *
 * @param {File} file - The image file to compress.
 * @param {Object} options - Compression options.
 * @param {number} [options.maxWidth=1200] - Maximum width.
 * @param {number} [options.maxHeight=1200] - Maximum height.
 * @param {number} [options.quality=0.8] - Compression quality (0–1).
 * @param {string} [options.type='image/jpeg'] - Output MIME type.
 * @returns {Promise<File>} Compressed File object.
 */
export async function compressImage(file, options = {}) {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        type = 'image/jpeg'
    } = options;

    let processedFile = file;

    // Handle HEIC/HEIF files
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';

    if (isHeic) {
        try {
            console.log('Converting HEIC image...');
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8
            });

            // heic2any might return an array if it's a multi-frame HEIC
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
            });
        } catch (err) {
            console.error('HEIC conversion failed:', err);
            // Fallback: try to proceed with original file, though it will likely fail in onload
        }
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(processedFile);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob conversion failed'));
                            return;
                        }
                        resolve(new File([blob], processedFile.name, { type, lastModified: Date.now() }));
                    },
                    type,
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/**
 * Compresses an image and returns it as a Base64 Data URL.
 * Use this for profile photos stored directly in Firestore — no Firebase Storage upload needed.
 *
 * @param {File} file - The image file to compress.
 * @param {Object} options - Same options as compressImage.
 * @returns {Promise<string>} Base64 data URL string (e.g. "data:image/jpeg;base64,...")
 */
export async function compressImageToDataURL(file, options = {}) {
    const {
        maxWidth = 800,
        maxHeight = 800,
        quality = 0.68,
        type = 'image/jpeg'
    } = options;

    let processedFile = file;

    // Handle HEIC/HEIF files
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';

    if (isHeic) {
        try {
            console.log('Converting HEIC image to Data URL source...');
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.7
            });

            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
            });
        } catch (err) {
            console.error('HEIC conversion failed:', err);
        }
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(processedFile);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Returns compressed data URL directly
                resolve(canvas.toDataURL(type, quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

/**
 * Validates uploaded image file against allowed types and maximum size.
 * @param {File} file
 * @param {Object} [options]
 * @param {number} [options.maxSizeBytes=5242880] - 5MB default ceiling
 * @param {string[]} [options.allowedTypes]
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file, options = {}) {
    const {
        maxSizeBytes = 5 * 1024 * 1024, // 5MB limit
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif']
    } = options;

    if (!file) {
        return { valid: false, error: 'No file selected.' };
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext);
    const isAllowedType = allowedTypes.includes(file.type.toLowerCase()) || isAllowedExt;

    if (!isAllowedType) {
        return { valid: false, error: 'Unsupported file type. Please upload a JPG, PNG, or WebP image.' };
    }

    if (file.size > maxSizeBytes) {
        const mb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
        return { valid: false, error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed ${mb}MB limit.` };
    }

    return { valid: true };
}

/**
 * High-efficiency compression tailored specifically for Team Member Cards.
 * Resizes to max 500x500 at 0.60 quality, resulting in ~25-45KB data instead of ~300KB+.
 * 
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function compressMemberPhoto(file) {
    return compressImageToDataURL(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.60,
        type: 'image/jpeg'
    });
}

