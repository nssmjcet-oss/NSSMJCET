import "./globals.css";
import Providers from "./providers";

export const metadata = {
    metadataBase: new URL('https://nssmjcet.vercel.app'),
    title: 'NSS MJCET | National Service Scheme – Muffakham Jah College of Engineering & Technology',
    description: 'Official website of NSS MJCET – National Service Scheme Muffakham Jah College of Engineering & Technology. Explore events, volunteer initiatives, social activities and student engagement programs.',
    keywords: ['NSS MJCET', 'National Service Scheme MJCET', 'NSS Muffakham Jah College', 'NSS Hyderabad', 'NSS Volunteers'],
    authors: [{ name: 'NSS MJCET' }],
    creator: 'NSS MJCET',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://nssmjcet.vercel.app',
        siteName: 'NSS MJCET',
        title: 'NSS MJCET Official Website',
        description: 'Official platform for NSS MJCET events, volunteer activities and social initiatives.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'NSS MJCET — National Service Scheme',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NSS MJCET — National Service Scheme',
        description: 'Official website of NSS MJCET. Not Me But You.',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    verification: {
        google: 'googleb1d6eccf08c6d058',
    },
};

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NSS MJCET",
    "alternateName": "National Service Scheme MJCET",
    "url": "https://nssmjcet.vercel.app/"
};

const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NSS MJCET",
    "url": "https://nssmjcet.vercel.app",
    "logo": "https://nssmjcet.vercel.app/logo.png",
    "description": "Official website of NSS MJCET showcasing social initiatives, volunteer activities, community programs and events.",
    "sameAs": [
        "https://www.instagram.com/nssmjcet"
    ]
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="light">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
            </head>
            <body className="marvelous-theme">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
