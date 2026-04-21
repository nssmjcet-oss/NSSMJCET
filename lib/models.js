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
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema, 'events');

// --- Announcement ---
const announcementSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema, 'announcements');

// --- Developer ---
const developerSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
export const Developer = mongoose.models.Developer || mongoose.model('Developer', developerSchema, 'developers');

// --- Team ---
const teamSchema = new mongoose.Schema({ _id: idField }, flexibleOptions);
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
