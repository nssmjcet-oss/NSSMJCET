export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import { GalleryItem, GallerySettings, GalleryCounter } from '@/lib/models';
import { maybeUploadImage } from '@/lib/storage';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';
import { galleryMoments } from '@/data/galleryMoments';
import { MAX_GALLERY_PHOTOS } from '@/lib/galleryConfig';

const DEFAULT_SETTINGS = {
    speedMultiplier: 2,
    maxDesktopCards: 60,
    maxMobileCards: 20,
    repeatPhotos: true,
    cardScale: 'medium',
    autoSpotlight: true,
    spotlightDelay: 6,
    dateFormat: 'DD MMM YYYY',
    showLogo: true,
    showMenuButton: true,
    showHeader: false,
    headerText: {
        en: {
            eyebrow: 'NSS MJCET · NOT ME BUT YOU',
            headingPlain: 'The Spirit of Our ',
            headingItalic: 'Volunteers',
            subtext: 'Real moments from the people who show up, work hard and enjoy every step of the journey.',
        },
        hi: {
            eyebrow: 'NSS MJCET · मैं नहीं, आप',
            headingPlain: 'हमारे स्वयंसेवकों की ',
            headingItalic: 'भावना',
            subtext: 'उन लोगों के असली पल, जो आगे आते हैं, मेहनत करते हैं और सफ़र के हर कदम का आनंद लेते हैं।',
        },
        te: {
            eyebrow: 'NSS MJCET · నేను కాదు, మీరు',
            headingPlain: 'మా వాలంటీర్ల ',
            headingItalic: 'స్ఫూర్తి',
            subtext: 'ముందుకు వచ్చి, కష్టపడి, ప్రయాణంలోని ప్రతి అడుగునూ ఆస్వాదించే వ్యక్తుల నిజమైన క్షణాలు.',
        },
    },
};

const MAX_SERVER_THUMB_BYTES = 60 * 1024;  // 60 KB
const MAX_SERVER_FULL_BYTES = 700 * 1024;  // 700 KB

function validateBase64Size(dataUrl, maxBytes, fieldName = 'Image') {
    if (!dataUrl || typeof dataUrl !== 'string') return;
    if (dataUrl.startsWith('data:')) {
        const commaIdx = dataUrl.indexOf(',');
        const b64Data = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
        const bytes = Math.ceil((b64Data.length * 3) / 4);
        if (bytes > maxBytes) {
            throw new Error(`${fieldName} exceeds maximum server limit of ${Math.round(maxBytes / 1024)} KB (received approx ${(bytes / 1024).toFixed(1)} KB)`);
        }
    }
}

/**
 * Re-sync the gallery_counter document to the true count of GalleryItem documents.
 * Call after any delete or bulk-delete to keep the counter accurate.
 */
async function resyncCounter() {
    const trueCount = await GalleryItem.countDocuments({});
    await GalleryCounter.findOneAndUpdate(
        { _id: 'gallery_counter' },
        { $set: { count: trueCount } },
        { upsert: true, new: true }
    );
    return trueCount;
}

/**
 * Atomically claim N slots for a batch upload.
 * Returns { granted: number, rejected: number } – only `granted` slots should be uploaded.
 * Uses conditional findOneAndUpdate so no two parallel requests can exceed the cap together.
 */
async function claimSlots(wanted) {
    // First ensure counter document exists
    await GalleryCounter.findOneAndUpdate(
        { _id: 'gallery_counter' },
        { $setOnInsert: { count: 0 } },
        { upsert: true }
    );

    // Re-sync to real count (safety: handles any out-of-sync state)
    const trueCount = await GalleryItem.countDocuments({});
    const free = Math.max(0, MAX_GALLERY_PHOTOS - trueCount);
    const granted = Math.min(wanted, free);

    if (granted > 0) {
        // Atomically increment – only succeeds if count stays ≤ MAX_GALLERY_PHOTOS
        await GalleryCounter.findOneAndUpdate(
            { _id: 'gallery_counter', count: { $lte: MAX_GALLERY_PHOTOS - granted } },
            { $inc: { count: granted } },
            { upsert: false }
        );
    }

    return { granted, rejected: wanted - granted, currentCount: trueCount };
}

