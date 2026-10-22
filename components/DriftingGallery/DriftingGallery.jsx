'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDriftLoop } from './useDriftLoop';
import GalleryMenu from '@/components/GalleryMenu/GalleryMenu';
import styles from './DriftingGallery.module.css';

/**
 * Format ISO date string according to settings format
 */
function formatMomentDate(dateStr, format = 'DD MMM YYYY') {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = months[monthNum - 1] || parts[1];

        if (format === 'MMM DD, YYYY') return `${monthName} ${day}, ${year}`;
        if (format === 'YYYY-MM-DD') return `${year}-${monthStr}-${dayStr}`;
        if (format === 'DD/MM/YYYY') return `${dayStr}/${monthStr}/${year}`;
        // Default DD MMM YYYY
        return `${day} ${monthName} ${year}`;
    }
    return dateStr;
}

function formatAltText(dateStr) {
    if (!dateStr) return 'Volunteer moment';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = months[monthNum - 1] || parts[1];
        return `Volunteer moment, ${day} ${monthName} ${year}`;
    }
    return `Volunteer moment, ${dateStr}`;
}

/**
 * Compute target card count based on screen area:
 * aiming for ~1 card per 55,000-65,000 px²
 * 1920x1080 -> about 32-38 cards (~36)
 * 1440x900  -> about 20-24 cards (~22)
 * tablet    -> about 14-18 cards (~16)
 * phone     -> about 8-10 cards (~9)
 */
function computeAreaCardCount(width, height) {
    const area = width * height;
    if (width <= 768) {
        // Mobile (e.g. 390x844 = 329k)
        const count = Math.round(area / 36000);
        return Math.max(8, Math.min(10, count));
    } else if (width <= 1024) {
        // Tablet (e.g. 768x1024 = 786k, 820x1180 = 967k)
        const count = Math.round(area / 54000);
        return Math.max(14, Math.min(18, count));
    } else if (width <= 1440) {
        // Laptop (e.g. 1440x900 = 1.29M)
        const count = Math.round(area / 58000);
        return Math.max(20, Math.min(24, count));
    } else {
        // Desktop / 4K (e.g. 1920x1080 = 2.07M)
        const count = Math.round(area / 58000);
        return Math.max(32, Math.min(38, count));
    }
}

function getCardBaseSize(layer, isMobile, isTablet) {
    if (layer === 0) {
        // Far: ~90px desktop, ~77px tablet, ~65px mobile
        return isMobile ? 65 : isTablet ? 77 : 90;
    } else if (layer === 1) {
        // Mid: ~130px desktop, ~110px tablet, ~95px mobile
        return isMobile ? 95 : isTablet ? 110 : 130;
    } else {
        // Near: ~170px desktop, ~145px tablet, ~125px mobile
        return isMobile ? 125 : isTablet ? 145 : 170;
    }
}

/**
 * Jittered-grid placement covering WHOLE screen (edges, corners, and centre)
 */
function generateJitteredGrid(count, width, height, isMobile, isTablet, scaleMult) {
    const aspect = width / height;
    const cols = Math.max(1, Math.round(Math.sqrt(count * aspect)));
    const rows = Math.ceil(count / cols);
    const cellW = width / cols;
    const cellH = height / rows;

    const cards = [];
    for (let i = 0; i < count; i++) {
        const layer = i % 3; // 0 = far, 1 = mid, 2 = near
        const baseSize = getCardBaseSize(layer, isMobile, isTablet);
        const size = Math.round(baseSize * scaleMult);

        const r = Math.floor(i / cols);
        const c = i % cols;

        const x0 = c * cellW + (cellW - size) / 2;
        const y0 = r * cellH + (cellH - size) / 2;

        const maxJitterX = Math.max(0, (cellW - size) * 0.55);
        const maxJitterY = Math.max(0, (cellH - size) * 0.55);

        const jitterX = (Math.random() - 0.5) * 2 * maxJitterX;
        const jitterY = (Math.random() - 0.5) * 2 * maxJitterY;

        const x = Math.max(10, Math.min(width - size - 10, x0 + jitterX));
        const y = Math.max(10, Math.min(height - size - 10, y0 + jitterY));

        cards.push({ x, y, size, layer });
    }
    return cards;
}

