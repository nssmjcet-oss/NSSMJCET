import "./globals.css";
import Providers from "./providers";

export const metadata = {
    metadataBase: new URL('https://nssmjcet.vercel.app'),
    title: {
        default: 'NSS MJCET — National Service Scheme',
        template: '%s | NSS MJCET',
    },
    description: 'Official website of NSS MJCET — National Service Scheme, Muffakham Jah College of Engineering and Technology, Hyderabad. Empowering students through service, leadership, and community development.',
    keywords: ['NSS MJCET', 'National Service Scheme', 'NSS Muffakham Jah', 'MJCET NSS', 'NSS Hyderabad', 'Not Me But You', 'NSS Volunteers'],
    authors: [{ name: 'NSS MJCET' }],
    creator: 'NSS MJCET',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://nssmjcet.vercel.app',
        siteName: 'NSS MJCET',
        title: 'NSS MJCET — National Service Scheme',
        description: 'Official website of NSS MJCET — Muffakham Jah College of Engineering and Technology. Empowering students through service and community development.',
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
    // Google Search Console verification — add your code after Vercel deployment
    // verification: {
    //     google: 'YOUR_GOOGLE_SITE_VERIFICATION_CODE',
    // },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="light">
            <body className="marvelous-theme">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
