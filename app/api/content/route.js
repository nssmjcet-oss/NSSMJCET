import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Content } from '@/lib/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const pageId = searchParams.get('pageId');

        if (!pageId) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }

        // Use findOne to avoid CastError with string IDs
        let content = await Content.findOne({ _id: pageId }).lean();

        if (pageId === 'hero' && (!content || !content.title?.en)) {
            const defaultHero = {
                _id: 'hero',
                title: { en: 'National Service Scheme', te: 'నేషనల్ సర్వీస్ స్కీమ్', hi: 'राष्ट्रीय सेवा योजना' },
                subtitle: { en: 'NSS MJCET CHAPTER · STUDENT VOLUNTEER CORPS', te: 'NSS MJCET విభాగం · విద్యార్థి వాలంటీర్ కార్ప్స్', hi: 'एनएसएस एमजेसीईटी अध्याय · छात्र स्वयंसेवक कोर' },
                content: { en: 'Building responsible citizens through service, leadership, and meaningful community impact across society.', te: 'సేవ, నాయకత్వం మరియు సమాజంలో అర్థవంతమైన సామాజిక ప్రభావం ద్వారా బాధ్యతాయుతమైన పౌరులను నిర్మించడం.', hi: 'सेवा, नेतृत्व और समाज में सार्थक सामाजिक प्रभाव के माध्यम से जिम्मेदार नागरिकों का निर्माण करना।' },
                motto: { en: 'NOT ME BUT YOU', te: 'నేను కాదు మీరు', hi: 'मैं नहीं बल्कि आप' },
                image: '/uploads/nss-team-hero.jpg',
                volunteers: 500,
                events: 50,
                serviceHours: 10000,
                updatedAt: new Date()
            };
            await Content.findOneAndUpdate({ _id: 'hero' }, { $set: defaultHero }, { upsert: true });
            content = defaultHero;
        }
        
        return NextResponse.json({ content }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });
    } catch (error) {
        console.error('Public Content GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}
