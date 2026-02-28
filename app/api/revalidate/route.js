import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { path } = await request.json();

        // Revalidate the specified path or default to /team
        revalidatePath(path || '/team');

        return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch (err) {
        return NextResponse.json({ revalidated: false, error: err.message }, { status: 500 });
    }
}
