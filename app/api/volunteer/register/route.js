import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { validateForm } from '@/utils/validation';

// POST - Submit volunteer registration (Public)
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, phone, rollNumber, department, year, interests, message } = body;

        // Validate required fields
        const validation = validateForm(body, {
            name: { required: true, message: 'Name is required' },
            email: { required: true, email: true },
            phone: { required: true, phone: true },
            rollNumber: { required: true, message: 'Roll number is required' },
            department: { required: true, message: 'Department is required' },
            year: { required: true, message: 'Year is required' },
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

        // Check if already registered
        const volunteersRef = adminDb.collection('volunteers');
        const snapshot = await volunteersRef.where('email', '==', email).get();

        if (!snapshot.empty) {
            return NextResponse.json(
                { error: 'You have already registered with this email' },
                { status: 400 }
            );
        }

        // Create volunteer registration in Firestore
        const docRef = await volunteersRef.add({
            name,
            email,
            phone,
            rollNumber,
            department,
            year,
            interests: interests || [],
            message: message || '',
            status: 'pending', // Default status
            submittedAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json(
            { message: 'Registration submitted successfully! We will contact you soon.', id: docRef.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Volunteer Registration POST error:', error);
        return NextResponse.json(
            { error: 'Failed to submit registration: ' + error.message },
            { status: 500 }
        );
    }
}
