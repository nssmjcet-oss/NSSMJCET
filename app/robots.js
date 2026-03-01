export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/api'],
            },
        ],
        sitemap: 'https://nssmjcet.vercel.app/sitemap.xml',
    };
}
