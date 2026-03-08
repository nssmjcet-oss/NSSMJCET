export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
        sitemap: 'https://nssmjcet.vercel.app/sitemap.xml',
    };
}
