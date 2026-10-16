"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useDebounce } from "use-debounce";
import { usernameSchema } from "@/lib/validations/user";
import styles from "./login.module.css";

function LoginForm() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Inspect query params for auth errors or hints (derived without setState in effect)
  const errorParam = searchParams.get("error");
  const queryErrorMessage = useMemo(() => {
    if (errorParam === "UsernameRequired") {
      return "Username required: Please enter your administrator username in the form below before authenticating with Google.";
    } else if (errorParam === "OAuthSignin" || errorParam === "OAuthCallback") {
      return "Google OAuth handshake failed. Please verify that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in .env.local.";
    } else if (errorParam) {
      return `Authentication notice: ${errorParam}. Please verify your credentials.`;
    }
    return null;
  }, [errorParam]);

  // Form fields from models/user.model.ts (username only; email is provided by Google OAuth, role is excluded: lines 12-16)
  const [username, setUsername] = useState("");
  const [debouncedUsername] = useDebounce(username, 400);

  // Zod validation derived directly from debounced input
  const zodValidation = useMemo(() => {
    const trimmed = debouncedUsername.trim();
    if (!trimmed) {
      return { isValid: false, error: null };
    }
    const result = usernameSchema.safeParse(trimmed);
    if (!result.success) {
      return {
        isValid: false,
        error: result.error.issues[0]?.message || "Invalid username format.",
      };
    }
    return { isValid: true, error: null };
  }, [debouncedUsername]);

  // Server availability state updated ONLY after async fetch completes
  const [serverAvailability, setServerAvailability] = useState<{
    checkedUsername: string;
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string | null;
  }>({
    checkedUsername: "",
    isChecking: false,
    isAvailable: null,
    message: null,
  });

  const isTyping = username.trim() !== debouncedUsername.trim() && username.trim().length > 0;
  const isCheckingUsername =
    isTyping ||
    (zodValidation.isValid &&
      (serverAvailability.isChecking ||
        serverAvailability.checkedUsername !== debouncedUsername.trim()));

  const currentUsernameError = useMemo(() => {
    if (!debouncedUsername.trim() || isTyping) return null;
    if (zodValidation.error) return zodValidation.error;
    if (
      serverAvailability.checkedUsername === debouncedUsername.trim() &&
      serverAvailability.isAvailable === false
    ) {
      return serverAvailability.message || "Username is already taken.";
    }
    return null;
  }, [debouncedUsername, isTyping, zodValidation.error, serverAvailability]);

  const isUsernameAvailable =
    !isCheckingUsername &&
    zodValidation.isValid &&
    serverAvailability.checkedUsername === debouncedUsername.trim() &&
    serverAvailability.isAvailable === true;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real-time debounced username search - ONLY triggers async fetch when Zod passes
  useEffect(() => {
    const trimmed = debouncedUsername.trim();
    if (!trimmed || !zodValidation.isValid) {
      return;
    }

    let isCancelled = false;

    const checkAvailability = async () => {
      try {
        const res = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();

        if (isCancelled) return;

        setServerAvailability({
          checkedUsername: trimmed,
          isChecking: false,
          isAvailable: Boolean(data.available),
          message:
            data.message ||
            data.error ||
            (data.available ? null : "Username is already taken."),
        });
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to verify username availability:", err);
          setServerAvailability({
            checkedUsername: trimmed,
            isChecking: false,
            isAvailable: false,
            message: "Could not verify username availability.",
          });
        }
      }
    };

    checkAvailability();

    return () => {
      isCancelled = true;
    };
  }, [debouncedUsername, zodValidation.isValid]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setIsProfileSaved(false);
  };

  // Handle Username Form Submission (models/user.model.ts)
  const handleSaveProfile = async (e?: React.FormEvent, triggerOAuth = false) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const trimmed = username.trim();

    // Enforce Zod validation on submit
    const validationResult = usernameSchema.safeParse(trimmed);
    if (!validationResult.success) {
      const errorMsg =
        validationResult.error.issues[0]?.message || "Invalid username format.";
      setErrorMessage(errorMsg);
      return false;
    }

    if (!isUsernameAvailable) {
      setErrorMessage(currentUsernameError || "Please choose a verified and available username.");
      return false;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/set-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register username.");
      }

      // Also set document.cookie as client fallback
      document.cookie = `pending_admin_username=${encodeURIComponent(
        trimmed
      )}; path=/; max-age=900; SameSite=Lax`;

      setIsProfileSaved(true);
      showToast("Username confirmed! Google OAuth is now unlocked.");

      if (triggerOAuth) {
        setIsOAuthLoading(true);
        await signIn("google", { callbackUrl: "/" });
      }
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving username.";
      setErrorMessage(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google OAuth trigger
  const handleGoogleOAuth = async () => {
    setErrorMessage(null);

    // Enforce condition: must fill valid, available username first before Google OAuth
    if (!isProfileSaved) {
      const trimmed = username.trim();
      const validationResult = usernameSchema.safeParse(trimmed);
      if (!validationResult.success) {
        const errorMsg =
          validationResult.error.issues[0]?.message || "Username is required by models/user.model.ts.";
        setErrorMessage(`Access denied: ${errorMsg}`);
        showToast(errorMsg);
        return;
      }

      if (!isUsernameAvailable) {
        setErrorMessage(
          currentUsernameError || "Access denied: Username is already taken or invalid."
        );
        showToast("Please choose an available username first.");
        return;
      }

      // If user filled username but hasn't clicked submit yet, save and trigger OAuth
      const success = await handleSaveProfile(undefined, true);
      if (!success) return;
      return;
    }

    setIsOAuthLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("OAuth signin failed:", err);
      setIsOAuthLoading(false);
      setErrorMessage("Failed to initiate Google OAuth sign-in.");
    }
  };

  const isFormComplete =
    username.trim().length >= 3 &&
    isUsernameAvailable &&
    !isCheckingUsername &&
    !currentUsernameError;

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
              <span className={styles.adminTag}>
                <span className={styles.statusDot} />
                Admin Console
              </span>
            </div>

            <h1 className={styles.heading}>Administrator Access</h1>
            <p className={styles.subtitle}>
              Restricted access environment for verified system administrators and catalog operations.
            </p>
          </div>

          {/* Active Session View if already authenticated */}
          {status === "authenticated" && session?.user ? (
            <div className={styles.sessionCard}>
              <div className={styles.sessionAvatar}>
                {session.user.name?.[0] || session.user.username?.[0] || "A"}
              </div>
              <div>
                <h3 className={styles.sessionName}>
                  {session.user.name || session.user.username || "Administrator"}
                </h3>
                <p className={styles.sessionEmail}>{session.user.email}</p>
                <span className={styles.sessionRoleBadge}>
                  Role: {session.user.role || "subadmin"}
                </span>
              </div>
              <div className={styles.sessionActions}>
                <Link href="/" className={styles.btnPrimary}>
                  Enter Admin Console
                </Link>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Authentication & User Model Pre-registration Body */
            <div className={styles.authBody}>
              {/* Error Callout Banner */}
              {(errorMessage || queryErrorMessage) && (
                <div className={styles.errorBanner} role="alert">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <span>{errorMessage || queryErrorMessage}</span>
                </div>
              )}

              {/* Step 1: User Profile Form (models/user.model.ts) */}
              <form onSubmit={(e) => handleSaveProfile(e, false)} className={styles.userForm}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepTitle}>
                    <span className={styles.stepBadge}>1</span>
                    <span>Admin Profile Details</span>
                  </div>
                  <span className={styles.modelBadge}>models/user.model.ts</span>
                </div>

                {/* username field */}
                <div className={styles.formField}>
                  <label htmlFor="user-username" className={styles.fieldLabel}>
                    Username <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <div className={styles.inputControlWrapper}>
                    <input
                      id="user-username"
                      type="text"
                      required
                      placeholder="e.g. aswin_admin"
                      value={username}
                      onChange={handleUsernameChange}
                      className={`${styles.inputControl} ${
                        currentUsernameError
                          ? styles.inputControlInvalid
                          : isUsernameAvailable
                          ? styles.inputControlValid
                          : ""
                      }`}
                      disabled={isSubmitting || isOAuthLoading}
                      autoComplete="username"
                    />
                    <div className={styles.inputStatusIcon}>
                      {isCheckingUsername ? (
                        <svg
                          className={styles.spinnerSvg}
                          style={{ width: 16, height: 16, color: "#a63500" }}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            opacity="0.25"
                          />
                          <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      ) : isUsernameAvailable ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="#00875a"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      ) : currentUsernameError ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="#d04400"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                      ) : null}
                    </div>
                  </div>

                  {/* Real-time Debounced Validation and Availability Feedback */}
                  {isCheckingUsername ? (
                    <div
                      className={`${styles.feedbackRow} ${styles.feedbackChecking}`}
                    >
                      <span>Checking availability...</span>
                    </div>
                  ) : currentUsernameError ? (
                    <div
                      className={`${styles.feedbackRow} ${styles.feedbackError}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      <span>{currentUsernameError}</span>
                    </div>
                  ) : isUsernameAvailable ? (
                    <div
                      className={`${styles.feedbackRow} ${styles.feedbackSuccess}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span>Username is available!</span>
                    </div>
                  ) : (
                    <p className={styles.fieldHint}>
                      Administrator username per models/user.model.ts (3-20 characters, alphanumeric & underscores). Verified in real-time.
                    </p>
                  )}
                </div>

                {/* Role Note (lines 12-16 explicitly excluded from inputs) */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.25rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "#6e5a50" }}>
                    Role assigned: <strong style={{ color: "#131b2e" }}>subadmin</strong> (schema default)
                  </span>
                  {isProfileSaved ? (
                    <span className={styles.verifiedPill}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Profile Verified
                    </span>
                  ) : (
                    <span className={styles.unverifiedPill}>
                      Verification Required
                    </span>
                  )}
                </div>

                {/* Save Profile Button */}
                <button
                  id="save-profile-btn"
                  type="submit"
                  disabled={isSubmitting || isOAuthLoading || !isFormComplete}
                  className={styles.formSubmitBtn}
                >
                  {isSubmitting ? (
                    <>
                      <svg className={styles.spinnerSvg} style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying Profile...
                    </>
                  ) : isProfileSaved ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Profile Saved • Ready for OAuth
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      Verify Details & Unlock Google OAuth
                    </>
                  )}
                </button>
              </form>

              {/* Step 2: Google OAuth section */}
              <div>
                <div className={styles.stepHeader} style={{ marginTop: "0.5rem" }}>
                  <div className={styles.stepTitle}>
                    <span className={styles.stepBadge}>2</span>
                    <span>Google OAuth Authentication</span>
                  </div>
                  {isProfileSaved ? (
                    <span className={styles.oauthUnlockedNotice}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
                      </svg>
                      Unlocked
                    </span>
                  ) : (
                    <span className={styles.oauthLockNotice}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                      </svg>
                      Fill Form First
                    </span>
                  )}
                </div>

                {/* Google Workspace Primary OAuth Button */}
                <button
                  id="google-sso-trigger"
                  type="button"
                  className={`${styles.ssoButton} ${
                    !isProfileSaved && !isFormComplete ? styles.ssoButtonDisabled : ""
                  }`}
                  onClick={handleGoogleOAuth}
                  disabled={isOAuthLoading || isSubmitting}
                  title={
                    !isProfileSaved && !isFormComplete
                      ? "Complete the User Profile form above first"
                      : "Sign in with Google Workspace"
                  }
                >
                  {isOAuthLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <svg
                        className={styles.spinnerSvg}
                        style={{ width: 18, height: 18, color: "#4285F4" }}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className={styles.ssoText}>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
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
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Domain Policy Guard Hint */}
              <div className={styles.domainHint}>
                <span className={styles.shieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                </span>
                <p className={styles.hintText}>
                  Registration links your administrator identity in MongoDB to your verified Google account.
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
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
            </div>
          )}
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

      {/* Toast Notification */}
      {toastMessage && (
        <aside className={styles.toastNotice} role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#f26419">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.loginPage}>Loading authentication portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
