import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Event, Volunteer, Team, Stat } from '@/lib/models';

export const revalidate = 60;

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Get Settings (Manual Overrides & Global Counters)
        let settings = {
            serviceHours: 0,
            peopleBenefited: 0,
            volunteers: 0,
            events: 0
        };

        try {
            const settingsDoc = await Stat.findOne({}).lean();
            if (settingsDoc) {
                settings = { ...settings, ...settingsDoc };
            }
        } catch (e) {
            console.warn('Stats: siteSettings collection possibly missing, using defaults.');
        }

        let volunteerCount = settings.volunteers || 0;
        let eventCount = settings.events || 0;

        // 2. Automatic totals
        try {
            if (volunteerCount === 0) {
                const [vCount, tCount] = await Promise.all([
                    Volunteer.countDocuments({ status: 'approved' }),
                    Team.countDocuments({})
                ]);
                volunteerCount = vCount + tCount;
            }
        } catch (e) {
            console.warn('Stats: volunteers/team collection missing or error.');
        }

        try {
            if (eventCount === 0) {
                eventCount = await Event.countDocuments({});
            }
        } catch (e) {
            console.warn('Stats: events collection missing or error.');
        }

        return NextResponse.json({
            volunteers: volunteerCount,
            events: eventCount,
            serviceHours: settings.serviceHours || 0,
            beneficiaries: settings.peopleBenefited || settings.serviceHours || 0
        }, { status: 200 });

    } catch (error) {
        console.error('Stats GET fatal error:', error);
        return NextResponse.json({
            volunteers: 0,
            events: 0,
            serviceHours: 0,
            beneficiaries: 0,
            error: error.message
        }, { status: 200 });
    }
}

