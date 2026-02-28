'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './volunteer.module.css';
import { motion } from 'framer-motion';

const translations = {
    en: {
        title: 'Join NSS MJCET',
        subtitle: 'Become a volunteer and make a difference in the community',
        name: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
        rollNumber: 'Roll Number',
        department: 'Department',
        year: 'Year',
        interests: 'Areas of Interest',
        message: 'Why do you want to join NSS? (Optional)',
        submitBtn: 'Submit Registration',
        submitting: 'Submitting...',
        success: 'Registration submitted successfully! We will contact you soon.',
        error: 'Failed to submit registration. Please try again.',
        selectYear: 'Select Year',
        selectDept: 'Select Department',
        backHome: 'Back to Home',
    },
    te: {
        title: 'NSS MJCET లో చేరండి',
        subtitle: 'వాలంటీర్ అవ్వండి మరియు సమాజంలో మార్పు తీసుకురండి',
        name: 'పూర్తి పేరు',
        email: 'ఇమెయిల్ చిరునామా',
        phone: 'ఫోన్ నంబర్',
        rollNumber: 'రోల్ నంబర్',
        department: 'విభాగం',
        year: 'సంవత్సరం',
        interests: 'ఆసక్తి ఉన్న రంగాలు',
        message: 'మీరు NSS లో ఎందుకు చేరాలనుకుంటున్నారు? (ఐచ్ఛికం)',
        submitBtn: 'నమోదు సమర్పించండి',
        submitting: 'సమర్పిస్తోంది...',
        success: 'నమోదు విజయవంతంగా సమర్పించబడింది! మేము త్వరలో మిమ్మల్ని సంప్రదిస్తాము.',
        error: 'నమోదు సమర్పించడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్మంది.',
        selectYear: 'సంవత్సరం ఎంచుకోండి',
        selectDept: 'విభాగం ఎంచుకోండి',
        backHome: 'హోమ్‌కు తిరిగి వెళ్ళండి',
    },
    hi: {
        title: 'एनएसएस एमजेसीईटी में शामिल हों',
        subtitle: 'स्वयंसेवक बनें और समुदाय में बदलाव लाएं',
        name: 'पूरा नाम',
        email: 'ईमेल पता',
        phone: 'फ़ोन नंबर',
        rollNumber: 'रोल नंबर',
        department: 'विभाग',
        year: 'वर्ष',
        interests: 'रुचि के क्षेत्र',
        message: 'आप एनएसएस में क्यों शामिल होना चाहते हैं? (वैकल्पिक)',
        submitBtn: 'पंजीकरण जमा करें',
        submitting: 'जमा किया जा रहा है...',
        success: 'पंजीकरण सफलतापूर्वक जमा हो गया! हम जल्द ही आपसे संपर्क करेंगे।',
        error: 'पंजीकरण जमा करने में विफल। कृपया पुन: प्रयास करें।',
        selectYear: 'वर्ष चुनें',
        selectDept: 'विभाग चुनें',
        backHome: 'होम पर वापस जाएं',
    },
};

const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
];

const interestAreas = [
    'Community Service',
    'Health & Hygiene',
    'Environmental Conservation',
    'Education & Literacy',
    'Blood Donation',
    'Disaster Management',
    'Women Empowerment',
    'Youth Development',
];

export default function VolunteerPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        rollNumber: '',
        department: '',
        year: '',
        interests: [],
        message: '',
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleInterestChange = (interest) => {
        const newInterests = formData.interests.includes(interest)
            ? formData.interests.filter(i => i !== interest)
            : [...formData.interests, interest];

        setFormData({
            ...formData,
            interests: newInterests,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch('/api/volunteer/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: t.success });
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    rollNumber: '',
                    department: '',
                    year: '',
                    interests: [],
                    message: '',
                });
            } else {
                setStatus({ type: 'error', message: data.error || t.error });
            }
        } catch (error) {
            setStatus({ type: 'error', message: t.error });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.volunteerPage}>
            <div className="container">
                <Link href="/" className={styles.backButton}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {t.backHome}
                </Link>

                <header className={styles.header}>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {t.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {t.subtitle}
                    </motion.p>
                </header>

                <motion.div
                    className={styles.formContainer}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    {status.message && (
                        <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-8)' }}>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className="grid grid-cols-2">
                            <div className="form-group">
                                <label htmlFor="name" className="marvelous-label">{t.name} *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="marvelous-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className="marvelous-label">{t.email} *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="marvelous-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="yourname@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone" className="marvelous-label">{t.phone} *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="marvelous-input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="10-digit number"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="rollNumber" className="marvelous-label">{t.rollNumber} *</label>
                                <input
                                    type="text"
                                    id="rollNumber"
                                    name="rollNumber"
                                    className="marvelous-input"
                                    value={formData.rollNumber}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="e.g. 1604-XX-XXX-XXX"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="department" className="marvelous-label">{t.department} *</label>
                                <select
                                    id="department"
                                    name="department"
                                    className="marvelous-input marvelous-select"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">{t.selectDept}</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="year" className="marvelous-label">{t.year} *</label>
                                <select
                                    id="year"
                                    name="year"
                                    className="marvelous-input marvelous-select"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">{t.selectYear}</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="marvelous-label">{t.interests}</label>
                            <div className={styles.interestsGrid}>
                                {interestAreas.map((interest, index) => (
                                    <motion.label
                                        key={interest}
                                        className={styles.checkboxLabel}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        viewport={{ once: true }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.interests.includes(interest)}
                                            onChange={() => handleInterestChange(interest)}
                                            disabled={loading}
                                        />
                                        <span>{interest}</span>
                                    </motion.label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message" className="marvelous-label">{t.message}</label>
                            <textarea
                                id="message"
                                name="message"
                                className="marvelous-input marvelous-textarea"
                                value={formData.message}
                                onChange={handleChange}
                                disabled={loading}
                                rows="4"
                                placeholder="Tell us why you'd like to join our unit..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="marvelous-btn marvelous-btn-secondary marvelous-btn-lg"
                            style={{ width: '100%', marginTop: 'var(--space-8)' }}
                            disabled={loading}
                        >
                            {loading ? t.submitting : t.submitBtn}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