// GET: All items (including hidden) and settings
export async function GET(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();

        let docs = await GalleryItem.find({}).sort({ order: 1, date: -1, createdAt: -1 }).lean();

        // If collection is completely empty, optionally seed the initial placeholder entries
        if (docs.length === 0) {
            const seedItems = galleryMoments.map((m, idx) => ({
                image: m.src,
                thumbnail: m.src,
                date: m.date,
                order: idx,
                isHidden: false,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            try {
                await GalleryItem.insertMany(seedItems);
                docs = await GalleryItem.find({}).sort({ order: 1, date: -1, createdAt: -1 }).lean();
            } catch (_) {}
        }

        const items = docs.map((d) => ({
            ...d,
            id: d._id?.toString() || d._id,
            _id: d._id?.toString() || d._id,
            image: d.image || d.imageUrl || d.url || d.src || '',
            thumbnail: d.thumbnail || d.image || d.imageUrl || d.url || d.src || '',
            date: d.date || (d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '2026-03-14'),
            isHidden: !!d.isHidden,
            order: d.order ?? 0,
        }));

        let settingsDoc = await GallerySettings.findOne({ _id: 'gallery-settings' }).lean();
        const settings = {
            ...DEFAULT_SETTINGS,
            ...(settingsDoc || {}),
            headerText: {
                ...DEFAULT_SETTINGS.headerText,
                ...(settingsDoc?.headerText || {}),
            },
        };

        // Return current photo count and limit so admin UI can show progress bar
        const photoCount = docs.length;

        return NextResponse.json({ items, settings, photoCount, photoLimit: MAX_GALLERY_PHOTOS });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Add one or multiple photos, or seed placeholders, or save settings
export async function POST(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();

        // Handle settings save
        if (body.action === 'save_settings' || body.settings) {
            const settingsToSave = body.settings || body;
            const updated = await GallerySettings.findOneAndUpdate(
                { _id: 'gallery-settings' },
                {
                    ...settingsToSave,
                    _id: 'gallery-settings',
                    updatedAt: new Date(),
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            ).lean();

            revalidatePath('/gallery');
            revalidatePath('/api/gallery');

            return NextResponse.json({ success: true, settings: updated });
        }

        // Handle batch photo uploads
        if (Array.isArray(body.photos)) {
            const wanted = body.photos.length;
            const { granted, rejected, currentCount } = await claimSlots(wanted);

            if (granted === 0) {
                // Gallery is full – reject all
                return NextResponse.json(
                    {
                        error: `Gallery is full (${MAX_GALLERY_PHOTOS}/${MAX_GALLERY_PHOTOS} photos). Delete some photos before uploading more.`,
                        photoCount: currentCount,
                        photoLimit: MAX_GALLERY_PHOTOS,
                    },
                    { status: 409 }
                );
            }

            // Only upload the granted number of photos
            const photosToUpload = body.photos.slice(0, granted);
            const createdItems = [];
            let failedCount = 0;

            for (let i = 0; i < photosToUpload.length; i++) {
                const p = photosToUpload[i];
                if (!p.image) {
                    failedCount++;
                    continue;
                }

                try {
                    validateBase64Size(p.thumbnail, MAX_SERVER_THUMB_BYTES, 'Thumbnail');
                    validateBase64Size(p.image, MAX_SERVER_FULL_BYTES, 'Full image');

                    const fullImg = await maybeUploadImage(p.image, 'gallery');
                    const thumbImg = p.thumbnail ? await maybeUploadImage(p.thumbnail, 'gallery') : fullImg;

                    const doc = await GalleryItem.create({
                        image: fullImg,
                        thumbnail: thumbImg,
                        date: p.date || new Date().toISOString().split('T')[0],
                        order: p.order !== undefined ? Number(p.order) : 0,
                        isHidden: !!p.isHidden,
                        isPublished: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    createdItems.push({ ...doc.toObject(), id: doc._id });
                } catch (uploadErr) {
                    failedCount++;
                }
            }

            // If some uploads failed, roll back the counter by the failures
            if (failedCount > 0) {
                await GalleryCounter.findOneAndUpdate(
                    { _id: 'gallery_counter' },
                    { $inc: { count: -failedCount } }
                );
            }

            // Re-sync counter to the true DB count (definitive safety net)
            const finalCount = await resyncCounter();

            revalidatePath('/gallery');
            revalidatePath('/api/gallery');

            const response = {
                items: createdItems,
                photoCount: finalCount,
                photoLimit: MAX_GALLERY_PHOTOS,
            };

            // Warn if some were skipped due to the cap
            if (rejected > 0) {
                response.warning = `${rejected} photo${rejected > 1 ? 's were' : ' was'} skipped because the gallery is full (limit: ${MAX_GALLERY_PHOTOS}).`;
            }

            return NextResponse.json(response, { status: 201 });
        }

        // Single photo upload
        const { image, thumbnail, date, order, isHidden } = body;
        if (!image) {
            return NextResponse.json({ error: 'Photo is required' }, { status: 400 });
        }

        // Check single upload against limit
        const currentCount = await GalleryItem.countDocuments({});
        if (currentCount >= MAX_GALLERY_PHOTOS) {
            return NextResponse.json(
                {
                    error: `Gallery is full (${MAX_GALLERY_PHOTOS}/${MAX_GALLERY_PHOTOS} photos). Delete a photo before uploading more.`,
                    photoCount: currentCount,
                    photoLimit: MAX_GALLERY_PHOTOS,
                },
                { status: 409 }
            );
        }

        validateBase64Size(thumbnail, MAX_SERVER_THUMB_BYTES, 'Thumbnail');
        validateBase64Size(image, MAX_SERVER_FULL_BYTES, 'Full image');

        const uploadedImage = await maybeUploadImage(image, 'gallery');
        const uploadedThumb = thumbnail ? await maybeUploadImage(thumbnail, 'gallery') : uploadedImage;

        const doc = await GalleryItem.create({
            image: uploadedImage,
            thumbnail: uploadedThumb,
            date: date || new Date().toISOString().split('T')[0],
            order: order !== undefined ? Number(order) : 0,
            isHidden: !!isHidden,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const finalCount = await resyncCounter();

        revalidatePath('/gallery');
        revalidatePath('/api/gallery');

        return NextResponse.json(
            { item: { ...doc.toObject(), id: doc._id }, photoCount: finalCount, photoLimit: MAX_GALLERY_PHOTOS },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update photo, toggle visibility, reorder, or bulk actions
export async function PUT(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const body = await request.json();

        // 1. Bulk toggle hide/show
        if (body.action === 'bulk_hide' && Array.isArray(body.ids)) {
            await GalleryItem.updateMany({ _id: { $in: body.ids } }, { $set: { isHidden: true, updatedAt: new Date() } });
            revalidatePath('/gallery');
            revalidatePath('/api/gallery');
            return NextResponse.json({ success: true, count: body.ids.length });
        }

        if (body.action === 'bulk_show' && Array.isArray(body.ids)) {
            await GalleryItem.updateMany({ _id: { $in: body.ids } }, { $set: { isHidden: false, updatedAt: new Date() } });
            revalidatePath('/gallery');
            revalidatePath('/api/gallery');
            return NextResponse.json({ success: true, count: body.ids.length });
        }

        // 2. Bulk delete – decrement counter by the number deleted
        if (body.action === 'bulk_delete' && Array.isArray(body.ids)) {
            const deleteCount = body.ids.length;
            await GalleryItem.deleteMany({ _id: { $in: body.ids } });
            const finalCount = await resyncCounter();
            revalidatePath('/gallery');
            revalidatePath('/api/gallery');
            return NextResponse.json({ success: true, count: deleteCount, photoCount: finalCount, photoLimit: MAX_GALLERY_PHOTOS });
        }

        // 3. Reorder batch
        if (body.action === 'reorder' && Array.isArray(body.items)) {
            const bulkOps = body.items.map((item) => ({
                updateOne: {
                    filter: { _id: item.id },
                    update: { $set: { order: item.order, updatedAt: new Date() } },
                },
            }));
            if (bulkOps.length > 0) {
                await GalleryItem.bulkWrite(bulkOps);
            }
            revalidatePath('/gallery');
            revalidatePath('/api/gallery');
            return NextResponse.json({ success: true });
        }

        // 4. Single item update (replacing image does NOT change the counter)
        const { id, ...updateData } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        if (updateData.image) {
            updateData.image = await maybeUploadImage(updateData.image, 'gallery');
        }
        if (updateData.thumbnail) {
            updateData.thumbnail = await maybeUploadImage(updateData.thumbnail, 'gallery');
        }

        const updated = await GalleryItem.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true }
        ).lean();

        if (!updated) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });

        revalidatePath('/gallery');
        revalidatePath('/api/gallery');

        return NextResponse.json({ item: { ...updated, id: updated._id } });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Delete single photo and decrement counter
export async function DELETE(request) {
    try {
        const { user, error, status } = await getAuthUser(request);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await GalleryItem.findByIdAndDelete(id);
        const finalCount = await resyncCounter();

        revalidatePath('/gallery');
        revalidatePath('/api/gallery');

        return NextResponse.json({ success: true, photoCount: finalCount, photoLimit: MAX_GALLERY_PHOTOS });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
