/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        // Remove console.logs automatically in production builds
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error'],
        } : false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'nssmjcet.vercel.app' }],
                destination: 'https://www.nssmjcet.in/:path*',
                permanent: true,
            },
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'nssmjcet.in' }],
                destination: 'https://www.nssmjcet.in/:path*',
                permanent: true,
            }
        ];
    },
}


module.exports = nextConfig