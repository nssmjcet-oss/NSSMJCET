import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });


import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function initAdmin() {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI missing");
        process.exit(1);
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing");
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
        console.log("⚠️ Admin already exists. Delete it first if needed.");
        process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = new User({
        name: "Super Admin",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "super_admin",
        permissions: ["*"],
        isActive: true
    });

    await admin.save();
    console.log("✅ Super admin created successfully");
    process.exit(0);
}

initAdmin().catch(err => {
    console.error("❌ Failed to create admin:", err);
    process.exit(1);
});