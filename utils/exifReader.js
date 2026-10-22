/**
 * Lightweight client-side EXIF date extractor for JPEG and standard image files.
 * Reads DateTimeOriginal tag (0x9003) or falls back to file.lastModified.
 */

export async function extractPhotoDate(file) {
    if (!file) return new Date().toISOString().split('T')[0];

    try {
        const buffer = await file.slice(0, 128 * 1024).arrayBuffer();
        const view = new DataView(buffer);

        // Check for JPEG SOI marker (0xFFD8)
        if (view.getUint16(0, false) === 0xFFD8) {
            let offset = 2;
            const length = view.byteLength;

            while (offset < length - 4) {
                const marker = view.getUint16(offset, false);
                offset += 2;

                // APP1 marker (EXIF)
                if (marker === 0xFFE1) {
                    const exifLength = view.getUint16(offset, false);
                    offset += 2;

                    // Check for 'Exif\0\0' string
                    const isExif =
                        view.getUint8(offset) === 0x45 &&
                        view.getUint8(offset + 1) === 0x78 &&
                        view.getUint8(offset + 2) === 0x69 &&
                        view.getUint8(offset + 3) === 0x66 &&
                        view.getUint8(offset + 4) === 0x00 &&
                        view.getUint8(offset + 5) === 0x00;

                    if (isExif) {
                        const tiffHeaderOffset = offset + 6;
                        const byteOrder = view.getUint16(tiffHeaderOffset, false);
                        const littleEndian = byteOrder === 0x4949; // 'II'

                        const ifd0Offset = tiffHeaderOffset + view.getUint32(tiffHeaderOffset + 4, littleEndian);
                        if (ifd0Offset < length - 2) {
                            const dateStr = searchDateInIFD(view, ifd0Offset, tiffHeaderOffset, littleEndian, length);
                            if (dateStr) return dateStr;
                        }
                    }
                    break;
                } else if ((marker & 0xFF00) === 0xFF00) {
                    // Skip other markers
                    const markerLength = view.getUint16(offset, false);
                    offset += markerLength;
                } else {
                    break;
                }
            }
        }
    } catch (e) {
        // Fallback on parse error
    }

    // Fallback: use file.lastModified if available
    if (file.lastModified) {
        try {
            return new Date(file.lastModified).toISOString().split('T')[0];
        } catch (_) {}
    }

    return new Date().toISOString().split('T')[0];
}

function searchDateInIFD(view, ifdOffset, tiffStart, littleEndian, maxLen) {
    if (ifdOffset + 2 > maxLen) return null;
    const entries = view.getUint16(ifdOffset, littleEndian);

    for (let i = 0; i < entries; i++) {
        const entryOffset = ifdOffset + 2 + i * 12;
        if (entryOffset + 12 > maxLen) break;

        const tag = view.getUint16(entryOffset, littleEndian);

        // 0x9003 = DateTimeOriginal, 0x0132 = DateTime
        if (tag === 0x9003 || tag === 0x0132) {
            const count = view.getUint32(entryOffset + 4, littleEndian);
            const valueOffset = tiffStart + view.getUint32(entryOffset + 8, littleEndian);

            if (valueOffset + count <= maxLen) {
                let rawDate = '';
                for (let c = 0; c < Math.min(count, 19); c++) {
                    rawDate += String.fromCharCode(view.getUint8(valueOffset + c));
                }
                // Format is 'YYYY:MM:DD HH:MM:SS'
                const match = rawDate.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})/);
                if (match) {
                    return `${match[1]}-${match[2]}-${match[3]}`;
                }
            }
        } else if (tag === 0x8769) {
            // EXIF IFD pointer
            const subIfdOffset = tiffStart + view.getUint32(entryOffset + 8, littleEndian);
            const subDate = searchDateInIFD(view, subIfdOffset, tiffStart, littleEndian, maxLen);
            if (subDate) return subDate;
        }
    }
    return null;
}
