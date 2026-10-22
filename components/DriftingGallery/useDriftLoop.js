'use client';

import { useEffect, useRef } from 'react';

export const BASE_SPEED = 40; // px per second

/**
 * Custom 60fps drift loop hook managing physics, edge wrap, tuned soft repulsion
 * for larger cards (90px - 170px), lens hover effect, corner avoidance, and
 * interactive dragging with multi-card elastic collisions and impulse decay.
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
    allowDrag = true,
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

    const allowDragRef = useRef(allowDrag);
    allowDragRef.current = allowDrag;

    const fpsFrameCountRef = useRef(0);
    const fpsLastCheckRef = useRef(0);
    const lowFpsCountRef = useRef(0);

    // Cached container dimensions to avoid getBoundingClientRect in rAF loop
    const containerSizeRef = useRef({ width: 0, height: 0 });

    // Active Drag State
    const dragStateRef = useRef({
        active: false,
        cardIndex: -1,
        pointerId: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        grabOffsetX: 0,
        grabOffsetY: 0,
        isDragging: false,
        velocityHistory: [], // [{ x, y, t }]
    });

    // Track ripple triggers
    const triggerRipple = (x, y) => {
        ripplesRef.current.push({
            x,
            y,
            startTime: performance.now(),
            duration: 600,
        });
    };

    // Track pointer for ambient lens effect (when not dragging)
    const setPointer = (x, y, active) => {
        pointerRef.current = { x, y, active };
    };

    // Drag API exposed to component
    const startDrag = (index, pointerId, clientX, clientY) => {
        if (!allowDragRef.current || enlargedIdRef.current) return;
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        containerSizeRef.current = { width: rect.width, height: rect.height };

        const card = cardsStateRef.current[index];
        if (!card) return;

        const relX = clientX - rect.left;
        const relY = clientY - rect.top;

        dragStateRef.current = {
            active: true,
            cardIndex: index,
            pointerId,
            startX: relX,
            startY: relY,
            currentX: relX,
            currentY: relY,
            grabOffsetX: relX - card.x,
            grabOffsetY: relY - card.y,
            isDragging: false,
            velocityHistory: [{ x: relX, y: relY, t: performance.now() }],
        };
    };

    const updateDrag = (pointerId, clientX, clientY) => {
        const ds = dragStateRef.current;
        if (!ds.active || ds.pointerId !== pointerId) return;

        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const relX = clientX - rect.left;
        const relY = clientY - rect.top;

        ds.currentX = relX;
        ds.currentY = relY;

        // Check threshold for starting drag (~6px)
        if (!ds.isDragging) {
            const dx = relX - ds.startX;
            const dy = relY - ds.startY;
            if (dx * dx + dy * dy >= 36) {
                ds.isDragging = true;
                const el = cardElsRef.current[ds.cardIndex];
                if (el) {
                    el.classList.add('isDragging');
                    el.style.willChange = 'transform';
                }
            }
        }

        if (ds.isDragging) {
            const now = performance.now();
            ds.velocityHistory.push({ x: relX, y: relY, t: now });
            // Keep only last ~100ms
            while (ds.velocityHistory.length > 2 && now - ds.velocityHistory[0].t > 120) {
                ds.velocityHistory.shift();
            }
        }
    };

    const endDrag = (pointerId) => {
        const ds = dragStateRef.current;
        if (!ds.active || (pointerId !== null && ds.pointerId !== pointerId)) {
            return { wasDragging: false };
        }

        const wasDragging = ds.isDragging;
        const cardIndex = ds.cardIndex;
        const card = cardsStateRef.current[cardIndex];
        const el = cardElsRef.current[cardIndex];

        if (el) {
            el.classList.remove('isDragging');
            el.style.willChange = '';
        }

        if (wasDragging && card) {
            // Compute throw velocity from last ~100ms
            const hist = ds.velocityHistory;
            let vx = 0;
            let vy = 0;
            if (hist.length >= 2) {
                const oldest = hist[0];
                const newest = hist[hist.length - 1];
                const dt = (newest.t - oldest.t) / 1000;
                if (dt > 0.015 && dt < 0.25) {
                    vx = (newest.x - oldest.x) / dt;
                    vy = (newest.y - oldest.y) / dt;
                }
            }

            // Cap throw velocity to safe maximum (e.g. 520 px/s)
            const speed = Math.hypot(vx, vy);
            const maxThrow = 520;
            if (speed > maxThrow) {
                vx = (vx / speed) * maxThrow;
                vy = (vy / speed) * maxThrow;
            }

            if (speed > 40) {
                card.vx = vx;
                card.vy = vy;
                card.bounceVx = vx;
                card.bounceVy = vy;
                card.bounceDecay = 1.0; // Decay over ~1 second
            }
        }

        // Reset drag state
        dragStateRef.current = {
            active: false,
            cardIndex: -1,
            pointerId: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            grabOffsetX: 0,
            grabOffsetY: 0,
            isDragging: false,
            velocityHistory: [],
        };

        return { wasDragging };
    };

    const cancelDrag = () => {
        endDrag(null);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Measure initial container size
        const initialRect = container.getBoundingClientRect();
        containerSizeRef.current = { width: initialRect.width, height: initialRect.height };

        const handleResize = () => {
            if (container) {
                const r = container.getBoundingClientRect();
                containerSizeRef.current = { width: r.width, height: r.height };
            }
        };
        window.addEventListener('resize', handleResize);

        // Check reduced motion preference
        const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Visibility Change listener
        const handleVisibilityChange = () => {
            isPausedRef.current = document.hidden;
            if (document.hidden) {
                cancelDrag();
            } else {
                lastTimeRef.current = performance.now();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const handleBlur = () => {
            cancelDrag();
        };
        window.addEventListener('blur', handleBlur);

        // IntersectionObserver to pause when offscreen
        const observer = new IntersectionObserver(
            ([entry]) => {
                isPausedRef.current = !entry.isIntersecting;
                if (entry.isIntersecting) {
                    lastTimeRef.current = performance.now();
                } else {
                    cancelDrag();
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

            // Delta time clamped to avoid jumps
            let dt = (currentTime - lastTimeRef.current) / 1000;
            if (dt > 0.1) dt = 0.1;
            lastTimeRef.current = currentTime;

            const width = containerSizeRef.current.width || container.clientWidth || window.innerWidth;
            const height = containerSizeRef.current.height || container.clientHeight || window.innerHeight;
            if (width === 0 || height === 0) return;

            const cards = cardsStateRef.current;
            const currentEnlarged = enlargedIdRef.current;
            const pointer = pointerRef.current;
            const now = currentTime;
            const currentMultiplier = speedMultiplierRef.current || 2;
            const shouldFadeText = applyTextFadeRef.current;
            const ds = dragStateRef.current;
            const draggedIdx = ds.isDragging ? ds.cardIndex : -1;

            // Clean expired ripples
            ripplesRef.current = ripplesRef.current.filter(
                (rip) => now - rip.startTime <= rip.duration
            );

            // FPS monitor for adaptive performance
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

            const count = cards.length;

            // --- 1. UPDATE DRAGGED CARD POSITION DIRECTLY ---
            let draggedCard = null;
            let dragVx = 0;
            let dragVy = 0;

            if (draggedIdx >= 0 && draggedIdx < count) {
                draggedCard = cards[draggedIdx];
                const rawX = ds.currentX - ds.grabOffsetX;
                const rawY = ds.currentY - ds.grabOffsetY;

                // Keep inside screen boundaries (cannot be dragged fully out of viewport)
                const margin = 8;
                const minX = margin;
                const maxX = width - draggedCard.size - margin;
                const minY = margin;
                const maxY = height - draggedCard.size - margin;

                const clampedX = Math.max(minX, Math.min(maxX, rawX));
                const clampedY = Math.max(minY, Math.min(maxY, rawY));

                if (dt > 0.001) {
                    dragVx = (clampedX - draggedCard.x) / dt;
                    dragVy = (clampedY - draggedCard.y) / dt;
                }

                draggedCard.x = clampedX;
                draggedCard.y = clampedY;
                draggedCard.vx = dragVx;
                draggedCard.vy = dragVy;
            }

            // --- 2. COLLISIONS: DRAGGED CARD PUSHES OTHERS (HEAVY OBJECT) ---
            if (draggedCard) {
                const dRadius = (draggedCard.size * 0.5) * 0.9;
                const dCenterX = draggedCard.x + draggedCard.size * 0.5;
                const dCenterY = draggedCard.y + draggedCard.size * 0.5;
                const dragSpeed = Math.hypot(dragVx, dragVy);

                for (let j = 0; j < count; j++) {
                    if (j === draggedIdx) continue;
                    const cj = cards[j];
                    if (cj.id === currentEnlarged) continue;

                    const jRadius = (cj.size * 0.5) * 0.9;
                    const jCenterX = cj.x + cj.size * 0.5;
                    const jCenterY = cj.y + cj.size * 0.5;

                    const dx = jCenterX - dCenterX;
                    const dy = jCenterY - dCenterY;
                    const distSq = dx * dx + dy * dy;
                    const minDist = dRadius + jRadius;

                    if (distSq < minDist * minDist && distSq > 0.01) {
                        const dist = Math.sqrt(distSq);
                        const nx = dx / dist;
                        const ny = dy / dist;

                        // Push cj out smoothly
                        const overlap = minDist - dist;
                        cj.x += nx * overlap;
                        cj.y += ny * overlap;

                        // Impulse based on drag speed with a reliable minimum push
                        const impulse = Math.max(70, Math.min(360, dragSpeed * 0.85 + 60)) * (prefersReducedMotion ? 0.3 : 1.0);
                        cj.bounceVx = nx * impulse;
                        cj.bounceVy = ny * impulse;
                        cj.bounceDecay = 1.0;

                        // Small bounce spin clamped to baseTilt +-12
                        if (!prefersReducedMotion) {
                            cj.bounceSpin = (Math.random() - 0.5) * 8;
                        }

                        // Chain reaction depth 1: cj pushes its nearby neighbor
                        for (let k = 0; k < count; k++) {
                            if (k === j || k === draggedIdx) continue;
                            const ck = cards[k];
                            const kRadius = (ck.size * 0.5) * 0.9;
                            const kCenterX = ck.x + ck.size * 0.5;
                            const kCenterY = ck.y + ck.size * 0.5;
                            const kdx = kCenterX - jCenterX;
                            const kdy = kCenterY - jCenterY;
                            const kDistSq = kdx * kdx + kdy * kdy;
                            const kMinDist = jRadius + kRadius;

                            if (kDistSq < kMinDist * kMinDist && kDistSq > 0.01) {
                                const kDist = Math.sqrt(kDistSq);
                                const knx = kdx / kDist;
                                const kny = kdy / kDist;
                                const kOverlap = kMinDist - kDist;
                                ck.x += knx * kOverlap * 0.6;
                                ck.y += kny * kOverlap * 0.6;
                                ck.bounceVx = (ck.bounceVx || 0) + knx * impulse * 0.45;
                                ck.bounceVy = (ck.bounceVy || 0) + kny * impulse * 0.45;
                                ck.bounceDecay = 1.0;
                            }
                        }
                    }
                }
            }

            // --- 3. REGULAR PAIRWISE SOFT REPEL BETWEEN DRIFTING CARDS ---
            for (let i = 0; i < count; i++) {
                const ci = cards[i];
                if (ci.id === currentEnlarged || i === draggedIdx) continue;

                for (let j = i + 1; j < count; j++) {
                    const cj = cards[j];
                    if (cj.id === currentEnlarged || j === draggedIdx) continue;

                    const dx = cj.x - ci.x;
                    const dy = cj.y - ci.y;
                    const distSq = dx * dx + dy * dy;
                    const minDist = ci.size * 0.65 + cj.size * 0.65;

                    if (distSq < minDist * minDist && distSq > 0.01) {
                        const dist = Math.sqrt(distSq);
                        const overlap = (minDist - dist) / minDist;
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

            // --- 4. CARD UPDATES (INTEGRATE VELOCITIES, BOUNCES, LENS, AND RENDER) ---
            for (let i = 0; i < count; i++) {
                const card = cards[i];
                const el = cardElsRef.current[i];
                if (!el) continue;

                if (card.id === currentEnlarged) {
                    continue;
                }

                const isHeld = (i === draggedIdx);

                if (!isHeld) {
                    // Decay bounce impulse back to normal drift speed over ~0.8-1.2s
                    if (card.bounceDecay > 0) {
                        card.bounceDecay -= dt * 1.1;
                        if (card.bounceDecay < 0) card.bounceDecay = 0;
                        card.x += (card.bounceVx || 0) * card.bounceDecay * dt;
                        card.y += (card.bounceVy || 0) * card.bounceDecay * dt;
                    }

                    // Decay bounce spin
                    if (card.bounceSpin) {
                        card.bounceSpin *= 0.92;
                        if (Math.abs(card.bounceSpin) < 0.05) card.bounceSpin = 0;
                    }

                    // Edge bounce while being pushed / bounced
                    if (card.bounceDecay > 0.05) {
                        if (card.x < 10) {
                            card.x = 10;
                            card.bounceVx = Math.abs(card.bounceVx || 0) * 0.7;
                        } else if (card.x + card.size > width - 10) {
                            card.x = width - card.size - 10;
                            card.bounceVx = -Math.abs(card.bounceVx || 0) * 0.7;
                        }
                        if (card.y < 10) {
                            card.y = 10;
                            card.bounceVy = Math.abs(card.bounceVy || 0) * 0.7;
                        } else if (card.y + card.size > height - 10) {
                            card.y = height - card.size - 10;
                            card.bounceVy = -Math.abs(card.bounceVy || 0) * 0.7;
                        }
                    }

                    const motionScale = prefersReducedMotion ? 0.15 : 1.0;
                    const layerFactor =
                        card.layer === 0 ? 0.7 : card.layer === 1 ? 1.0 : 1.35;
                    const targetSpeed =
                        BASE_SPEED * currentMultiplier * layerFactor * motionScale;

                    // Normalize base drift velocity smoothly towards target speed
                    const currentSpeed = Math.hypot(card.vx, card.vy);
                    if (currentSpeed > 0.001) {
                        const nextSpeed = currentSpeed + (targetSpeed - currentSpeed) * 0.1;
                        card.vx = (card.vx / currentSpeed) * nextSpeed;
                        card.vy = (card.vy / currentSpeed) * nextSpeed;
                    }

                    // Integrate position
                    card.x += card.vx * dt;
                    card.y += card.vy * dt;

                    // Small natural drift rotation
                    card.rot += (card.vrot || 0) * dt;
                    const tiltRange = 12;
                    if (card.rot > (card.baseTilt || 0) + tiltRange) {
                        card.rot = (card.baseTilt || 0) + tiltRange;
                        card.vrot = -Math.abs(card.vrot || 1);
                    } else if (card.rot < (card.baseTilt || 0) - tiltRange) {
                        card.rot = (card.baseTilt || 0) - tiltRange;
                        card.vrot = Math.abs(card.vrot || 1);
                    }

                    // --- Standard Screen Edge Wrap (when card leaves screen completely) ---
                    const margin = card.size + 16;
                    let wrapped = false;
                    let reEntryX = card.x;
                    let reEntryY = card.y;

                    if (card.x < -margin) {
                        reEntryX = width + margin * 0.35;
                        let bestY = card.y;
                        let maxClearance = -1;
                        const candidatesCount = 10;
                        for (let s = 0; s < candidatesCount; s++) {
                            const testY = 16 + s * ((height - card.size - 32) / (candidatesCount - 1));
                            let minDistSq = Infinity;
                            for (let j = 0; j < count; j++) {
                                if (j === i) continue;
                                const other = cards[j];
                                const dx = other.x - reEntryX;
                                const dy = other.y - testY;
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
                        card.vx = -Math.abs(card.vx);
                        wrapped = true;
                    } else if (card.x > width + margin) {
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
                                const dx = other.x - reEntryX;
                                const dy = other.y - testY;
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
                        card.vx = Math.abs(card.vx);
                        wrapped = true;
                    } else if (card.y < -margin) {
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
                        card.vy = -Math.abs(card.vy);
                        wrapped = true;
                    } else if (card.y > height + margin) {
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
                        card.vy = Math.abs(card.vy);
                        wrapped = true;
                    }

                    if (wrapped && onMomentRecycle) {
                        onMomentRecycle(i, card.x, card.y);
                    }
                }

                // Lens effect: cursor approaching within ~180px (disabled while dragging or on dragged card)
                let targetLensScale = isHeld ? 1.08 : 1.0;
                let targetLensRot = isHeld ? 0 : 0;

                const cx = card.x + card.size * 0.5;
                const cy = card.y + card.size * 0.5;

                if (!isHeld && pointer.active && !prefersReducedMotion && draggedIdx < 0) {
                    const pdx = cx - pointer.x;
                    const pdy = cy - pointer.y;
                    const pDist = Math.hypot(pdx, pdy);

                    if (pDist < 180) {
                        const factor = 1 - pDist / 180;
                        targetLensScale = 1 + 0.25 * factor;
                        targetLensRot = (pdx > 0 ? 1 : -1) * factor * 5;
                    }
                }

                card.lensScale += (targetLensScale - card.lensScale) * 0.18;
                card.lensRot += (targetLensRot - card.lensRot) * 0.18;

                // Edge fade over 24px margins
                const topFadeRange = 24;
                const bottomFadeRange = 24;
                const sideFadeRange = 24;

                const distToTop = card.y + card.size;
                const distToBottom = height - card.y;
                const distToLeft = card.x + card.size;
                const distToRight = width - card.x;

                let edgeFade = 1.0;
                if (!isHeld) {
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
                }

                let textFactor = 1.0;
                if (shouldFadeText && !isHeld) {
                    const cardCenterY = card.y + card.size / 2;
                    if (cardCenterY < textZoneHeight - 60) {
                        textFactor = 0.35;
                    } else if (cardCenterY < textZoneHeight) {
                        textFactor = 0.35 + ((cardCenterY - (textZoneHeight - 60)) / 60) * 0.65;
                    }
                }

                // Initial stagger bloom
                let bloomFactor = 1.0;
                if (card.spawnTime) {
                    if (now < card.spawnTime) {
                        bloomFactor = 0;
                    } else if (now < card.spawnTime + 180) {
                        bloomFactor = (now - card.spawnTime) / 180;
                    }
                }

                const rawOpacity = currentEnlarged ? card.baseOpacity * 0.4 : card.baseOpacity;
                const renderOpacity = isHeld ? 1.0 : rawOpacity * edgeFade * textFactor * bloomFactor;

                // Straighten tilt slightly when held
                let baseRotation = isHeld ? (card.rot || 0) * 0.35 : (card.rot || 0);
                let renderRot = baseRotation + (card.bounceSpin || 0) + (card.lensRot || 0);

                // Clamp final angle to card.baseTilt +- 12 deg
                const maxAngle = (card.baseTilt || 0) + 12;
                const minAngle = (card.baseTilt || 0) - 12;
                renderRot = Math.max(minAngle, Math.min(maxAngle, renderRot));

                el.style.transform = `translate3d(${card.x.toFixed(1)}px, ${card.y.toFixed(1)}px, 0) rotate(${renderRot.toFixed(2)}deg) scale(${card.lensScale.toFixed(3)})`;
                el.style.opacity = Math.max(0, Math.min(1, renderOpacity)).toFixed(3);
                el.style.zIndex = isHeld ? 1000 : card.layer + 1;
            }
        };

        lastTimeRef.current = performance.now();
        animationFrameId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            observer.disconnect();
        };
    }, [containerRef, cardElsRef, cardsStateRef, onMomentRecycle, textZoneHeight]);

    return {
        setPointer,
        triggerRipple,
        startDrag,
        updateDrag,
        endDrag,
        cancelDrag,
    };
}
