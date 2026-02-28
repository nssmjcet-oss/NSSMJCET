'use client';

import { useState, useEffect } from 'react';
import styles from './unit.module.css';
import FacultyAdvisor from '@/components/FacultyAdvisor';
import { Users, Calendar, Clock, Mail, Phone, MapPin, Star } from 'lucide-react';

const focusAreas = [
    "Community Service and Development",
    "Health and Hygiene Awareness",
    "Environmental Conservation",
    "Education and Literacy Programs",
    "Blood Donation Camps",
    "Disaster Management and Relief"
];

export default function UnitPage() {
    const [stats, setStats] = useState({ totalVolunteers: 0, totalEvents: 0, serviceHours: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Fetch centralized stats - optimized and accurate
                const res = await fetch('/api/stats', { cache: 'no-store' });
                const data = await res.json();

                if (res.ok) {
                    setStats({
                        totalVolunteers: data.volunteers || 0,
                        totalEvents: data.events || 0,
                        serviceHours: data.serviceHours || 0,
                    });
                }
            } catch (err) {
                console.error('Error fetching unit stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const { totalVolunteers, totalEvents, serviceHours } = stats;

    return (
        <div className={styles.unitPage}>
            <section className={styles.hero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>NSS Unit - MJCET</h1>
                    <p className={styles.heroSubtitle}>Muffakham Jah College of Engineering &amp; Technology</p>
                </div>
            </section>

            {/* Faculty Advisor Section */}
            <FacultyAdvisor />

            <div className="container">
                <main className={styles.contentContainer}>
                    <div className={styles.mainCard}>
                        <h2 className={styles.unitTitle}>About Our Unit</h2>

                        <p className={styles.unitDescription}>
                            The NSS Unit at Muffakham Jah College of Engineering &amp; Technology has been actively serving the community
                            since its establishment. Our unit is dedicated to fostering social responsibility and community engagement
                            among students through various service activities and programs.
                        </p>

                        <div className={styles.statsGrid}>
                            <div className={styles.statBox}>
                                <div className={styles.statIconWrapper}>
                                    <Users className={styles.statIcon} />
                                </div>
                                <span className={styles.statValue}>
                                    {loading ? '...' : totalVolunteers > 0 ? totalVolunteers + '+' : '0'}
                                </span>
                                <span className={styles.statLabel}>Active Volunteers</span>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statIconWrapper}>
                                    <Calendar className={styles.statIcon} />
                                </div>
                                <span className={styles.statValue}>
                                    {loading ? '...' : totalEvents > 0 ? totalEvents + '+' : '0'}
                                </span>
                                <span className={styles.statLabel}>Events Conducted</span>
                            </div>
                            <div className={styles.statBox}>
                                <div className={styles.statIconWrapper}>
                                    <Clock className={styles.statIcon} />
                                </div>
                                <span className={styles.statValue}>
                                    {loading ? '...' : serviceHours > 0 ? serviceHours + '+' : '0'}
                                </span>
                                <span className={styles.statLabel}>Service Hours</span>
                            </div>
                        </div>

                        <h3 className={styles.sectionTitle}>Our Focus Areas</h3>
                        <div className={styles.focusList}>
                            {focusAreas.map((area, index) => (
                                <div key={index} className={styles.focusBox}>
                                    <Star size={18} className={styles.focusIcon} />
                                    <span>{area}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.contactBox}>
                            <h4>Contact Information</h4>
                            <div className={styles.contactList}>
                                <div className={styles.contactRow}>
                                    <div className={styles.contactIconWrapper}>
                                        <Mail size={18} />
                                    </div>
                                    <div className={styles.contactText}>
                                        <label>Email</label>
                                        <span>nssmjcet@mjcollege.ac.in</span>
                                    </div>
                                </div>
                                <div className={styles.contactRow}>
                                    <div className={styles.contactIconWrapper}>
                                        <Phone size={18} />
                                    </div>
                                    <div className={styles.contactText}>
                                        <label>Phone</label>
                                        <span>+91 99637 43377</span>
                                    </div>
                                </div>
                                <div className={styles.contactRow}>
                                    <div className={styles.contactIconWrapper}>
                                        <MapPin size={18} />
                                    </div>
                                    <div className={styles.contactText}>
                                        <label>Address</label>
                                        <span>MJCET, Road No. 3, Banjara Hills, Hyderabad - 500034</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
