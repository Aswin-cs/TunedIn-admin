"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./PremiumLoadingScreen.module.css";

interface PremiumLoadingScreenProps {
  message?: string;
  stage?: "session" | "catalog" | "audio" | "general";
}

const BOOT_STAGES = [
  "Authenticating zero-trust administrator credentials...",
  "Establishing encrypted 256-bit TLS handshake...",
  "Synchronizing Cloudinary media pipeline & edge CDN...",
  "Mounting lossless catalog & Web Audio synthesis...",
  "Calibrating studio acoustic transport controls...",
];

export default function PremiumLoadingScreen({
  message,
}: PremiumLoadingScreenProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    // Stage message cycling
    const messageInterval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % BOOT_STAGES.length);
    }, 1600);

    // Realistic progress advancement
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return prev;
        const jump = Math.floor(Math.random() * 12) + 4;
        return Math.min(prev + jump, 94);
      });
    }, 280);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const activeMessage = message || BOOT_STAGES[stageIndex];

  return (
    <div className={styles.viewport} role="status" aria-live="polite">
      {/* Ambient Radial Atmospheric Glows */}
      <div className={styles.ambientGlowPrimary} aria-hidden="true" />
      <div className={styles.ambientGlowSecondary} aria-hidden="true" />

      {/* Hardware Blueprint Registration Crosshairs */}
      <span className={`${styles.cornerMark} ${styles.topLeftMark}`}>+</span>
      <span className={`${styles.cornerMark} ${styles.topRightMark}`}>+</span>
      <span className={`${styles.cornerMark} ${styles.bottomLeftMark}`}>+</span>
      <span className={`${styles.cornerMark} ${styles.bottomRightMark}`}>+</span>

      {/* Viewport Corner Telemetry */}
      <div className={`${styles.cornerTelemetry} ${styles.telemetryTopLeft}`}>
        <span className={styles.telemetryDot} />
        <span>TUNEDIN // AUDIO LABS</span>
      </div>

      <div className={`${styles.cornerTelemetry} ${styles.telemetryTopRight}`}>
        <span>48kHz / 24-BIT FLAC</span>
        <span>•</span>
        <span>ZERO-TRUST</span>
      </div>

      <div className={`${styles.cornerTelemetry} ${styles.telemetryBottomLeft}`}>
        <span>SYS.BUILD 2.4.0</span>
        <span>•</span>
        <span>AES-256 TLS</span>
      </div>

      <div className={`${styles.cornerTelemetry} ${styles.telemetryBottomRight}`}>
        <span>CLOUDINARY PIPELINE READY</span>
      </div>

      {/* Central Floating Console Card */}
      <div className={styles.consoleCard}>
        {/* Orbital Logo Stage */}
        <div className={styles.logoStage}>
          <div className={styles.logoBackdropAura} aria-hidden="true" />

          {/* Outer Orbit Track with Orbiting Comet */}
          <div className={styles.outerOrbitRing}>
            <div className={styles.orbitComet} />
          </div>

          {/* Inner Dashed Orbit Track */}
          <div className={styles.innerOrbitRing} />

          {/* Core Brand Mark */}
          <div className={styles.logoCore}>
            <Image
              src="/music-logo-orbit.svg"
              alt="TunedIn Logo"
              width={48}
              height={48}
              priority
              className={styles.logoImage}
            />
          </div>
        </div>

        {/* 7-Band Equalizer Soundwave */}
        <div className={styles.equalizerContainer} aria-hidden="true">
          <div className={`${styles.eqBar} ${styles.eqBar1}`} />
          <div className={`${styles.eqBar} ${styles.eqBar2}`} />
          <div className={`${styles.eqBar} ${styles.eqBar3}`} />
          <div className={`${styles.eqBar} ${styles.eqBar4}`} />
          <div className={`${styles.eqBar} ${styles.eqBar5}`} />
          <div className={`${styles.eqBar} ${styles.eqBar6}`} />
          <div className={`${styles.eqBar} ${styles.eqBar7}`} />
        </div>

        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandWordmark}>
            <span>Tuned</span>
            <span className={styles.brandAccent}>In</span>
          </div>
          <span className={styles.brandSubtitle}>Administration Studio</span>
        </div>

        {/* Live Status Telemetry Readout */}
        <div className={styles.statusMessageWrapper}>
          <span className={styles.statusIndicatorDot} />
          <span className={styles.statusMessageText}>{activeMessage}</span>
        </div>

        {/* Precision Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}>
              <div className={styles.progressShimmer} />
            </div>
          </div>
          <div className={styles.progressReadoutRow}>
            <span className={styles.progressLabel}>Initializing Core Engine</span>
            <span className={styles.progressPercent}>{progress}%</span>
          </div>
        </div>

        {/* Security & Verification Footer */}
        <div className={styles.consoleFooter}>
          <div className={styles.securityBadge}>
            <span className={`material-symbols-outlined ${styles.shieldIcon}`}>shield</span>
            <span>Zero-Trust Protocol • Protected by NextAuth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
