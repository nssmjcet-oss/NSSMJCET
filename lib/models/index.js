import mongoose from 'mongoose';

// A utility to create schema-less models. 
// This perfectly mimics Firestore, letting us save any fields without defining them rigidly.
const createFlexibleModel = (name, collectionName) => {
    // Return existing model if it's already compiled (prevents hot-reload overwrite issues)
    if (mongoose.models[name]) {
        return mongoose.models[name];
    }
    const schema = new mongoose.Schema({
        _id: String, // We will manually map the Firestore document ID to the MongoDB _id
    }, { 
        strict: false, // This is the magic! It allows any field to be saved.
        collection: collectionName,
        timestamps: false // We will handle our own timestamps as imported from Firestore
    });
    return mongoose.model(name, schema);
};

export const Event = createFlexibleModel('Event', 'events');
export const Announcement = createFlexibleModel('Announcement', 'announcements');
export const Developer = createFlexibleModel('Developer', 'developers');
export const ProgramOfficer = createFlexibleModel('ProgramOfficer', 'program-officers');
export const Volunteer = createFlexibleModel('Volunteer', 'volunteers');
export const Portal = createFlexibleModel('Portal', 'portals');
export const GoverningBody = createFlexibleModel('GoverningBody', 'governing-body');
export const Chairman = createFlexibleModel('Chairman', 'chairman');
export const Stat = createFlexibleModel('Stat', 'stats');
export const Contact = createFlexibleModel('Contact', 'contacts');
export const User = createFlexibleModel('User', 'users');
export const Content = createFlexibleModel('Content', 'content');
export const Team = createFlexibleModel('Team', 'team');
