'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move, Maximize2 } from 'lucide-react';
import styles from './ImageCropperModal.module.css';

export default function ImageCropperModal({
    isOpen,
    imageSrc,
    aspectRatio: defaultAspectRatio = 16 / 9,
    aspectRatioOptions = [
        { label: '16:9 (Banner)', value: 16 / 9 },
        { label: '3:4 (Portrait)', value: 3 / 4 },
        { label: '1:1 (Square)', value: 1 },
        { label: 'Free', value: 0 }
    ],
    title = 'Crop & Adjust Image',
    onCropComplete,
    onClose,
}) {
    const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef(null);
    const imageRef = useRef(null);

    // Reset settings when new image opens
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setRotation(0);
            setPan({ x: 0, y: 0 });
            setAspectRatio(defaultAspectRatio);
        }
    }, [isOpen, defaultAspectRatio, imageSrc]);

    // Handle mouse drag for panning
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    }, [isDragging, dragStart]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch support for mobile/tablets
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - pan.x,
                y: e.touches[0].clientY - pan.y
            });
        }
    };

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || e.touches.length !== 1) return;
        setPan({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y
        });
    }, [isDragging, dragStart]);

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Mouse wheel zoom
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.0015;
        setZoom(prev => Math.min(Math.max(0.5, prev + delta), 4));
    };

    // Reset pan & zoom to fit
    const handleFitToScreen = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
    };

    // Execute Crop via Canvas
    const handleApplyCrop = () => {
        const img = imageRef.current;
        const container = containerRef.current;
        if (!img || !container) return;

        // Container / crop box dimensions
        const cropRect = container.getBoundingClientRect();
        const outputWidth = aspectRatio > 0 ? (aspectRatio >= 1 ? 1400 : Math.round(1400 * aspectRatio)) : 1200;
        const outputHeight = aspectRatio > 0 ? Math.round(outputWidth / aspectRatio) : Math.round(outputWidth * (cropRect.height / cropRect.width));

        const canvas = document.createElement('canvas');
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill background white in case of margins
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputWidth, outputHeight);

        // Coordinates mapping
        const scaleFactor = outputWidth / cropRect.width;

        ctx.save();
        // Translate to center of canvas
        ctx.translate(outputWidth / 2, outputHeight / 2);
        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);
        // Apply pan (scaled)
        ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor);
        // Apply zoom
        const imgDisplayWidth = img.clientWidth * zoom * scaleFactor;
        const imgDisplayHeight = img.clientHeight * zoom * scaleFactor;

        ctx.drawImage(
            img,
            -imgDisplayWidth / 2,
            -imgDisplayHeight / 2,
            imgDisplayWidth,
            imgDisplayHeight
        );
        ctx.restore();

        // Convert to dataURL
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        onCropComplete(croppedDataUrl);
        onClose();
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{title}</h3>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Crop Stage Area */}
                <div className={styles.stageWrap}>
                    <div
                        ref={containerRef}
                        className={styles.cropViewport}
                        style={{
                            aspectRatio: aspectRatio > 0 ? `${aspectRatio}` : '16 / 10',
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onWheel={handleWheel}
                    >
                        {/* Image inside viewport */}
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Crop preview"
                            className={styles.sourceImg}
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                cursor: isDragging ? 'grabbing' : 'grab',
                            }}
                            draggable={false}
                        />

                        {/* Grid guides overlay */}
                        <div className={styles.gridOverlay}>
                            <div className={styles.gridLineH1} />
                            <div className={styles.gridLineH2} />
                            <div className={styles.gridLineV1} />
                            <div className={styles.gridLineV2} />
                        </div>
                    </div>

                    <div className={styles.dragHelpText}>
                        <Move size={14} />
                        <span>Click and drag image to position &bull; Use slider or scroll wheel to zoom</span>
                    </div>
                </div>

                {/* Aspect Ratio Selector */}
                {aspectRatioOptions.length > 1 && (
                    <div className={styles.aspectRow}>
                        <span className={styles.controlLabel}>Aspect Ratio:</span>
                        <div className={styles.aspectPills}>
                            {aspectRatioOptions.map((opt) => (
                                <button
                                    key={opt.label}
                                    type="button"
                                    className={`${styles.aspectBtn} ${aspectRatio === opt.value ? styles.aspectBtnActive : ''}`}
                                    onClick={() => setAspectRatio(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Controls Bar: Zoom, Rotate, Reset */}
                <div className={styles.controlsBar}>
                    {/* Zoom Slider */}
                    <div className={styles.zoomControl}>
                        <ZoomOut size={16} className={styles.controlIcon} onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} />
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className={styles.zoomSlider}
                        />
                        <ZoomIn size={16} className={styles.controlIcon} onClick={() => setZoom(z => Math.min(3, z + 0.1))} />
                        <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
                    </div>

                    {/* Rotate button */}
                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => setRotation(r => (r + 90) % 360)}
                        title="Rotate 90°"
                    >
                        <RotateCw size={16} />
                        <span>Rotate</span>
                    </button>

                    {/* Reset button */}
                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={handleFitToScreen}
                        title="Reset Position"
                    >
                        <Maximize2 size={16} />
                        <span>Fit</span>
                    </button>
                </div>

                {/* Actions Footer */}
                <div className={styles.modalFooter}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className={styles.applyBtn} onClick={handleApplyCrop}>
                        <Check size={16} />
                        <span>Crop & Apply Image</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
