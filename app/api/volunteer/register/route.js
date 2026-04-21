import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Volunteer } from '@/lib/models';
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

        await connectToDatabase();

        // Check if already registered
        const existing = await Volunteer.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { error: 'You have already registered with this email' },
                { status: 400 }
            );
        }

        const newVolunteer = await Volunteer.create({
            name,
            email,
            phone,
            rollNumber,
            department,
            year,
            interests: interests || [],
            message: message || '',
            status: 'pending',
            submittedAt: new Date(),
            createdAt: new Date(),
        });

        return NextResponse.json(
            { message: 'Registration submitted successfully! We will contact you soon.', id: newVolunteer._id },
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
