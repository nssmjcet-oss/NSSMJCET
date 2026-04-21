import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Developer } from '@/lib/models';

export const revalidate = 60;

export async function GET() {
    try {
        await connectToDatabase();
        const devsData = await Developer.find({ is_active: true })
            .sort({ order_index: 1 })
            .lean();

        let developers = devsData.map(doc => ({ ...doc, id: doc._id }));

        // Enforce specific ordering: Mirza Zohair Ali Baig (2nd), Farnaaz Munawar (3rd)
        const mirza = developers.find(d => d.name?.toLowerCase().includes('zohair'));
        const farnaaz = developers.find(d => d.name?.toLowerCase().includes('farnaaz'));

        if (mirza && farnaaz) {
            developers = developers.filter(d => String(d.id) !== String(mirza.id) && String(d.id) !== String(farnaaz.id));
            developers.splice(1, 0, mirza);
            developers.splice(2, 0, farnaaz);
        }

        return NextResponse.json({ developers });
    } catch (error) {
        console.error('Public Developers GET error:', error);
        return NextResponse.json({ developers: [] }, { status: 200 });
    }
}
