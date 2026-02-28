// Metadata for About page — this layout wraps the 'use client' AboutPage component
export const metadata = {
    title: 'About NSS MJCET',
    description: 'Learn about the National Service Scheme at Muffakham Jah College of Engineering and Technology — our history, objectives, and community mission.',
    openGraph: {
        title: 'About NSS MJCET — National Service Scheme',
        description: 'Learn about NSS MJCET, our objectives, the Ashoka Chakra symbolism, and our community service legacy.',
        url: 'https://nssmjcet.vercel.app/about',
    },
};

export default function AboutLayout({ children }) {
    return children;
}
