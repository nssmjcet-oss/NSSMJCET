'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopProgressBar from "@/components/TopProgressBar";

/**
 * PublicShell conditionally hides the Navbar, TopProgressBar, and Footer
 * ONLY on the /gallery route so it functions as a full-screen standalone experience.
 * Every other page (Home, About, Events, Team, etc.) retains the full layout.
 */
export default function PublicShell({ children }) {
    const pathname = usePathname();
    const isGallery = pathname === '/gallery';

    return (
        <main className="marvelous-theme">
            {!isGallery && <TopProgressBar />}
            {!isGallery && <Navbar />}
            {children}
            {!isGallery && <Footer />}
        </main>
    );
}
