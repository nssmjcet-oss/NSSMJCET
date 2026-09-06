import mongoose from 'mongoose';

// Force clear models in development to ensure schema changes (like _id: String) take effect immediately
if (process.env.NODE_ENV === 'development') {
    Object.keys(mongoose.models).forEach(modelName => {
        delete mongoose.models[modelName];
    });
}

// --- Generic flexible schema (accepts any fields) ---
const flexibleOptions = { strict: false, timestamps: false };

// Helper to ensure all documents use string IDs for consistency with Firebase/Mongoose hybrid environment
const idField = {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
};

// --- Event ---
const eventSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
eventSchema.index({ status: 1, date: -1 });
eventSchema.index({ academicYear: 1 });
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema, 'events');

// --- Announcement ---
const announcementSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
announcementSchema.index({ isActive: 1, priority: -1, createdAt: -1 });
export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema, 'announcements');

// --- Developer ---
const developerSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
export const Developer = mongoose.models.Developer || mongoose.model('Developer', developerSchema, 'developers');

// --- Team Session (Academic year collections like 2025-2026, 2026-2027) ---
const teamSessionSchema = new mongoose.Schema({
    _id: idField,
    teamYear: { type: String, required: true, unique: true },
    academicYear: { type: String, required: true },
    teamType: { type: String, default: 'Governing Body / Execom / Core' },
    status: { type: String, enum: ['current', 'archived'], default: 'current' },
    title: { type: Object, default: () => ({ en: '', te: '', hi: '' }) },
    description: { type: Object, default: () => ({ en: '', te: '', hi: '' }) },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, flexibleOptions);
teamSessionSchema.index({ status: 1, teamYear: -1 });
export const TeamSession = mongoose.models.TeamSession || mongoose.model('TeamSession', teamSessionSchema, 'teams');

// --- Team ---
const teamSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
teamSchema.index({ academicYear: 1, role: 1, order: 1 });
teamSchema.index({ status: 1 });
export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema, 'team');

// --- Volunteer ---
const volunteerSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
export const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema, 'volunteers');

// --- Portal ---
const portalSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
export const Portal = mongoose.models.Portal || mongoose.model('Portal', portalSchema, 'portals');

// --- Chairman ---
const chairmanSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
export const Chairman = mongoose.models.Chairman || mongoose.model('Chairman', chairmanSchema, 'chairman');

// --- Program Officer ---
const programOfficerSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
export const ProgramOfficer = mongoose.models.ProgramOfficer || mongoose.model('ProgramOfficer', programOfficerSchema, 'program-officers');

// --- Governing Body ---
const governingBodySchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
governingBodySchema.index({ order: 1 });
export const GoverningBody = mongoose.models.GoverningBody || mongoose.model('GoverningBody', governingBodySchema, 'governing-body');

// --- User ---
const userSchema = new mongoose.Schema({ _id: String }, flexibleOptions);
export const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

// --- Contact ---
const contactSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
export const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema, 'contacts');

// --- Stat (site settings) ---
const statSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
export const Stat = mongoose.models.Stat || mongoose.model('Stat', statSchema, 'stats');

// --- Content ---
// Uses string _id (e.g., 'about', 'hero', 'vision') as natural page keys
const contentSchema = new mongoose.Schema({ _id: String }, flexibleOptions);
export const Content = mongoose.models.Content || mongoose.model('Content', contentSchema, 'content');

// --- Flagship / Initiative ---
const flagshipSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
flagshipSchema.index({ slug: 1 });
flagshipSchema.index({ status: 1, order: 1 });
export const Flagship = mongoose.models.Flagship || mongoose.model('Flagship', flagshipSchema, 'flagships');

// --- Gallery ---
const gallerySchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
gallerySchema.index({ academicYear: 1, order: 1 });
export const GalleryItem = mongoose.models.GalleryItem || mongoose.model('GalleryItem', gallerySchema, 'gallery');

