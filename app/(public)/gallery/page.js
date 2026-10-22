'use client';

import DriftingGallery from '@/components/DriftingGallery';
import { galleryMoments } from '@/data/galleryMoments';

/**
 * Public Full-Screen Gallery Page (/gallery)
 * Navbar, hero header, and footer are hidden on this route (controlled by PublicShell).
 * Full 100dvh viewport, floating menu button, logo, and editable settings from Admin.
 */
export default function GalleryPage() {
    return (
        <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', margin: 0, padding: 0 }}>
            <DriftingGallery initialMoments={galleryMoments} />
        </div>
    );
}
