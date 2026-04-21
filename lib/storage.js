/**
 * STORAGE UTILITY - PASSTHROUGH MODE
 * Since Firebase Storage is disabled to avoid plan upgrades, 
 * this utility simply passes through the Base64 strings to be stored 
 * directly in MongoDB.
 */

export async function uploadBase64Image(base64String, folder = 'uploads') {
    // Just return the string as-is for storage in MongoDB
    return base64String;
}

export async function maybeUploadImage(value, folder = 'uploads') {
    // Just return the value as-is (Base64 string or URL)
    return value;
}
