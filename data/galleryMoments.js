/**
 * NSS MJCET Gallery Moments Data
 * 
 * HOW TO ADD OR REPLACE PHOTOS:
 * 1. Place your photo inside /public/uploads/ or /public/gallery-placeholders/
 * 2. Add an entry to the `galleryMoments` array below with:
 *      - id: unique string identifier (e.g. 'moment-1')
 *      - src: image path starting from / (e.g. '/gallery-placeholders/moment-1.svg' or '/uploads/events/photo.jpg')
 *      - date: ISO date string 'YYYY-MM-DD' (e.g. '2026-03-14')
 * 
 * Note: Only id, src, and date are used. Titles, categories, locations, and captions are intentionally omitted.
 */

export const galleryMoments = [
    { id: 'moment-1', src: '/gallery-placeholders/moment-1.svg', date: '2026-03-14' },
    { id: 'moment-2', src: '/gallery-placeholders/moment-2.svg', date: '2026-03-08' },
    { id: 'moment-3', src: '/gallery-placeholders/moment-3.svg', date: '2026-02-27' },
    { id: 'moment-4', src: '/gallery-placeholders/moment-4.svg', date: '2026-02-18' },
    { id: 'moment-5', src: '/gallery-placeholders/moment-5.svg', date: '2026-02-11' },
    { id: 'moment-6', src: '/gallery-placeholders/moment-6.svg', date: '2026-01-26' },
    { id: 'moment-7', src: '/gallery-placeholders/moment-7.svg', date: '2026-01-15' },
    { id: 'moment-8', src: '/gallery-placeholders/moment-8.svg', date: '2025-12-28' },
    { id: 'moment-9', src: '/gallery-placeholders/moment-9.svg', date: '2025-12-19' },
    { id: 'moment-10', src: '/gallery-placeholders/moment-10.svg', date: '2025-11-30' },
    { id: 'moment-11', src: '/gallery-placeholders/moment-11.svg', date: '2025-11-14' },
    { id: 'moment-12', src: '/gallery-placeholders/moment-12.svg', date: '2025-10-24' },
    { id: 'moment-13', src: '/gallery-placeholders/moment-13.svg', date: '2025-10-02' },
    { id: 'moment-14', src: '/gallery-placeholders/moment-14.svg', date: '2025-09-18' },
    { id: 'moment-15', src: '/gallery-placeholders/moment-15.svg', date: '2025-08-29' },
    { id: 'moment-16', src: '/gallery-placeholders/moment-16.svg', date: '2025-08-15' }
];

export default galleryMoments;
