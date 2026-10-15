"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSsoClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className={styles.loginPage}>
      {/* Ambient Radial Graphic Auras */}
      <div className={styles.ambientTop} aria-hidden="true" />
      <div className={styles.ambientBottom} aria-hidden="true" />

      {/* Center Authentication Surface */}
      <main className={styles.centerWrapper}>
        <div className={styles.authCard}>
          {/* Security Indicator Pill */}
          <div className={styles.encryptedBadge} title="256-Bit Hardware Encrypted Tunnel">
            <span className={styles.badgeIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </span>
            <span>256-Bit TLS</span>
          </div>

          {/* Brand Header */}
          <div className={styles.cardHeader}>
            <div className={styles.logoWrapper}>
              <Image
                src="/music-logo-orbit.svg"
                alt="Music Logo"
                width={60}
                height={60}
                priority
                className={styles.logoImage}
              />
            </div>

            <div className={styles.identityRow}>
              <span className={styles.brandTitle}>
                Tuned<span className={styles.brandAccent}>In</span>
              </span>
            </div>

            <h1 className={styles.heading}>Administrator Access</h1>
            <p className={styles.subtitle}>
              Restricted access environment for verified system administrators, streaming audio engineers, and operations staff.
            </p>
          </div>

          {/* Authentication Body */}
          <div className={styles.authBody}>
            {/* Google Workspace Primary OAuth Button */}
            <button
              id="google-sso-trigger"
              type="button"
              className={styles.ssoButton}
              onClick={handleSsoClick}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                  fill="#34A853"
                />
                <path
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  fill="#EA4335"
                />
              </svg>
              <span className={styles.ssoText}>Continue with Google Workspace</span>
              <span className={styles.arrowIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </button>

            {/* Domain Policy Guard Hint */}
            <div className={styles.domainHint}>
              <span className={styles.shieldIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              </span>
              <p className={styles.hintText}>
                Requires an active <span className={styles.hintHighlight}>@soundlab.audio</span> or verified{" "}
                <span className={styles.hintHighlight}>@tunedin.com</span> corporate Google identity.
              </p>
            </div>


            {/* IT Help Desk Callout */}
            <div className={styles.itDeskBox}>
              <p className={styles.itDeskText}>
                Need elevated admin permissions or experiencing SSO issues?
              </p>
              <a
                href="#it-desk"
                className={styles.itDeskLink}
                onClick={(e) => {
                  e.preventDefault();
                  showToast("Connecting to Enterprise IT Helpdesk at support@tunedin.com");
                }}
              >
                <span>Contact IT Operations Desk</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Enterprise Compliance & Security Strip */}
        <footer className={styles.footerStrip}>
          <div className={styles.complianceItem}>
            <span className={styles.socDot} />
            <span className={styles.complianceLabel}>SOC2 Type II Certified</span>
          </div>

          <span className={styles.footerDot} aria-hidden="true">•</span>

          <div className={styles.complianceItem}>
            <span className={styles.complianceLabel}>TLS 1.3 Strict</span>
          </div>

          <span className={styles.footerDot} aria-hidden="true">•</span>

          <nav className={styles.footerLinks} aria-label="Security & Compliance links">
            <Link
              href="#incident-response"
              className={styles.footerLink}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                showToast("Incident response protocol: SOC Status Normal (Green)");
              }}
            >
              Incident Response
            </Link>
            <Link
              href="#security-policy"
              className={styles.footerLink}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                showToast("SoundLab Security Policy: ISO/IEC 27001 Compliant");
              }}
            >
              Security Policy
            </Link>
            <Link
              href="#console-docs"
              className={styles.footerLink}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                showToast("Opening TunedIn Admin Console v2.4 Documentation");
              }}
            >
              Console Docs
            </Link>
          </nav>
        </footer>
      </main>

      {/* Interactive SAML Authentication Overlay */}
      {isModalOpen && (
        <div
          id="auth-modal"
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className={styles.modalCard}>
            <div className={styles.spinnerWrapper}>
              <svg className={styles.spinnerSvg} fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeOpacity="0.2"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            <h2 id="modal-title" className={styles.modalTitle}>
              Authenticating Identity
            </h2>

            <p className={styles.modalDesc}>
              Redirecting to Google Enterprise SAML Endpoint for cryptographic token verification...
            </p>

            <div className={styles.progressBarContainer} aria-hidden="true">
              <div className={styles.progressBarFill} />
            </div>

            <button
              id="cancel-sso"
              type="button"
              className={styles.cancelModalBtn}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel Handshake
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <aside className={styles.toastNotice} role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#a63500">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
