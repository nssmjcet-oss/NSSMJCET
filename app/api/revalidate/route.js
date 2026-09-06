export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const paths = Array.isArray(body.paths) ? body.paths : [body.path || '/team'];

        for (const p of paths) {
            if (p) revalidatePath(p);
        }

        return NextResponse.json({ revalidated: true, paths, now: Date.now() });
    } catch (err) {
        return NextResponse.json({ revalidated: false, error: err.message }, { status: 500 });
    }
}
