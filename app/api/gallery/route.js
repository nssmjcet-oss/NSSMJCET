import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { GalleryItem } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const year = searchParams.get('year');

        // If gallery collection is empty, populate initial authentic records so admin can edit them immediately
        const count = await GalleryItem.countDocuments();
        if (count === 0) {
            const initialPhotos = [
                { title: 'Youth Community Rally', category: 'Community Service', caption: 'Active community youth outreach and empowerment drive.', image: '/uploads/events/1772212213205-20251110130725.jpg', academicYear: '2025-2026', order: 1, isPublished: true, createdAt: new Date() },
                { title: 'Annual Youth Convention', category: 'Youth Parliament & MUN', caption: 'Statewide student convention discussing civic duties & democracy.', image: '/uploads/events/1772212213217-20251110152340.jpg', academicYear: '2025-2026', order: 2, isPublished: true, createdAt: new Date() },
                { title: 'Faculty Interactive Forum', category: 'Campus Activities', caption: 'Interactive symposium on social responsibility in technical education.', image: '/uploads/events/1772212213224-20251110145020.jpg', academicYear: '2025-2026', order: 3, isPublished: true, createdAt: new Date() },
                { title: 'Campus Cultural Initiative', category: 'Health & Awareness', caption: 'Cultural awareness campaign for community health and sanitation.', image: '/uploads/events/1772219830828-Untitleddesign4.jpg', academicYear: '2025-2026', order: 4, isPublished: true, createdAt: new Date() },
                { title: 'Volunteer Training Programme', category: 'Volunteer Life', caption: 'Comprehensive induction and field orientation for student volunteers.', image: '/uploads/events/1772258937302-DSC90851.jpg', academicYear: '2025-2026', order: 5, isPublished: true, createdAt: new Date() },
                { title: 'Social Service Induction', category: 'Community Service', caption: 'Oath-taking ceremony for newly inducted NSS MJCET volunteers.', image: '/uploads/events/1772212567791-NSS01-3.jpg', academicYear: '2025-2026', order: 6, isPublished: true, createdAt: new Date() },
                { title: 'NSS Student Volunteers', category: 'Campus Activities', caption: 'Student leadership council driving campus sustainability initiatives.', image: '/uploads/events/1772212567799-NSS01-1.jpg', academicYear: '2025-2026', order: 7, isPublished: true, createdAt: new Date() },
            ];
            try {
                await GalleryItem.insertMany(initialPhotos);
            } catch (seedErr) {
                console.error('Gallery auto-seed note:', seedErr.message);
            }
        }

        let filter = { isPublished: { $ne: false } };
        if (category && category !== 'all' && category !== 'All Moments') {
            filter.category = category;
        }
        if (year && year !== 'all') {
            filter.academicYear = year;
        }

        const docs = await GalleryItem.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .lean();

        const items = docs.map(doc => {
            const imgSrc = doc.image || doc.imageUrl || doc.url || doc.src || '';
            return {
                ...doc,
                id: doc._id?.toString() || doc._id,
                _id: doc._id?.toString() || doc._id,
                image: imgSrc,
                imageUrl: imgSrc,
                src: imgSrc,
            };
        });

        return NextResponse.json({ items }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });
    } catch (error) {
        console.error('Gallery GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
