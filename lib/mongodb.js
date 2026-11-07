import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

// Global is used here to maintain a cached connection across hot reloads in development.
// This prevents connections from growing exponentially during API Route usage.
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // M0 free tier has a 500-connection cap shared across all clients.
            // Keep the pool small so multiple Next.js instances don't exhaust it.
            maxPoolSize: 10,
            minPoolSize: 1,
            // Close idle connections quickly to free slots for other instances.
            maxIdleTimeMS: 10000,
            // Don't wait forever if the pool is saturated.
            waitQueueTimeoutMS: 10000,
            // TCP keepalive to detect stale connections early.
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 10000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('[MongoDB] Connected successfully.');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectToDatabase;
