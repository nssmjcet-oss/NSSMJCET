/**
 * Shared navigation definitions used across Navbar and Gallery Floating Menu.
 */

export const navTranslations = {
    en: {
        home: 'Home',
        about: 'About NSS',
        unit: 'Unit Details',
        events: 'Events',
        gallery: 'Gallery',
        team: 'Team',
        announcements: 'Announcements',
        volunteer: 'Join Us',
        contact: 'Contact',
        login: 'Login',
        admin: 'Admin',
        logout: 'Logout',
    },
    te: {
        home: 'హోమ్',
        about: 'NSS గురించి',
        unit: 'యూనిట్ వివరాలు',
        events: 'ఈవెంట్స్',
        gallery: 'గ్యాలరీ',
        team: 'టీమ్',
        announcements: 'ప్రకటనలు',
        volunteer: 'మాతో చేరండి',
        contact: 'సంప్రదించండి',
        login: 'లాగిన్',
        admin: 'అడ్మిన్',
        logout: 'లాగ్ అవుట్',
    },
    hi: {
        home: 'होम',
        about: 'एनएसएस के बारे में',
        unit: 'यूनिट विवरण',
        events: 'कार्यक्रम',
        gallery: 'गैलरी',
        team: 'टीम',
        announcements: 'घोषणाएं',
        volunteer: 'हमसे जुड़ें',
        contact: 'संपर्क',
        login: 'लॉगिन',
        admin: 'एडमिन',
        logout: 'लॉगआउट',
    },
};

export function getNavItems(language = 'en') {
    const t = navTranslations[language] || navTranslations.en;
    return [
        { label: t.home, href: '/' },
        { label: t.about, href: '/about' },
        { label: t.unit, href: '/unit' },
        { label: t.events, href: '/events' },
        { label: t.gallery, href: '/gallery' },
        { label: t.team, href: '/team' },
        { label: t.announcements, href: '/announcements' },
        { label: t.contact, href: '/contact' },
    ];
}
