export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/admin/',
                    '/api/auth/',
                    '/login',
                    '/debug-auth/',
                ],
            },
        ],
        sitemap: 'https://www.nssmjcet.in/sitemap.xml',
    };
}


