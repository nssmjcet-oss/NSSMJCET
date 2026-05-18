import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getAuthUser, requireAdmin } from '@/lib/server-auth';
import mongoose from 'mongoose';

// Flexible schema for flagship collection
const flagshipSchema = new mongoose.Schema({ _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() } }, { strict: false, timestamps: true });
const Flagship = mongoose.models.Flagship || mongoose.model('Flagship', flagshipSchema, 'flagships');

async function getModel() {
    await connectToDatabase();
    return Flagship;
}

export async function GET(req) {
    try {
        const Model = await getModel();
        const docs = await Model.find({}).sort({ order: 1, createdAt: 1 }).lean();
        const flagships = docs.map(d => ({ ...d, id: d._id }));
        return NextResponse.json({ flagships });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { user, error, status } = await getAuthUser(req);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        const body = await req.json();
        const Model = await getModel();
        const doc = await Model.create({ ...body });
        return NextResponse.json({ flagship: { ...doc.toObject(), id: doc._id } }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    }
}

export async function PUT(req) {
    try {
        const { user, error, status } = await getAuthUser(req);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        const body = await req.json();
        const { id, ...rest } = body;
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        const Model = await getModel();
        const doc = await Model.findByIdAndUpdate(id, { $set: rest }, { new: true }).lean();
        return NextResponse.json({ flagship: { ...doc, id: doc._id } });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    }
}

export async function DELETE(req) {
    try {
        const { user, error, status } = await getAuthUser(req);
        if (error) return NextResponse.json({ error }, { status });

        const rbacError = requireAdmin(user);
        if (rbacError) return NextResponse.json({ error: rbacError.error }, { status: rbacError.status });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        const Model = await getModel();
        await Model.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    }
}

