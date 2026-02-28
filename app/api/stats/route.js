import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({
                volunteers: 0,
                events: 0,
                serviceHours: 0,
                beneficiaries: 0,
                warning: 'Admin Database not initialized'
            });
        }

        // 1. Get Settings (Manual Overrides & Global Counters)
        let settings = {
            serviceHours: 0,
            peopleBenefited: 0,
            volunteers: 0,
            events: 0
        };

        try {
            const settingsSnap = await adminDb.collection('siteSettings').doc('main').get();
            if (settingsSnap.exists) {
                settings = settingsSnap.data();
            }
        } catch (e) {
            console.warn('Stats: siteSettings collection possibly missing, using defaults.');
        }

        let volunteerCount = settings.volunteers || 0;
        let eventCount = settings.events || 0;

        // 2. Automatic totals
        try {
            if (volunteerCount === 0) {
                const [vSnapshot, tSnapshot] = await Promise.all([
                    adminDb.collection('volunteers').where('status', '==', 'approved').get(),
                    adminDb.collection('team').get()
                ]);
                volunteerCount = vSnapshot.size + tSnapshot.size;
            }
        } catch (e) {
            console.warn('Stats: volunteers/team collection missing or error.');
        }

        try {
            if (eventCount === 0) {
                const eSnapshot = await adminDb.collection('events').get();
                eventCount = eSnapshot.size;
            }
        } catch (e) {
            console.warn('Stats: events collection missing or error.');
        }

        return NextResponse.json({
            volunteers: volunteerCount,
            events: eventCount,
            serviceHours: settings.serviceHours || 0,
            beneficiaries: settings.peopleBenefited || settings.serviceHours || 0 // Fallback
        }, { status: 200 });

    } catch (error) {
        console.error('Stats GET fatal error:', error);
        // Never return 500 for stats if possible, just return 0s
        return NextResponse.json({
            volunteers: 0,
            events: 0,
            serviceHours: 0,
            beneficiaries: 0,
            error: error.message
        }, { status: 200 });
    }
}