/**
 * Assign photo moments to cards such that duplicate photos are maximally
 * separated on screen and never appear next to each other.
 */
function assignPhotosDispersed(positions, momentsLength) {
    const n = positions.length;
    if (momentsLength <= 1) {
        return new Array(n).fill(0);
    }

    const assigned = new Array(n);
    const photoPlacements = Array.from({ length: momentsLength }, () => []);

    // 1. Assign unique photos first
    const firstPass = Math.min(n, momentsLength);
    for (let i = 0; i < firstPass; i++) {
        assigned[i] = i;
        photoPlacements[i].push(positions[i]);
    }

    // 2. For remaining cards, greedily pick the candidate with minimum representation
    // and maximum Euclidean distance to its existing clones
    for (let i = firstPass; i < n; i++) {
        const pos = positions[i];

        let minCount = Infinity;
        for (let m = 0; m < momentsLength; m++) {
            if (photoPlacements[m].length < minCount) minCount = photoPlacements[m].length;
        }

        const candidates = [];
        for (let m = 0; m < momentsLength; m++) {
            if (photoPlacements[m].length <= minCount) candidates.push(m);
        }

        let bestPhoto = candidates[0];
        let maxMinDist = -1;

        for (const m of candidates) {
            let minDist = Infinity;
            for (const existingPos of photoPlacements[m]) {
                const dx = pos.x - existingPos.x;
                const dy = pos.y - existingPos.y;
                const d = dx * dx + dy * dy;
                if (d < minDist) minDist = d;
            }
            if (minDist > maxMinDist) {
                maxMinDist = minDist;
                bestPhoto = m;
            }
        }

        assigned[i] = bestPhoto;
        photoPlacements[bestPhoto].push(pos);
    }

    return assigned;
}

