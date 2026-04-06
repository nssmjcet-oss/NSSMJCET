import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 3600; // ISR: cache for 1 hour to protect Firebase free tier

export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('developers')
            .where('is_active', '==', true)
            .orderBy('order_index', 'asc')
            .get();

        let developers = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Enforce specific ordering: Mirza Zohair Ali Baig (2nd), Farnaaz Munawar (3rd)
        const mirza = developers.find(d => d.name?.toLowerCase().includes('zohair'));
        const farnaaz = developers.find(d => d.name?.toLowerCase().includes('farnaaz'));
        
        if (mirza && farnaaz) {
            // Remove them from current positions
            developers = developers.filter(d => d.id !== mirza.id && d.id !== farnaaz.id);
            
            // Insert at index 1 (2nd place) and index 2 (3rd place)
            // Assuming whoever is left at index 0 stays 1st
            developers.splice(1, 0, mirza);
            developers.splice(2, 0, farnaaz);
        }

        return NextResponse.json({ developers });
    } catch (error) {
        console.error('Public Developers GET error:', error);
        return NextResponse.json({ developers: [] }, { status: 200 });
    }
}
