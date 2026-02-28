'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import styles from './login.module.css';

const translations = {
    en: {
        title: 'Login to NSS MJCET',
        subtitle: 'Admin and Member Access',
        email: 'Email Address',
        password: 'Password',
        loginBtn: 'Login',
        loggingIn: 'Logging in...',
        backHome: 'Back to Home',
        error: 'Login failed. Please check your credentials.',
    },
    te: {
        title: 'NSS MJCET లాగిన్',
        subtitle: 'అడ్మిన్ మరియు మెంబర్ యాక్సెస్',
        email: 'ఇమెయిల్ చిరునామా',
        password: 'పాస్‌వర్డ్',
        loginBtn: 'లాగిన్',
        loggingIn: 'లాగిన్ అవుతోంది...',
        backHome: 'హోమ్‌కు తిరిగి వెళ్ళండి',
        error: 'లాగిన్ విఫలమైంది. దయచేసి మీ ఆధారాలను తనిఖీ చేయండి.',
    },
    hi: {
        title: 'एनएसएस एमजेसीईटी लॉगिन',
        subtitle: 'एडमिन और सदस्य एक्सेस',
        email: 'ईमेल पता',
        password: 'पासवर्ड',
        loginBtn: 'लॉगिन',
        loggingIn: 'लॉगिन हो रहा है...',
        backHome: 'होम पर वापस जाएं',
        error: 'लॉगिन विफल रहा। कृपया अपने क्रेडेंशियल्स की जांच करें।',
    },
};

export default function LoginPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const { login } = useAuth();
    const t = translations[language];

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            // Redirect to admin
            router.push('/admin');
            router.refresh();
        } catch (err) {
            console.error('Firebase login error:', err);
            setError(t.error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <main className="marvelous-theme">
            <div className={styles.loginPage}>
                <div className="ornament1" style={{ top: '10%', right: '10%' }} />
                <div className="ornament2" style={{ bottom: '10%', left: '10%' }} />
                <div className={styles.loginContainer}>
                    <div className={styles.loginCard}>
                        <div className={styles.loginHeader}>
                            <div className={styles.logoIconImage}>
                                <img src="/uploads/nss-logo (1).png" alt="NSS Logo" width={80} height={80} style={{ objectFit: 'contain', margin: '0 auto', display: 'block' }} />
                            </div>
                            <h1>{t.title}</h1>
                            <p>{t.subtitle}</p>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.loginForm}>
                            <div className="form-group">
                                <label htmlFor="email" className="label">{t.email}</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="label">{t.password}</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        className="input"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            color: '#666',
                                        }}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                disabled={loading}
                            >
                                {loading ? t.loggingIn : t.loginBtn}
                            </button>
                        </form>

                        <div className={styles.loginFooter}>
                            <Link href="/" className={styles.backLink}>
                                ← {t.backHome}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
