import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { validateForm } from '@/utils/validation';

// POST - Submit contact form (Public)
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validate required fields
        const validation = validateForm(body, {
            name: { required: true, message: 'Name is required' },
            email: { required: true, email: true },
            subject: { required: true, message: 'Subject is required' },
            message: { required: true, message: 'Message is required' },
        });

        if (!validation.isValid) {
            return NextResponse.json(
                { error: 'Validation failed', errors: validation.errors },
                { status: 400 }
            );
        }

        if (!adminDb) {
            console.error('Firebase Admin DB not initialized');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Create contact submission in Firestore (Collection: contacts)
        const docRef = await adminDb.collection('contacts').add({
            name,
            email,
            subject,
            message,
            status: 'new', // Default status for admin panel
            submittedAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json(
            { message: 'Your message has been sent successfully! We will get back to you soon.', id: docRef.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Contact POST error:', error);
        return NextResponse.json(
            { error: 'Failed to send message: ' + error.message },
            { status: 500 }
        );
    }
}
