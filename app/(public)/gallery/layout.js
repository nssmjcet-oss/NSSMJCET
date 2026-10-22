// Metadata for Gallery page — wraps the 'use client' GalleryPage component
export const metadata = {
    title: 'Gallery — NSS MJCET Volunteer Moments',
    description: 'Real moments from NSS MJCET volunteers — the people who show up, work hard and enjoy every step of the journey.',
    alternates: {
        canonical: 'https://www.nssmjcet.in/gallery',
    },
    openGraph: {
        title: 'Gallery — NSS MJCET Volunteer Moments',
        description: 'A living gallery of volunteer moments from NSS MJCET. Browse candid photos from service drives, camps, and community outreach.',
        url: 'https://www.nssmjcet.in/gallery',
    },
};

export default function GalleryLayout({ children }) {
    return children;
}
