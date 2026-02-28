'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './contact.module.css';
import { motion } from 'framer-motion';

const translations = {
    en: {
        title: 'Contact Us',
        subtitle: 'Get in touch with NSS MJCET',
        name: 'Your Name',
        email: 'Your Email',
        subject: 'Subject',
        message: 'Message',
        send: 'Send Message',
        sending: 'Sending...',
        success: 'Message sent successfully! We will get back to you soon.',
        error: 'Failed to send message. Please try again.',
        address: 'Address',
        phone: 'Phone',
        emailLabel: 'Email',
        followUs: 'Follow Us',
        getInTouch: 'Get In Touch',
        getInTouchText: 'Have questions or want to get involved? Reach out to us!',
        sendMessage: 'Send Us a Message',
    },
    te: {
        title: 'మమ్మల్ని సంప్రదించండి',
        subtitle: 'NSS MJCET తో సంప్రదించండి',
        name: 'మీ పేరు',
        email: 'మీ ఇమెయిల్',
        subject: 'విషయం',
        message: 'సందేశం',
        send: 'సందేశం పంపండి',
        sending: 'పంపుతోంది...',
        success: 'సందేశం విజయవంతంగా పంపబడింది! మేము త్వరలో మిమ్మల్ని సంప్రదిస్తాము.',
        error: 'సందేశం పంపడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
        address: 'చిరునామా',
        phone: 'ఫోన్',
        emailLabel: 'ఇమెయిల్',
        followUs: 'మమ్మల్ని అనుసరించండి',
        getInTouch: 'సంప్రదించండి',
        getInTouchText: 'ప్రశ్నలు ఉన్నాయా లేదా పాల్గొనాలనుకుంటున్నారా? మమ్మల్ని సంప్రదించండి!',
        sendMessage: 'మాకు సందేశం పంపండి',
    },
    hi: {
        title: 'हमसे संपर्क करें',
        subtitle: 'एनएसएस एमजेसीईटी के साथ जुड़ें',
        name: 'आपका नाम',
        email: 'आपका ईमेल',
        subject: 'विषय',
        message: 'संदेश',
        send: 'संदेश भेजें',
        sending: 'भेजा जा रहा है...',
        success: 'संदेश सफलतापूर्वक भेजा गया! हम जल्द ही आपसे संपर्क करेंगे।',
        error: 'संदेश भेजने में विफल। कृपया पुन: प्रयास करें।',
        address: 'पता',
        phone: 'फ़ोन',
        emailLabel: 'ईमेल',
        followUs: 'हमें फॉलो करें',
        getInTouch: 'संपर्क में रहें',
        getInTouchText: 'क्या आपके पास प्रश्न हैं या आप शामिल होना चाहते हैं? हमसे संपर्क करें!',
        sendMessage: 'हमें संदेश भेजें',
    },
};

export default function ContactPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch('/api/contact', {
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
                    subject: '',
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
        <div className={styles.contactPage}>
            <section className={styles.hero}>
                <div className="container">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {t.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {t.subtitle}
                    </motion.p>
                </div>
            </section>

            <div className="container">
                <div className={styles.contactGrid}>
                    <motion.div
                        className={styles.contactInfo}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2>{t.getInTouch}</h2>
                        <p>{t.getInTouchText}</p>

                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>📍</div>
                                <div>
                                    <h4>{t.address}</h4>
                                    <p>Muffakham Jah College of Engineering & Technology</p>
                                    <p>Road No. 3, Banjara Hills</p>
                                    <p>Hyderabad - 500034, Telangana</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>📞</div>
                                <div>
                                    <h4>{t.phone}</h4>
                                    <p>+91 99637 43377</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>📧</div>
                                <div>
                                    <h4>{t.emailLabel}</h4>
                                    <p>nssmjcet@mjcollege.ac.in</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.social}>
                            <h4>{t.followUs}</h4>
                            <div className={styles.socialLinks}>
                                <a href="https://www.youtube.com/@NSSMJCET" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="YouTube">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                                <a href="https://www.instagram.com/nssmjcet/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                                    </svg>
                                </a>
                                <a href="https://www.linkedin.com/company/nss-mjcet1/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.contactForm}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h2>{t.sendMessage}</h2>

                        {status.message && (
                            <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-6)' }}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
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
                                    placeholder="Your full name"
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
                                <label htmlFor="subject" className="marvelous-label">{t.subject} *</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    className="marvelous-input"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="What is this regarding?"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message" className="marvelous-label">{t.message} *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className="marvelous-input marvelous-textarea"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    rows="6"
                                    placeholder="Type your message here..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="marvelous-btn marvelous-btn-primary marvelous-btn-lg"
                                style={{ width: '100%' }}
                                disabled={loading}
                            >
                                {loading ? t.sending : t.send}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
