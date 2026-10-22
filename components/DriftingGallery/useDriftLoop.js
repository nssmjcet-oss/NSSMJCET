'use client';

import { useEffect, useRef } from 'react';

export const BASE_SPEED = 40; // px per second

/**
 * Custom 60fps drift loop hook managing physics, edge wrap, tuned soft repulsion
 * for larger cards (90px - 170px), lens hover effect, and corner avoidance.
 */
export function useDriftLoop({
    containerRef,
    cardElsRef,
    cardsStateRef,
    enlargedId,
    moments,
    onMomentRecycle,
    onAdaptiveThrottle,
    speedMultiplier = 2,
    applyTextFade = false,
    textZoneHeight = 260,
}) {
    const isPausedRef = useRef(false);
    const lastTimeRef = useRef(0);
    const pointerRef = useRef({ x: -9999, y: -9999, active: false });
    const ripplesRef = useRef([]);
    const enlargedIdRef = useRef(enlargedId);
    enlargedIdRef.current = enlargedId;

    const speedMultiplierRef = useRef(speedMultiplier);
    speedMultiplierRef.current = speedMultiplier;

    const applyTextFadeRef = useRef(applyTextFade);
    applyTextFadeRef.current = applyTextFade;

    const onAdaptiveThrottleRef = useRef(onAdaptiveThrottle);
    onAdaptiveThrottleRef.current = onAdaptiveThrottle;

    const fpsFrameCountRef = useRef(0);
    const fpsLastCheckRef = useRef(0);
    const lowFpsCountRef = useRef(0);

    // Track ripple triggers
    const triggerRipple = (x, y) => {
        ripplesRef.current.push({
            x,
            y,
            startTime: performance.now(),
            duration: 600,
        });
    };

    // Track pointer
    const setPointer = (x, y, active) => {
        pointerRef.current = { x, y, active };
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Check reduced motion preference
        const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Visibility Change listener
        const handleVisibilityChange = () => {
            isPausedRef.current = document.hidden;
            if (!document.hidden) {
                lastTimeRef.current = performance.now();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // IntersectionObserver to pause when offscreen
        const observer = new IntersectionObserver(
            ([entry]) => {
                isPausedRef.current = !entry.isIntersecting;
                if (entry.isIntersecting) {
                    lastTimeRef.current = performance.now();
                }
            },
            { threshold: 0.05 }
        );
        observer.observe(container);

        let animationFrameId;

        const loop = (currentTime) => {
            animationFrameId = requestAnimationFrame(loop);

            if (isPausedRef.current) {
                lastTimeRef.current = currentTime;
                return;
            }

            if (!lastTimeRef.current) {
                lastTimeRef.current = currentTime;
                return;
            }

            // Delta time clamped to avoid jumps after tab blur
            let dt = (currentTime - lastTimeRef.current) / 1000;
            if (dt > 0.1) dt = 0.1;
            lastTimeRef.current = currentTime;

            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            if (width === 0 || height === 0) return;

            const cards = cardsStateRef.current;
            const currentEnlarged = enlargedIdRef.current;
            const pointer = pointerRef.current;
            const now = currentTime;
            const currentMultiplier = speedMultiplierRef.current || 2;
            const shouldFadeText = applyTextFadeRef.current;

            // Clean expired ripples
            ripplesRef.current = ripplesRef.current.filter(
                (rip) => now - rip.startTime <= rip.duration
            );

            // FPS monitor for adaptive performance under CPU throttling
            fpsFrameCountRef.current++;
            if (!fpsLastCheckRef.current) fpsLastCheckRef.current = currentTime;
            if (currentTime - fpsLastCheckRef.current >= 1000) {
                const fps = (fpsFrameCountRef.current * 1000) / (currentTime - fpsLastCheckRef.current);
                fpsFrameCountRef.current = 0;
                fpsLastCheckRef.current = currentTime;
                if (fps < 48) {
                    lowFpsCountRef.current++;
                    if (lowFpsCountRef.current >= 2) {
                        lowFpsCountRef.current = 0;
                        if (onAdaptiveThrottleRef.current) {
                            onAdaptiveThrottleRef.current();
                        }
                    }
                } else {
                    lowFpsCountRef.current = 0;
                }
            }

            // Pairwise soft separation / repulsion tuned for larger card sizes
            const count = cards.length;
            for (let i = 0; i < count; i++) {
                const ci = cards[i];
                if (ci.id === currentEnlarged) continue;

                for (let j = i + 1; j < count; j++) {
                    const cj = cards[j];
                    if (cj.id === currentEnlarged) continue;

                    const dx = cj.x - ci.x;
                    const dy = cj.y - ci.y;
                    const distSq = dx * dx + dy * dy;
                    // Min separation distance based on combined radii
                    const minDist = ci.size * 0.65 + cj.size * 0.65;

                    if (distSq < minDist * minDist && distSq > 0.01) {
                        const dist = Math.sqrt(distSq);
                        const overlap = (minDist - dist) / minDist;
                        // Push force tuned to 135 for crisp, bounce-free separation
                        const push = overlap * 135 * dt;
                        const nx = dx / dist;
                        const ny = dy / dist;

                        ci.vx -= nx * push;
                        ci.vy -= ny * push;
                        cj.vx += nx * push;
                        cj.vy += ny * push;
                    }
                }
            }

            // Card updates
            for (let i = 0; i < count; i++) {
                const card = cards[i];
                const el = cardElsRef.current[i];
                if (!el) continue;

                if (card.id === currentEnlarged) {
                    continue;
                }

                const enlargedSlowdown = currentEnlarged ? 0.3 : 1.0;
                const motionScale = prefersReducedMotion ? 0.15 : 1.0;
                const layerFactor =
                    card.layer === 0 ? 0.7 : card.layer === 1 ? 1.0 : 1.35;
                const targetSpeed =
                    BASE_SPEED * currentMultiplier * layerFactor * motionScale * enlargedSlowdown;

                // Normalize velocity smoothly towards target speed
                const currentSpeed = Math.hypot(card.vx, card.vy);
                if (currentSpeed > 0.001) {
                    const nextSpeed = currentSpeed + (targetSpeed - currentSpeed) * 0.1;
                    card.vx = (card.vx / currentSpeed) * nextSpeed;
                    card.vy = (card.vy / currentSpeed) * nextSpeed;
                }

                // Corner clearance: soft deflection so cards never awkwardly cover top logo or menu button
                const cx = card.x + card.size / 2;
                const cy = card.y + card.size / 2;

                // Top-Left Logo Zone (x < 260, y < 110)
                if (cx < 260 && cy < 110) {
                    card.vy += 35 * dt;
                    card.vx += 25 * dt;
                }
                // Top-Right Menu Zone (x > width - 140, y < 110)
                if (cx > width - 140 && cy < 110) {
                    card.vy += 35 * dt;
                    card.vx -= 25 * dt;
                }

                // Ripple impulse from empty space clicks
                for (const rip of ripplesRef.current) {
                    const elapsed = now - rip.startTime;
                    const progress = elapsed / rip.duration;
                    const waveRadius = progress * 340;
                    const waveWidth = 90;

                    const rdx = cx - rip.x;
                    const rdy = cy - rip.y;
                    const rDist = Math.hypot(rdx, rdy);
                    const diff = Math.abs(rDist - waveRadius);

                    if (diff < waveWidth && rDist > 1) {
                        const force = (1 - diff / waveWidth) * (1 - progress) * 125 * dt;
                        card.vx += (rdx / rDist) * force;
                        card.vy += (rdy / rDist) * force;
                    }
                }

                // Advance position
                card.x += card.vx * dt;
                card.y += card.vy * dt;

                // Gentle sway: clamp to baseTilt ± 12°
                if (!prefersReducedMotion) {
                    card.rot += card.vrot * dt;
                    const minRot = card.baseTilt - 12;
                    const maxRot = card.baseTilt + 12;
                    if (card.rot < minRot) {
                        card.rot = minRot;
                        card.vrot = Math.abs(card.vrot);
                    } else if (card.rot > maxRot) {
                        card.rot = maxRot;
                        card.vrot = -Math.abs(card.vrot);
                    }
                }

                // Wrap-around across full screen with smart re-entry at farthest clearance
                const margin = card.size * 1.25;
                let wrapped = false;
                let reEntryX = card.x;
                let reEntryY = card.y;

                if (card.x < -margin) {
                    // Exited left edge -> re-enter on right edge
                    reEntryX = width + margin * 0.35;
                    // Find candidate Y on right edge with maximum clearance from existing cards
                    let bestY = card.y;
                    let maxClearance = -1;
                    const candidatesCount = 10;
                    for (let s = 0; s < candidatesCount; s++) {
                        const testY = 16 + s * ((height - card.size - 32) / (candidatesCount - 1));
                        let minDistSq = Infinity;
                        for (let j = 0; j < count; j++) {
                            if (j === i) continue;
                            const other = cards[j];
                            const dy = other.y - testY;
                            const dx = other.x - reEntryX;
                            const d = dx * dx + dy * dy;
                            if (d < minDistSq) minDistSq = d;
                        }
                        if (minDistSq > maxClearance) {
                            maxClearance = minDistSq;
                            bestY = testY;
                        }
                    }
                    reEntryY = bestY;
                    card.x = reEntryX;
                    card.y = reEntryY;
                    card.vx = -Math.abs(card.vx); // Float inward towards left
                    wrapped = true;
                } else if (card.x > width + margin) {
                    // Exited right edge -> re-enter on left edge
                    reEntryX = -margin * 0.35;
                    let bestY = card.y;
                    let maxClearance = -1;
                    const candidatesCount = 10;
                    for (let s = 0; s < candidatesCount; s++) {
                        const testY = 16 + s * ((height - card.size - 32) / (candidatesCount - 1));
                        let minDistSq = Infinity;
                        for (let j = 0; j < count; j++) {
                            if (j === i) continue;
                            const other = cards[j];
                            const dy = other.y - testY;
                            const dx = other.x - reEntryX;
                            const d = dx * dx + dy * dy;
                            if (d < minDistSq) minDistSq = d;
                        }
                        if (minDistSq > maxClearance) {
                            maxClearance = minDistSq;
                            bestY = testY;
                        }
                    }
                    reEntryY = bestY;
                    card.x = reEntryX;
                    card.y = reEntryY;
                    card.vx = Math.abs(card.vx); // Float inward towards right
                    wrapped = true;
                }

                if (card.y < -margin) {
                    // Exited top edge -> re-enter on bottom edge
                    reEntryY = height + margin * 0.35;
                    let bestX = card.x;
                    let maxClearance = -1;
                    const candidatesCount = 10;
                    for (let s = 0; s < candidatesCount; s++) {
                        const testX = 16 + s * ((width - card.size - 32) / (candidatesCount - 1));
                        let minDistSq = Infinity;
                        for (let j = 0; j < count; j++) {
                            if (j === i) continue;
                            const other = cards[j];
                            const dx = other.x - testX;
                            const dy = other.y - reEntryY;
                            const d = dx * dx + dy * dy;
                            if (d < minDistSq) minDistSq = d;
                        }
                        if (minDistSq > maxClearance) {
                            maxClearance = minDistSq;
                            bestX = testX;
                        }
                    }
                    reEntryX = bestX;
                    card.x = reEntryX;
                    card.y = reEntryY;
                    card.vy = -Math.abs(card.vy); // Float inward towards top
                    wrapped = true;
                } else if (card.y > height + margin) {
                    // Exited bottom edge -> re-enter on top edge
                    reEntryY = -margin * 0.35;
                    let bestX = card.x;
                    let maxClearance = -1;
                    const candidatesCount = 10;
                    for (let s = 0; s < candidatesCount; s++) {
                        const testX = 16 + s * ((width - card.size - 32) / (candidatesCount - 1));
                        let minDistSq = Infinity;
                        for (let j = 0; j < count; j++) {
                            if (j === i) continue;
                            const other = cards[j];
                            const dx = other.x - testX;
                            const dy = other.y - reEntryY;
                            const d = dx * dx + dy * dy;
                            if (d < minDistSq) minDistSq = d;
                        }
                        if (minDistSq > maxClearance) {
                            maxClearance = minDistSq;
                            bestX = testX;
                        }
                    }
                    reEntryX = bestX;
                    card.x = reEntryX;
                    card.y = reEntryY;
                    card.vy = Math.abs(card.vy); // Float inward towards bottom
                    wrapped = true;
                }

                if (wrapped && onMomentRecycle) {
                    onMomentRecycle(i, card.x, card.y);
                }

                // Lens effect: cursor approaching within ~180px
                let targetLensScale = 1.0;
                let targetLensRot = 0;

                if (pointer.active && !prefersReducedMotion) {
                    const pdx = cx - pointer.x;
                    const pdy = cy - pointer.y;
                    const pDist = Math.hypot(pdx, pdy);

                    if (pDist < 180) {
                        const factor = 1 - pDist / 180;
                        targetLensScale = 1 + 0.25 * factor;
                        targetLensRot = (pdx > 0 ? 1 : -1) * factor * 5;
                    }
                }

                card.lensScale += (targetLensScale - card.lensScale) * 0.14;
                card.lensRot += (targetLensRot - card.lensRot) * 0.14;

                // Edge fade over top ~24px, bottom ~24px, and sides ~24px
                const topFadeRange = 24;
                const bottomFadeRange = 24;
                const sideFadeRange = 24;

                const distToTop = card.y + card.size;
                const distToBottom = height - card.y;
                const distToLeft = card.x + card.size;
                const distToRight = width - card.x;

                let edgeFade = 1.0;
                if (distToTop < topFadeRange) {
                    edgeFade = Math.min(edgeFade, Math.max(0, distToTop / topFadeRange));
                }
                if (distToBottom < bottomFadeRange) {
                    edgeFade = Math.min(edgeFade, Math.max(0, distToBottom / bottomFadeRange));
                }
                if (distToLeft < sideFadeRange) {
                    edgeFade = Math.min(edgeFade, Math.max(0, distToLeft / sideFadeRange));
                }
                if (distToRight < sideFadeRange) {
                    edgeFade = Math.min(edgeFade, Math.max(0, distToRight / sideFadeRange));
                }

                // Text zone fade: only active if hero text is explicitly enabled
                let textFactor = 1.0;
                if (shouldFadeText) {
                    const cardCenterY = card.y + card.size / 2;
                    if (cardCenterY < textZoneHeight - 60) {
                        textFactor = 0.35;
                    } else if (cardCenterY < textZoneHeight) {
                        textFactor = 0.35 + ((cardCenterY - (textZoneHeight - 60)) / 60) * 0.65;
                    }
                }

                // First paint fast stagger bloom (~600ms total)
                let bloomFactor = 1.0;
                if (card.spawnTime) {
                    if (now < card.spawnTime) {
                        bloomFactor = 0;
                    } else if (now < card.spawnTime + 180) {
                        bloomFactor = (now - card.spawnTime) / 180;
                    }
                }

                const rawOpacity = currentEnlarged
                    ? card.baseOpacity * 0.4
                    : card.baseOpacity;
                const renderOpacity = rawOpacity * edgeFade * textFactor * bloomFactor;

                const renderRot = card.rot + card.lensRot;
                el.style.transform = `translate3d(${card.x.toFixed(1)}px, ${card.y.toFixed(1)}px, 0) rotate(${renderRot.toFixed(2)}deg) scale(${card.lensScale.toFixed(3)})`;
                el.style.opacity = Math.max(0, Math.min(1, renderOpacity)).toFixed(3);

                if (currentEnlarged) {
                    el.style.filter = 'blur(2px)';
                } else {
                    el.style.filter = 'none';
                }
            }
        };

        lastTimeRef.current = performance.now();
        animationFrameId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            observer.disconnect();
        };
    }, [containerRef, cardElsRef, cardsStateRef, onMomentRecycle, textZoneHeight]);

    return {
        setPointer,
        triggerRipple,
    };
}