export default function DriftingGallery({ initialMoments = [], initialSettings = {} }) {
    const { language } = useLanguage();
    const containerRef = useRef(null);
    const cardElsRef = useRef([]);
    const cardsStateRef = useRef([]);
    const cardsDataRef = useRef([]);
    const sourceRectRef = useRef(null);

    // Live data & settings state
    const [moments, setMoments] = useState(initialMoments);
    const [settings, setSettings] = useState({
        speedMultiplier: 2,
        maxDesktopCards: 60,
        maxMobileCards: 20,
        repeatPhotos: true,
        cardScale: 'medium',
        autoSpotlight: true,
        spotlightDelay: 6,
        dateFormat: 'DD MMM YYYY',
        showLogo: true,
        showMenuButton: true,
        showHeader: false,
        allowDrag: true,
        dragEffects: true,
        showDragHint: true,
        ...initialSettings,
    });

    const [portalMounted, setPortalMounted] = useState(false);
    const [enlargedIndex, setEnlargedIndex] = useState(null);
    const [cardsData, setCardsData] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [throttleReduction, setThrottleReduction] = useState(0);

    // Touch swipe handling
    const touchStartXRef = useRef(null);

    // Auto spotlight
    const spotlightTimerRef = useRef(null);
    const hasInteractedRef = useRef(false);

    // Drag hint pill state & touch detection
    const [hintVisible, setHintVisible] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const hintDismissedRef = useRef(false);

    const dismissHint = useCallback(() => {
        if (!hintDismissedRef.current) {
            hintDismissedRef.current = true;
            setHintVisible(false);
            try {
                localStorage.setItem('nssGalleryDragHintSeen', '1');
            } catch {}
        }
    }, []);

    // Drag hint timing & touch detection
    useEffect(() => {
        try {
            if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
                setIsTouchDevice(true);
            }
        } catch {}

        let seen = false;
        try {
            seen = !!localStorage.getItem('nssGalleryDragHintSeen');
        } catch {}

        if (seen) {
            hintDismissedRef.current = true;
            return;
        }

        if (settings.allowDrag === false || settings.showDragHint === false) {
            return;
        }

        // Show at 2s
        const showTimer = setTimeout(() => {
            if (!hintDismissedRef.current) {
                setHintVisible(true);
            }
        }, 2000);

        // Auto hide after 7.5s (stays visible ~5.5s)
        const hideTimer = setTimeout(() => {
            setHintVisible(false);
        }, 7500);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [settings.allowDrag, settings.showDragHint]);

    // Keep cardsDataRef in sync
    useEffect(() => {
        cardsDataRef.current = cardsData;
    }, [cardsData]);

    // Fetch fresh moments & settings from API on client mount
    useEffect(() => {
        setPortalMounted(true);

        fetch('/api/gallery', { cache: 'no-store' })
            .then((r) => r.json())
            .then((data) => {
                if (data.photos && data.photos.length > 0) {
                    setMoments(data.photos);
                }
                if (data.settings) {
                    setSettings((prev) => ({
                        ...prev,
                        ...data.settings,
                    }));
                }
            })
            .catch(() => {});
    }, []);

    // Recycle photo when card leaves screen:
    // Pick photo that is currently least visible, and farthest from re-entering card
    const handleMomentRecycle = useCallback((cardIndex, newX, newY) => {
        const totalMoments = moments.length;
        if (!totalMoments || totalMoments === 1) return;

        const currentData = cardsDataRef.current;
        const currentStates = cardsStateRef.current;

        // Count occurrences of each photo currently on screen
        const counts = new Array(totalMoments).fill(0);
        const positionsByPhoto = Array.from({ length: totalMoments }, () => []);

        currentData.forEach((c, idx) => {
            if (idx !== cardIndex && c.momentIndex < totalMoments) {
                counts[c.momentIndex]++;
                const s = currentStates[idx];
                if (s) positionsByPhoto[c.momentIndex].push(s);
            }
        });

        // Find least visible photo(s)
        let minCount = Infinity;
        for (let m = 0; m < totalMoments; m++) {
            if (counts[m] < minCount) minCount = counts[m];
        }

        const candidates = [];
        for (let m = 0; m < totalMoments; m++) {
            if (counts[m] === minCount) candidates.push(m);
        }

        // Pick candidate whose nearest instance is farthest from (newX, newY)
        let bestMoment = candidates[0];
        let maxMinDist = -1;

        for (const m of candidates) {
            let minDist = Infinity;
            for (const pos of positionsByPhoto[m]) {
                const dx = newX - pos.x;
                const dy = newY - pos.y;
                const d = dx * dx + dy * dy;
                if (d < minDist) minDist = d;
            }
            if (minDist > maxMinDist) {
                maxMinDist = minDist;
                bestMoment = m;
            }
        }

        setCardsData((prev) => {
            const next = [...prev];
            if (next[cardIndex]) {
                next[cardIndex] = { ...next[cardIndex], momentIndex: bestMoment };
            }
            return next;
        });
    }, [moments.length]);

    // Adaptive throttle callback if frame rate drops under heavy load
    const handleAdaptiveThrottle = useCallback(() => {
        setThrottleReduction((prev) => Math.min(10, prev + 2));
    }, []);

    const currentEnlargedCard = enlargedIndex !== null ? cardsData[enlargedIndex] : null;
    const currentEnlargedId = currentEnlargedCard ? currentEnlargedCard.id : null;

    // Physics & Drift hook
    const { setPointer, triggerRipple, startDrag, updateDrag, endDrag, cancelDrag } = useDriftLoop({
        containerRef,
        cardElsRef,
        cardsStateRef,
        enlargedId: currentEnlargedId,
        moments,
        onMomentRecycle: handleMomentRecycle,
        onAdaptiveThrottle: handleAdaptiveThrottle,
        speedMultiplier: settings.speedMultiplier,
        applyTextFade: settings.showHeader,
        textZoneHeight: isMobile ? 200 : 260,
        allowDrag: settings.allowDrag ?? true,
        dragEffects: settings.dragEffects ?? true,
        onDragStartCallback: dismissHint,
    });

    // Layout builder based on screen area density & repeat rules
    const buildLayout = useCallback((w, h) => {
        const mobile = w <= 768;
        const tablet = w > 768 && w <= 1024;
        setIsMobile(mobile);

        // 1. Compute density target from area formula
        let targetCount = computeAreaCardCount(w, h);

        // Apply admin max card cap
        const maxCap = mobile
            ? (settings.maxMobileCards || 20)
            : (settings.maxDesktopCards || 60);
        targetCount = Math.min(targetCount, maxCap);

        // Apply adaptive throttle reduction if active
        if (throttleReduction > 0) {
            targetCount = Math.max(8, targetCount - throttleReduction);
        }

        // 2. Single photo rule: cap repeats to at most 8 cards
        const totalMoments = moments.length;
        if (totalMoments === 1) {
            targetCount = Math.min(targetCount, 8);
        } else if (totalMoments > 1 && settings.repeatPhotos === false) {
            targetCount = Math.min(targetCount, totalMoments);
        }

        const scaleMult = settings.cardScale === 'small' ? 0.75 : settings.cardScale === 'large' ? 1.25 : 1.0;
        const gridPositions = generateJitteredGrid(targetCount, w, h, mobile, tablet, scaleMult);
        const photoAssignments = assignPhotosDispersed(gridPositions, totalMoments || 1);

        const now = performance.now();
        const initialCards = [];
        const initialStates = [];

        for (let i = 0; i < targetCount; i++) {
            const { x, y, size, layer } = gridPositions[i];
            // Back layer visibility: far 0.85, mid 0.94, near 1.0
            const baseOpacity = layer === 0 ? 0.85 : layer === 1 ? 0.94 : 1.0;

            const angle = Math.random() * Math.PI * 2;
            const speedMagnitude = 40 * (settings.speedMultiplier || 2) * (layer === 0 ? 0.7 : layer === 1 ? 1.0 : 1.35);
            const vx = Math.cos(angle) * speedMagnitude;
            const vy = Math.sin(angle) * speedMagnitude;

            const baseTilt = (Math.random() * 16) - 8;
            const vrot = (Math.random() * 4) - 2;
            const momentIdx = photoAssignments[i];

            // Fast initial stagger bloom over ~450ms
            const spawnTime = now + (i / targetCount) * 450;

            initialCards.push({
                id: `card-${i}`,
                momentIndex: momentIdx,
                size,
                layer,
                baseOpacity,
            });

            initialStates.push({
                id: `card-${i}`,
                x,
                y,
                vx,
                vy,
                size,
                layer,
                baseOpacity,
                rot: baseTilt,
                baseTilt,
                vrot,
                lensScale: 1.0,
                lensRot: 0,
                spawnTime,
            });
        }

        cardsStateRef.current = initialStates;
        setCardsData(initialCards);
    }, [
        moments.length,
        settings.maxDesktopCards,
        settings.maxMobileCards,
        settings.cardScale,
        settings.speedMultiplier,
        settings.repeatPhotos,
        throttleReduction,
    ]);

    // Initialize & handle smooth resize
    useEffect(() => {
        const container = containerRef.current;
        const rect = container ? container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        const w = rect.width || window.innerWidth || 1200;
        const h = rect.height || window.innerHeight || 800;

        buildLayout(w, h);

        let resizeTimer = null;
        let lastW = w;
        let lastH = h;

        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newRect = containerRef.current?.getBoundingClientRect();
                const curW = newRect?.width || window.innerWidth;
                const curH = newRect?.height || window.innerHeight;

                // Scale existing card positions smoothly during window change
                if (cardsStateRef.current.length > 0 && lastW > 0 && lastH > 0) {
                    const scaleX = curW / lastW;
                    const scaleY = curH / lastH;
                    cardsStateRef.current.forEach((c) => {
                        c.x = Math.max(10, Math.min(curW - c.size - 10, c.x * scaleX));
                        c.y = Math.max(10, Math.min(curH - c.size - 10, c.y * scaleY));
                    });
                }
                lastW = curW;
                lastH = curH;
                buildLayout(curW, curH);
            }, 180);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            clearTimeout(resizeTimer);
        };
    }, [buildLayout]);

    // User interaction tracker
    const registerInteraction = useCallback(() => {
        hasInteractedRef.current = true;
        if (spotlightTimerRef.current) {
            clearTimeout(spotlightTimerRef.current);
            spotlightTimerRef.current = null;
        }
    }, []);

    // Auto-spotlight
    useEffect(() => {
        if (!settings.autoSpotlight || hasInteractedRef.current || cardsData.length === 0) return;

        const delayMs = (settings.spotlightDelay || 6) * 1000;
        spotlightTimerRef.current = setTimeout(() => {
            if (!hasInteractedRef.current && cardsData.length > 0) {
                const randomIdx = Math.floor(Math.random() * cardsData.length);
                if (cardElsRef.current[randomIdx]) {
                    sourceRectRef.current = cardElsRef.current[randomIdx].getBoundingClientRect();
                }
                setEnlargedIndex(randomIdx);
                setTimeout(() => {
                    setEnlargedIndex((prev) => (prev === randomIdx ? null : prev));
                }, 2500);
            }
        }, delayMs);

        return () => {
            if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
        };
    }, [cardsData, settings.autoSpotlight, settings.spotlightDelay]);

    // Pointer move (lens effect)
    const handlePointerMove = (e) => {
        registerInteraction();
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) setPointer(e.clientX - rect.left, e.clientY - rect.top, true);
    };

    const handlePointerLeave = () => {
        setPointer(-9999, -9999, false);
    };

    // Container click → ripple
    const handleContainerClick = (e) => {
        registerInteraction();
        if (enlargedIndex !== null) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) triggerRipple(e.clientX - rect.left, e.clientY - rect.top);
    };

    // Open from card's screen position
    const openEnlarged = (index) => {
        registerInteraction();
        if (cardElsRef.current[index]) {
            sourceRectRef.current = cardElsRef.current[index].getBoundingClientRect();
        }
        setEnlargedIndex(index);
    };

    // Track pointer down for distinguishing click vs drag
    const pointerDownRef = useRef({ time: 0, x: 0, y: 0, index: -1, pointerId: null });

    const handleCardPointerDown = (e, index) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        registerInteraction();
        dismissHint();
        pointerDownRef.current = {
            time: performance.now(),
            x: e.clientX,
            y: e.clientY,
            index,
            pointerId: e.pointerId,
        };
        if (settings.allowDrag ?? true) {
            e.currentTarget.setPointerCapture(e.pointerId);
            startDrag(index, e.pointerId, e.clientX, e.clientY);
        }
    };

    const handleCardPointerMove = (e, index) => {
        if ((settings.allowDrag ?? true) && pointerDownRef.current.pointerId === e.pointerId) {
            updateDrag(e.pointerId, e.clientX, e.clientY);
        }
    };

    const handleCardPointerUp = (e, index) => {
        const pd = pointerDownRef.current;
        if (pd.pointerId === e.pointerId) {
            try {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }
            } catch {}

            const duration = performance.now() - pd.time;
            const dist = Math.hypot(e.clientX - pd.x, e.clientY - pd.y);

            let wasDragging = false;
            if (settings.allowDrag ?? true) {
                const res = endDrag(e.pointerId);
                wasDragging = res.wasDragging;
            }

            // Click or tap condition: moved less than 6px AND released within 300ms
            if (!wasDragging && dist < 6 && duration <= 300) {
                openEnlarged(index);
            }

            pointerDownRef.current = { time: 0, x: 0, y: 0, index: -1, pointerId: null };
        }
    };

    const handleCardPointerCancel = (e) => {
        try {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
        } catch {}
        if (settings.allowDrag ?? true) {
            cancelDrag();
        }
        pointerDownRef.current = { time: 0, x: 0, y: 0, index: -1, pointerId: null };
    };

    const handleCardClick = (e, index) => {
        e.stopPropagation();
        if (settings.allowDrag === false) {
            openEnlarged(index);
        }
    };

    const handleClose = useCallback(() => {
        setEnlargedIndex(null);
        sourceRectRef.current = null;
        cancelDrag();
    }, [cancelDrag]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (enlargedIndex === null) return;
            registerInteraction();
            if (e.key === 'Escape') { handleClose(); cancelDrag(); }
            else if (e.key === 'ArrowRight') setEnlargedIndex((prev) => (prev + 1) % cardsData.length);
            else if (e.key === 'ArrowLeft') setEnlargedIndex((prev) => (prev - 1 + cardsData.length) % cardsData.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enlargedIndex, cardsData.length, registerInteraction, handleClose]);

    // Touch swipe on enlarged card
    const handleTouchStart = (e) => {
        touchStartXRef.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
        if (touchStartXRef.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartXRef.current;
        if (Math.abs(diff) > 45) {
            registerInteraction();
            if (diff < 0) setEnlargedIndex((prev) => (prev + 1) % cardsData.length);
            else setEnlargedIndex((prev) => (prev - 1 + cardsData.length) % cardsData.length);
        }
        touchStartXRef.current = null;
    };

    const activeMoment = currentEnlargedCard && moments[currentEnlargedCard.momentIndex]
        ? moments[currentEnlargedCard.momentIndex]
        : null;

    const sourceStyle = sourceRectRef.current ? {
        '--src-x': `${sourceRectRef.current.left + sourceRectRef.current.width / 2}px`,
        '--src-y': `${sourceRectRef.current.top + sourceRectRef.current.height / 2}px`,
        '--src-w': `${sourceRectRef.current.width}px`,
        '--src-h': `${sourceRectRef.current.height}px`,
    } : {};

    // Header strings if enabled
    const headerStrings = settings.headerText?.[language] || settings.headerText?.en || {
        eyebrow: 'NSS MJCET · NOT ME BUT YOU',
        headingPlain: 'The Spirit of Our ',
        headingItalic: 'Volunteers',
        subtext: 'Real moments from the people who show up, work hard and enjoy every step of the journey.',
    };

    // Portal overlay for enlarged photo
    const overlay = activeMoment && portalMounted ? createPortal(
        <div
            className={styles.enlargedBackdrop}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged volunteer moment"
        >
            {/* Close button at top-right of viewport */}
            <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close enlarged view"
                title="Close (Esc)"
            >
                ✕
            </button>

            {/* Prev / Next buttons at far edges of viewport */}
            <button
                className={`${styles.navButton} ${styles.navPrev}`}
                onClick={(e) => {
                    e.stopPropagation();
                    registerInteraction();
                    setEnlargedIndex((prev) => (prev - 1 + cardsData.length) % cardsData.length);
                }}
                aria-label="Previous moment"
                title="Previous (Left arrow)"
            >
                ‹
            </button>

            <button
                className={`${styles.navButton} ${styles.navNext}`}
                onClick={(e) => {
                    e.stopPropagation();
                    registerInteraction();
                    setEnlargedIndex((prev) => (prev + 1) % cardsData.length);
                }}
                aria-label="Next moment"
                title="Next (Right arrow)"
            >
                ›
            </button>

            {/* Enlarged Card with natural aspect ratio */}
            <div
                className={styles.enlargedCardOuter}
                style={sourceStyle}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className={styles.enlargedCard}>
                    <div className={styles.enlargedImgWrap}>
                        <Image
                            src={activeMoment.src}
                            alt={formatAltText(activeMoment.date)}
                            fill
                            sizes="(max-width: 640px) 90vw, 65vh"
                            priority
                            className={styles.enlargedImg}
                        />
                    </div>

                    <div className={styles.dateStampWrap}>
                        <div className={styles.datePill}>
                            <span className={styles.stampDot} />
                            <span>{formatMomentDate(activeMoment.date, settings.dateFormat)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    // Drag hint copy with multilingual support
    const hintText = (() => {
        if (language === 'hi') {
            return isTouchDevice ? 'फ़ोटो को छूकर खींचें' : 'फ़ोटो को खींचकर देखें';
        }
        if (language === 'te') {
            return isTouchDevice ? 'ఫోటోను తాకి లాగండి' : 'ఫోటోను లాగండి';
        }
        return isTouchDevice ? 'Touch and drag a photo' : 'Drag a photo';
    })();

    return (
        <div className={styles.fullScreenWrapper}>
            {/* Floating Menu Button & NSS Logo */}
            <GalleryMenu
                showLogo={settings.showLogo}
                showMenuButton={settings.showMenuButton}
                isEnlarged={enlargedIndex !== null}
            />

            {/* Optional Header Text (controlled via admin settings) */}
            {settings.showHeader && (
                <div className={styles.heroOverlay}>
                    <div className="container">
                        <motion.div
                            className={styles.eyebrowWrap}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className={styles.eyebrowLine} />
                            <span className={styles.eyebrowText}>{headerStrings.eyebrow}</span>
                        </motion.div>
                        <motion.h1
                            className={styles.heroTitle}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            {headerStrings.headingPlain}
                            <em>{headerStrings.headingItalic}</em>
                        </motion.h1>
                        <motion.p
                            className={styles.heroSubtitle}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {headerStrings.subtext}
                        </motion.p>
                    </div>
                </div>
            )}

            {/* Drifting Field */}
            <section
                ref={containerRef}
                className={styles.fieldContainer}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onClick={handleContainerClick}
                aria-label="Interactive drifting gallery of volunteer moments"
            >
                {/* Edge fade gradients at top & bottom of the full screen */}
                <div className={styles.topEdgeGradient} />
                <div className={styles.bottomEdgeGradient} />

                {/* Drifting Cards Field */}
                <div className={styles.driftingField}>
                    {cardsData.map((card, idx) => {
                        const moment = moments[card.momentIndex] || moments[0] || {};
                        const isCurrent = card.id === currentEnlargedId;
                        const thumbUrl = moment.thumbnail || moment.src || '/gallery-placeholders/moment-1.svg';

                        return (
                            <div
                                key={card.id}
                                ref={(el) => { cardElsRef.current[idx] = el; }}
                                className={styles.driftCard}
                                style={{
                                    width: card.size,
                                    height: card.size,
                                    zIndex: card.layer + 1,
                                    opacity: isCurrent ? 0 : undefined,
                                    pointerEvents: isCurrent ? 'none' : undefined,
                                }}
                                onPointerDown={(e) => handleCardPointerDown(e, idx)}
                                onPointerMove={(e) => handleCardPointerMove(e, idx)}
                                onPointerUp={(e) => handleCardPointerUp(e, idx)}
                                onPointerCancel={handleCardPointerCancel}
                                onClick={(e) => handleCardClick(e, idx)}
                                onDragStart={(e) => e.preventDefault()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        openEnlarged(idx);
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={formatAltText(moment.date)}
                            >
                                <div className={styles.cardInner}>
                                    <Image
                                        src={thumbUrl}
                                        alt={formatAltText(moment.date)}
                                        fill
                                        sizes={`${card.size}px`}
                                        className={styles.cardImg}
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Drag Hint Pill */}
            {(settings.allowDrag ?? true) && (settings.showDragHint ?? true) && (
                <aside
                    className={`${styles.dragHintPill} ${hintVisible ? styles.dragHintVisible : styles.dragHintHidden}`}
                    aria-live="polite"
                    onClick={dismissHint}
                >
                    <svg
                        className={styles.dragHintIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                    <span>{hintText}</span>
                </aside>
            )}

            {/* Enlarged Portal Overlay */}
            {overlay}
        </div>
    );
}
