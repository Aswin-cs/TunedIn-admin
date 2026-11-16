"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./ImageCropModal.module.css";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName?: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
  isUploading?: boolean;
}

const CROP_BOX_SIZE = 340; // 1:1 square viewport size in CSS pixels
const OUTPUT_SIZE = 1200; // 1200x1200px lossless export resolution

export default function ImageCropModal({
  isOpen,
  imageSrc,
  fileName = "artwork_master_1x1.jpg",
  onClose,
  onCropComplete,
  isUploading = false,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ startX: 0, startY: 0, initPosX: 0, initPosY: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Reset transforms whenever a new image source opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
  }, [isOpen, imageSrc]);

  // Handle natural image loading & dimensions
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalDimensions({
      width: img.naturalWidth || 600,
      height: img.naturalHeight || 600,
    });
  };

  // Compute base scaling so image always fits/covers 1:1 viewport
  const isRotated90or270 = rotation === 90 || rotation === 270;
  const effectiveWidth = isRotated90or270 ? naturalDimensions.height : naturalDimensions.width;
  const effectiveHeight = isRotated90or270 ? naturalDimensions.width : naturalDimensions.height;

  const baseScale =
    effectiveWidth > 0 && effectiveHeight > 0
      ? Math.max(CROP_BOX_SIZE / effectiveWidth, CROP_BOX_SIZE / effectiveHeight)
      : 1;

  // Maximum allowed pan offset so image never exposes empty borders
  const scaledWidth = effectiveWidth * baseScale * zoom;
  const scaledHeight = effectiveHeight * baseScale * zoom;
  const maxOffsetX = Math.max(0, (scaledWidth - CROP_BOX_SIZE) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - CROP_BOX_SIZE) / 2);

  // Clamp helper
  const clampPosition = useCallback(
    (x: number, y: number, currentZoom: number) => {
      const sW = effectiveWidth * baseScale * currentZoom;
      const sH = effectiveHeight * baseScale * currentZoom;
      const mX = Math.max(0, (sW - CROP_BOX_SIZE) / 2);
      const mY = Math.max(0, (sH - CROP_BOX_SIZE) / 2);
      return {
        x: Math.max(-mX, Math.min(mX, x)),
        y: Math.max(-mY, Math.min(mY, y)),
      };
    },
    [effectiveWidth, effectiveHeight, baseScale]
  );

  // Drag interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOrigin({
      startX: e.clientX,
      startY: e.clientY,
      initPosX: position.x,
      initPosY: position.y,
    });
    if (viewportRef.current) {
      viewportRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - dragOrigin.startX;
    const deltaY = e.clientY - dragOrigin.startY;
    const targetX = dragOrigin.initPosX + deltaX;
    const targetY = dragOrigin.initPosY + deltaY;

    setPosition(clampPosition(targetX, targetY, zoom));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        viewportRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // Handled gracefully
      }
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
    const nextZoom = Math.min(3, Math.max(1, +(zoom + zoomDelta).toFixed(2)));
    setZoom(nextZoom);
    setPosition((prev) => clampPosition(prev.x, prev.y, nextZoom));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setPosition({ x: 0, y: 0 });
  };

  // Reset all adjustments
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // Export cropped 1:1 image using HTML5 canvas
  const handleApplyCrop = async () => {
    const img = imageRef.current;
    if (!img) return;

    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to create canvas rendering context");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Ratio between export resolution (1200) and viewport size (340)
      const ratio = OUTPUT_SIZE / CROP_BOX_SIZE;

      ctx.save();
      // Move to center of canvas
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

      // Apply Pan offset in canvas space
      ctx.translate(position.x * ratio, position.y * ratio);

      // Apply Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw the original image centered
      const drawWidth = naturalDimensions.width * baseScale * zoom * ratio;
      const drawHeight = naturalDimensions.height * baseScale * zoom * ratio;
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (blob) {
            const cleanName = fileName.replace(/\.[^/.]+$/, "") + "_1x1.jpg";
            const croppedFile = new File([blob], cleanName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            const previewUrl = URL.createObjectURL(blob);
            onCropComplete(croppedFile, previewUrl);
          }
        },
        "image/jpeg",
        0.94
      );
    } catch (err) {
      console.error("Error cropping image:", err);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconBadge}>
              <span className="material-symbols-outlined text-[20px]">crop</span>
            </div>
            <div>
              <h3 className={styles.headerTitle}>Position &amp; Crop Artwork</h3>
              <p className={styles.headerSubtitle}>Strict 1:1 square master framing for release packaging</p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Close without saving">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Viewport & Body */}
        <div className={styles.modalBody}>
          <div
            ref={viewportRef}
            className={styles.cropViewport}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* The Image being adjusted */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Artwork preview to crop"
              crossOrigin="anonymous"
              onLoad={handleImageLoaded}
              className={styles.cropImage}
              style={{
                width: `${naturalDimensions.width * baseScale * zoom}px`,
                height: `${naturalDimensions.height * baseScale * zoom}px`,
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
              }}
            />

            {/* Rule of Thirds Alignment Grid */}
            <div className={styles.gridOverlay}>
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
            </div>

            {/* Center Registration Mark */}
            <div className={styles.centerCrosshair} />

            {/* Aspect Ratio Badge */}
            <div className={styles.aspectBadge}>
              <span className="material-symbols-outlined text-[13px]" style={{ color: "#F26419" }}>
                crop_square
              </span>
              <span>1:1 MASTER</span>
            </div>

            {/* Drag & Pan Hint */}
            <div className={styles.dragHint}>Drag to reposition • Scroll or slider to zoom</div>
          </div>

          {/* Controls Panel */}
          <div className={styles.controlsSection}>
            {/* Zoom Slider */}
            <div className={styles.sliderRow}>
              <span className={`material-symbols-outlined ${styles.sliderIcon}`}>zoom_out</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={zoom}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setZoom(val);
                  setPosition((prev) => clampPosition(prev.x, prev.y, val));
                }}
                className={styles.zoomSlider}
                title="Adjust artwork zoom"
              />
              <span className={`material-symbols-outlined ${styles.sliderIcon}`}>zoom_in</span>
              <span className={styles.zoomValueBadge}>{Math.round(zoom * 100)}%</span>
            </div>

            {/* Action Tools */}
            <div className={styles.toolsRow}>
              <div className={styles.toolsLeft}>
                <button
                  type="button"
                  className={styles.toolBtn}
                  onClick={handleRotate}
                  title="Rotate image 90 degrees clockwise"
                >
                  <span className="material-symbols-outlined text-[16px]">rotate_right</span>
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  className={styles.toolBtn}
                  onClick={handleReset}
                  title="Reset position and zoom"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Center / Reset</span>
                </button>
              </div>

              <span style={{ fontSize: "11px", color: "#8d7166", fontWeight: 600 }}>
                Output: 1200 x 1200 px
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isProcessing || isUploading}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.applyBtn}
            onClick={handleApplyCrop}
            disabled={isProcessing || isUploading}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isProcessing || isUploading ? "hourglass_top" : "check"}
            </span>
            <span>{isProcessing ? "Processing 1:1 Crop..." : isUploading ? "Uploading..." : "Apply 1:1 Crop"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
