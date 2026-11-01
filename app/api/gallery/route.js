import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { GalleryItem, GallerySettings } from '@/lib/models';
import { galleryMoments } from '@/data/galleryMoments';

export const dynamic = 'force-dynamic';

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
    allowDrag: true,
    dragEffects: true,
    showDragHint: true,
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

export async function GET(request) {
    try {
        await connectToDatabase();

        // 1. Fetch public (non-hidden) photos sorted by order asc, then date desc
        const docs = await GalleryItem.find({
            isHidden: { $ne: true },
            isPublished: { $ne: false }
        })
            .sort({ order: 1, date: -1, createdAt: -1 })
            .lean();

        let photos = docs.map((doc, idx) => {
            const fullSrc = doc.image || doc.imageUrl || doc.url || doc.src || '';
            const thumbSrc = doc.thumbnail || fullSrc;
            const momentDate = doc.date || (doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '2026-03-14');

            const id = doc._id?.toString() || `photo-${idx}`;
            const isBase64 = typeof fullSrc === 'string' && fullSrc.startsWith('data:');
            const mediaSrc = isBase64 ? `/api/media/gallery/${id}` : (fullSrc || '/gallery-placeholders/moment-1.svg');
            const mediaThumb = isBase64 ? `/api/media/gallery/${id}?thumb=1` : (thumbSrc || mediaSrc);
            return {
                id,
                src: mediaSrc,
                thumbnail: mediaThumb,
                date: momentDate,
                order: doc.order ?? idx,
            };
        });

        // Fallback to placeholder moments if database is empty so gallery never breaks
        if (photos.length === 0) {
            photos = galleryMoments.map((m, idx) => ({
                id: m.id,
                src: m.src,
                thumbnail: m.src,
                date: m.date,
                order: idx,
            }));
        }

        // 2. Fetch gallery settings
        let settingsDoc = await GallerySettings.findOne({ _id: 'gallery-settings' }).lean();
        const settings = {
            ...DEFAULT_SETTINGS,
            ...(settingsDoc || {}),
            headerText: {
                ...DEFAULT_SETTINGS.headerText,
                ...(settingsDoc?.headerText || {}),
            },
        };

        return NextResponse.json(
            { photos, settings },
            {
                headers: {
                    // Cache at CDN edge for 5 min; serve stale up to 1 hr while revalidating.
                    // Admin changes call revalidatePath to bust this instantly.
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
                },
            }
        );
    } catch (error) {
        console.error('Public Gallery GET error:', error);
        // Resilient fallback: return local placeholder moments with default settings
        return NextResponse.json({
            photos: galleryMoments.map((m, idx) => ({
                id: m.id,
                src: m.src,
                thumbnail: m.src,
                date: m.date,
                order: idx,
            })),
            settings: DEFAULT_SETTINGS,
            isFallback: true,
        });
    }
}
