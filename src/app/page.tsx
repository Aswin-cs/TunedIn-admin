"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

interface CatalogTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  r2Key: string;
  streams: string;
  status: "live" | "processing" | "draft";
  statusText: string;
  editionBadge?: string;
  isrc: string;
  artworkUrl: string;
  category: "all" | "processing" | "drafts";
}

const INITIAL_TRACKS: CatalogTrack[] = [
  {
    id: "tr-1",
    title: "Midnight Reverie (VIP Mix)",
    artist: "Aswin & Kiasmos",
    album: "Echoes in Obsidian",
    duration: "04:12",
    r2Key: "r2://masters/2025/tr-9812.flac",
    streams: "412,890",
    status: "live",
    statusText: "Live",
    editionBadge: "VIP",
    isrc: "US-TUN-25-00491",
    artworkUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMahkNExERLuA_PCTQN9pyuiAwa9vKRWI4nmxTwOP0Be-6MnX6CDbEnxtkwAJf2WLYWWuDk0iMO1I5H_SaLbR2ZAJJGpBeZ4orUW6KELkwMm3SCpLm_QgnvgxT-4k4kbCY8oDOUTrc2L10DHfRW10sfwmxIpsRgqTTE9f28dQ9t4nmXKj26ElmRMoShspWoMIGzL6vb27H2-BAvLZMoPr2JG64VnO8Vs3CZcJ1lMoHl8iyoPAsAthW",
    category: "all",
  },
  {
    id: "tr-2",
    title: "Chronos Descent (Atmos Master)",
    artist: "Max Richter & Olafur",
    album: "Spatial Horizons OST",
    duration: "06:48",
    r2Key: "r2://masters/2025/tr-9804.adm",
    streams: "284,110",
    status: "live",
    statusText: "Live",
    editionBadge: "ATMOS",
    isrc: "DE-TUN-25-00104",
    artworkUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAo4tkL5aSmkFp4UEVu43LSbaqMZdarbt7DsGxONqM9ZOm7S2YOuXkkT5TtKNLOC4oYcW61Mp_WtITsIrMcThehmaQyXEBd_CT3si9yy36ge3pROzwJSftsJW6f1DlA4S7wbycaNeD89M5arPCSxQc2cy7g6sqTR7rEQ-Pdv1DpbJhqGdW5Vfj7xida3bRc4FDlVq5-jJCHFZpI4cTLVgEekh8abxMeoqqATeu0Yc746OxCMP6bKgog",
    category: "all",
  },
  {
    id: "tr-3",
    title: "Solitude in F Minor",
    artist: "Nils Frahm Ensemble",
    album: "The Solitary Architect",
    duration: "05:22",
    r2Key: "r2://masters/2025/tr-9799.flac",
    streams: "19,420",
    status: "processing",
    statusText: "Processing 84%",
    isrc: "UK-TUN-25-09823",
    artworkUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDu1Ad2G3mtCtKwI_McMSCx7dT4evys6R06tq-Lx4nacgqqLbytDzh3lm52g9gMnPK0r6sMWprwz3Q04fo_2AUhLLo6TWAK82f3d8Qea8htfZlQ4B6qHO9qlUwHYS49PcPvmKS8ZXN5wmUZJkVML678GIdL3_kbsvKhGyTtDivhHpdMoGlzbkx4n_518931u16RHZQoFpPjLtAyI1IPBoKqmmiN--XwCOAGXcEovrmOtFZmxnAHo4YB",
    category: "processing",
  },
  {
    id: "tr-4",
    title: "Sub-Orbital Drift",
    artist: "Jon Hopkins & Tycho",
    album: "Singularity Resonances",
    duration: "07:15",
    r2Key: "r2://masters/2025/tr-9712.flac",
    streams: "670,450",
    status: "live",
    statusText: "Live",
    isrc: "US-TUN-25-00388",
    artworkUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcv4YHS-dDsuuLooV8r9plcG24mhNC8pG1YmXDv654IIZXQ-Gvfi8oUBIVs-mYKk-odBdIncm8Uz1623N5ZewyKZ4KI4x36rO9OyRTg3gMDXFMsLDj_uQkQsV0-mWfrftTSOeiWNaAxNfWYN2eFoVshujhMhq0do80w9KEjZ7iePgOnO94HCEcXOU2Ryer4oXFczEgoE_nJs4Bt9dr0jrSVnoLeUwENTqhi8QOBdSZYmuFAtpF42Jm",
    category: "all",
  },
  {
    id: "tr-5",
    title: "Hyperline Vector 86",
    artist: "GUNSHIP & Kavinsky",
    album: "Neon Overdrive",
    duration: "03:49",
    r2Key: "r2://masters/2025/tr-9642.flac",
    streams: "1,124,000",
    status: "live",
    statusText: "Live",
    isrc: "FR-TUN-25-00812",
    artworkUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFT9K1kakYB6LH35QbHvvAMuGXdP9uZUlVB8Sh8iI5BuDtT-Iqxra82nd89CJaxRbWwGczgr4bYt_9DgRnvOmoNmQ6Jnvt5n0w2iMTuJwaqUOzubQKPeUl_QSYNPdpiofszXW3BO8UEy6zoQbbTT8uFJgqNXFklbfylZoUQDQKmc00cPgM6Qn2fz8N2jhvOrFtforHx2ZRN1_V0AqWlCuwjP6p9YoaVoE89UjrIfd23XXaDYII9I_f",
    category: "all",
  },
];

// 55 Bar heights matching the audio waveform in the Stitch mockup
const FREQUENCY_HEIGHTS = [
  16, 24, 28, 36, 44, 24, 20, 32, 40, 48, 36, 28, 44, 48, 40, 32, 20, 28, 44, 48,
  36, 32, 24, 40, 44, 28, 20, 36, 48, 40, 28, 24, 32, 44, 36, 20, 28, 40, 24, 16,
  20, 32, 44, 36, 28, 20, 24, 36, 44, 48, 32, 24, 16, 20, 16
];

export default function AdminDashboardPage() {
  // Navigation State
  const [activeNav, setActiveNav] = useState("overview-analytics");

  // Ingestion Form State
  const [trackTitle, setTrackTitle] = useState("Midnight Reverie (VIP Mix)");
  const [primaryArtist, setPrimaryArtist] = useState("Aswin & Kiasmos");
  const [albumCollection, setAlbumCollection] = useState("Echoes in Obsidian (Deluxe Edition)");
  const [isrc, setIsrc] = useState("US-TUN-25-00491");
  const [artworkUrl, setArtworkUrl] = useState(
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAH-uDDC18zCWmCpI70txCzYCznXJeLFYZ_lkXdiza7gBHt0QcrH5y0r09iDGF_-ZIWhb4M6SUdPMJMG1OugVYEsQKdxvzpiWkbUr44pME_8Frp7ys88u0qfuhiCGBiA4ng1hkFk6y073504Vdyu4qKQrkU3tPnRxYhoD_WY5CK27HT-g4w2kjZMMxUdZbY4rdVBWqfIXdebr5MNpElyCpd2rTGTWcA0RasfoJa6Rqa7wch_38ASPCJ"
  );

  // Genre Tags State
  const [activeTags, setActiveTags] = useState<string[]>([
    "Deep House",
    "Melodic Techno",
  ]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    "Ambient Minimal",
    "Synthwave 80s",
    "Sub-Bass Cinematic",
  ]);

  // Catalog Table State
  const [tracks, setTracks] = useState<CatalogTrack[]>(INITIAL_TRACKS);
  const [activeTab, setActiveTab] = useState<"all" | "processing" | "drafts">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Status & Feedback
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Telemetry metrics refreshed successfully.");
    }, 700);
  };

  // Audio Playback & Music Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFileName, setActiveFileName] = useState("staged_master_48k24b.flac");
  const [activeFileSize, setActiveFileSize] = useState("42.8 MB");
  const [currentSeconds, setCurrentSeconds] = useState(149.10); // 02:29.10 default
  const totalDurationSeconds = 278.12; // 04:38.12
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  // Web Audio Context & Synthesizer Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const synthNodesRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null);

  // Helper to format seconds to mm:ss.xx
  const formatTime = (secsTotal: number) => {
    const mins = Math.floor(secsTotal / 60);
    const secs = secsTotal % 60;
    const formattedSecs = secs.toFixed(2);
    return `0${mins}:${secs < 10 ? "0" : ""}${formattedSecs}`;
  };

  const currentTime = formatTime(currentSeconds);
  const playheadRatio = Math.max(0, Math.min(1, currentSeconds / totalDurationSeconds));

  // Audio synthesis start/stop
  const startAudioSynth = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (!masterGainRef.current) {
        const mg = ctx.createGain();
        mg.connect(ctx.destination);
        masterGainRef.current = mg;
      }

      const effectiveVolume = isMuted ? 0 : (volume / 100) * 0.12;
      masterGainRef.current.gain.setTargetAtTime(effectiveVolume, ctx.currentTime, 0.05);

      if (!synthNodesRef.current) {
        // Create a warm lush musical chord (F minor 9: F3, Ab3, C4, Eb4, G4)
        const chordFreqs = [174.61, 207.65, 261.63, 311.13, 392.0];
        const oscs: OscillatorNode[] = [];
        const chordGain = ctx.createGain();
        chordGain.gain.setValueAtTime(0.01, ctx.currentTime);
        chordGain.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.3);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, ctx.currentTime);

        chordFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx === 0 ? "triangle" : "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.connect(chordGain);
          osc.start();
          oscs.push(osc);
        });

        chordGain.connect(filter);
        filter.connect(masterGainRef.current);
        synthNodesRef.current = { oscs, gain: chordGain };
      }
    } catch {
      // AudioContext fallback handled silently
    }
  };

  const stopAudioSynth = () => {
    if (synthNodesRef.current && audioContextRef.current) {
      try {
        const ctx = audioContextRef.current;
        synthNodesRef.current.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
        setTimeout(() => {
          synthNodesRef.current?.oscs.forEach((osc) => {
            try { osc.stop(); osc.disconnect(); } catch {}
          });
          synthNodesRef.current = null;
        }, 120);
      } catch {}
    }
  };

  // Sync Volume to Audio Gain
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      const effectiveVol = isMuted ? 0 : (volume / 100) * 0.12;
      masterGainRef.current.gain.setTargetAtTime(effectiveVol, audioContextRef.current.currentTime, 0.05);
    }
  }, [volume, isMuted]);

  // Handle Play/Pause Toggle
  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAudioSynth();
      showToast("Master audio preview paused.");
    } else {
      setIsPlaying(true);
      startAudioSynth();
      showToast("Streaming lossless master preview...");
    }
  };

  // Timer Tick
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSeconds((prev) => {
        const next = prev + 0.1 * playbackSpeed;
        if (next >= totalDurationSeconds) {
          if (isLooping) {
            return 0;
          }
          setIsPlaying(false);
          stopAudioSynth();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, isLooping, totalDurationSeconds]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudioSynth();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleSeek = (newSeconds: number) => {
    const clamped = Math.max(0, Math.min(totalDurationSeconds, newSeconds));
    setCurrentSeconds(clamped);
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    handleSeek(ratio * totalDurationSeconds);
  };

  const handleSkip = (secondsDelta: number) => {
    handleSeek(currentSeconds + secondsDelta);
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.8];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    showToast(`Playback speed: ${nextSpeed}x`);
  };

  const toggleTag = (tag: string, isActive: boolean) => {
    if (isActive) {
      setActiveTags(activeTags.filter((t) => t !== tag));
      setAvailableTags([...availableTags, tag]);
    } else {
      setAvailableTags(availableTags.filter((t) => t !== tag));
      setActiveTags([...activeTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const custom = prompt("Enter custom genre or spectral vibe tag:");
    if (custom && custom.trim().length > 0) {
      const clean = custom.trim();
      if (!activeTags.includes(clean) && !availableTags.includes(clean)) {
        setActiveTags([...activeTags, clean]);
        showToast(`Added custom tag: "${clean}"`);
      }
    }
  };

  const handleSaveDraft = () => {
    showToast(`Draft for "${trackTitle}" saved to cloud cache.`);
  };

  const handlePublish = () => {
    const newTrack: CatalogTrack = {
      id: `tr-${Date.now()}`,
      title: trackTitle,
      artist: primaryArtist,
      album: albumCollection,
      duration: "04:38",
      r2Key: `r2://masters/2025/tr-${Math.floor(1000 + Math.random() * 9000)}.flac`,
      streams: "0",
      status: "live",
      statusText: "Live",
      editionBadge: "NEW",
      isrc: isrc,
      artworkUrl: artworkUrl,
      category: "all",
    };
    setTracks([newTrack, ...tracks]);
    showToast(`Master "${trackTitle}" published to TunedIn Network!`);
  };

  const handleDeleteTrack = (id: string, name: string) => {
    setTracks(tracks.filter((t) => t.id !== id));
    showToast(`Archived "${name}" from catalog.`);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTracks.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Copied ${label}: ${text}`);
    }
  };

  // Filtered tracks
  const filteredTracks = tracks.filter((track) => {
    const matchesTab =
      activeTab === "all" ? true : track.category === activeTab || track.status === activeTab;
    const matchesQuery =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.isrc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.r2Key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className={styles.dashboardContainer}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast} role="status">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={styles.sidebar}>
        <div>
          {/* Header */}
          <div className={styles.sidebarHeader}>
            <Image
              src="/music-logo-orbit.svg"
              alt="TunedIn Logo"
              width={34}
              height={34}
              priority
              className={styles.logoImage}
            />
            <div className={styles.brandInfo}>
              <span className={styles.brandName}>TunedIn</span>
              <span className={styles.brandSubtitle}>Admin Console v2.4</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className={styles.navSection}>
            <p className={styles.navCategoryTitle}>Platform Navigation</p>
            <nav className={styles.navLinks}>
              <button
                type="button"
                className={`${styles.navItem} ${activeNav === "overview-analytics" ? styles.navItemActive : ""}`}
                onClick={() => setActiveNav("overview-analytics")}
              >
                <span className={`material-symbols-outlined ${styles.navItemIcon}`}>monitoring</span>
                <span>Overview / Analytics</span>
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${activeNav === "track-upload" ? styles.navItemActive : ""}`}
                onClick={() => setActiveNav("track-upload")}
              >
                <span className={`material-symbols-outlined ${styles.navItemIcon}`}>cloud_upload</span>
                <span>Track Upload</span>
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${activeNav === "music-catalog" ? styles.navItemActive : ""}`}
                onClick={() => setActiveNav("music-catalog")}
              >
                <span className={`material-symbols-outlined ${styles.navItemIcon}`}>library_music</span>
                <span>Music Catalog</span>
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${activeNav === "playlists" ? styles.navItemActive : ""}`}
                onClick={() => setActiveNav("playlists")}
              >
                <span className={`material-symbols-outlined ${styles.navItemIcon}`}>queue_music</span>
                <span>Playlists</span>
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${activeNav === "storage-cdn" ? styles.navItemActive : ""}`}
                onClick={() => setActiveNav("storage-cdn")}
              >
                <span className={`material-symbols-outlined ${styles.navItemIcon}`}>hard_drive</span>
                <span>Storage &amp; CDN</span>
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${activeNav === "settings" ? styles.navItemActive : ""}`}
                onClick={() => setActiveNav("settings")}
              >
                <span className={`material-symbols-outlined ${styles.navItemIcon}`}>settings</span>
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatarWrapper}>
                <div className={styles.userAvatar}>A</div>
                <span className={styles.statusIndicator} title="Online" />
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userNameRow}>
                  <span className={styles.userName}>Aswin</span>
                  <span className={styles.userRoleBadge}>Admin</span>
                </div>
              </div>
            </div>

            <Link href="/login" className={styles.logoutBtn} title="Sign Out">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className={styles.contentArea}>
        {/* Top Fixed Header */}
        <header className={styles.topHeader}>
          <div className={styles.searchWrapper}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search catalog, artists, ISRCs, or storage keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={styles.searchShortcut}>
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>

          <div className={styles.headerRightActions}>
            <div className={styles.headerStatusBadge}>
              <span className={styles.headerStatusDot}></span>
              <span>Live System</span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className={styles.mainContainer}>
          {/* Ambient Decorative Glows */}
          <div className={styles.ambientGlow1} aria-hidden="true" />
          <div className={styles.ambientGlow2} aria-hidden="true" />

          {/* Telemetry Header */}
          <div className={styles.telemetryBar}>
            <div>
              <h1 className={styles.pageTitle}>Audio Operations &amp; Catalog Ingestion</h1>
            </div>
            <div className={styles.telemetryActions}>
              <button
                type="button"
                className={styles.refreshBtn}
                onClick={handleRefresh}
                title="Fetch latest metrics"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${isRefreshing ? styles.spinAnimation : ""}`}
                  style={{ color: "#5f5e5e" }}
                >
                  sync
                </span>
                <span>Refresh Metrics</span>
              </button>
            </div>
          </div>

          {/* SECTION A: Storage & CDN Stat Cards */}
          <section className={styles.statsGrid}>
            {/* Card 1: R2 Storage */}
            <div className={styles.statCard}>
              <div>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Total Audio Uploads</span>
                  <span className={styles.statBadgeAlt}>Cloudflare R2</span>
                </div>
                <div className={styles.statValueRow}>
                  <span className={styles.statValue}>48.2 GB</span>
                  <span className={styles.statUnit}>/ 100 GB</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div className={styles.progressBarFill} style={{ width: "48.2%" }} />
                </div>
              </div>
              <div className={styles.statFooter}>
                <span>48.2% of pool allocated</span>
                <span style={{ color: "#A03B00", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#A03B00" }}></span>
                  Edge 22ms
                </span>
              </div>
            </div>

            {/* Card 2: Poster CDN */}
            <div className={styles.statCard}>
              <div>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Poster CDN Bandwidth</span>
                  <span className={styles.statBadge}>
                    <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                    +5.2%
                  </span>
                </div>
                <div className={styles.statValueRow}>
                  <span className={styles.statValue}>184.6 GB</span>
                </div>
                <div className={styles.statCalloutRow}>
                  <span style={{ color: "#5f5e5e", fontWeight: 500 }}>Cache Hit Ratio</span>
                  <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: "#1b1c18" }}>99.98%</span>
                </div>
              </div>
              <div className={styles.statFooter}>
                <span>Cloudinary Media Engine</span>
                <span style={{ fontWeight: 600, color: "#1b1c18" }}>Brotli WebP</span>
              </div>
            </div>
          </section>

          {/* SECTION B: Release & Asset Ingestion Studio */}
          <section className={styles.studioSection}>
            {/* Header */}
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderLeft}>
                <div className={styles.sectionIconBadge}>
                  <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                </div>
                <div>
                  <h2 className={styles.sectionTitle}>Release &amp; Asset Ingestion Studio</h2>
                  <p className={styles.sectionSubtitle}>
                    Package masters, spectral art tags, and Cloudflare R2 pipeline metadata
                  </p>
                </div>
              </div>

              <div className={styles.sectionHeaderRight}>
                <div className={styles.autoSaveBadge}>
                  <span className={styles.autoSaveDot}></span>
                  <span>
                    Draft Auto-saved <strong style={{ color: "#1b1c18" }}>14:22:04 UTC</strong>
                  </span>
                </div>
                <button
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#5f5e5e", padding: "4px" }}
                  title="Presets &amp; Ingestion Rules"
                  onClick={() => showToast("Ingestion profiles & presets loaded.")}
                >
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </button>
              </div>
            </div>

            {/* Studio Body: Dual Column */}
            <div className={styles.studioBody}>
              {/* Left Column: Artwork Dropzone & Color Extraction */}
              <div className={styles.artworkCol}>
                <div className={styles.artworkLabelRow}>
                  <label className={styles.fieldLabel}>Master Artwork Canvas</label>
                  <span className={styles.aspectLabel}>Aspect 1:1</span>
                </div>

                {/* Dropzone Container */}
                <div
                  className={styles.dropzoneContainer}
                  onClick={() => {
                    const newUrl = prompt("Enter new album artwork image URL:", artworkUrl);
                    if (newUrl && newUrl.trim()) {
                      setArtworkUrl(newUrl.trim());
                      showToast("Updated release artwork canvas.");
                    }
                  }}
                  title="Click to change release artwork"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artworkUrl}
                    alt="Release artwork preview"
                    className={styles.dropzoneBgImage}
                  />
                  <div className={styles.dropzoneOverlay}></div>
                  <div className={styles.dropzoneContent}>
                    <div className={styles.dropzoneIconWrapper}>
                      <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                    </div>
                    <p className={styles.dropzoneTitle}>Drop Release Artwork</p>
                    <p className={styles.dropzoneSub}>or browse local disk directory</p>
                    <span className={styles.dropzoneSpecs}>3000x3000px • Max 15MB • JPG/PNG</span>
                  </div>
                  <span className={styles.replacePill}>Replace Artwork</span>
                </div>

                {/* Chroma Swatches */}
                <div className={styles.swatchesPanel}>
                  <div className={styles.swatchesHeader}>
                    <span>Auto-Extracted Accent Swatches</span>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: "#A03B00" }}>
                      auto_awesome
                    </span>
                  </div>
                  <div className={styles.swatchesGrid}>
                    <div
                      className={styles.swatchItem}
                      onClick={() => copyToClipboard("#F26419", "Dominant Accent")}
                      title="Click to copy color code"
                    >
                      <div className={styles.swatchColorBox} style={{ backgroundColor: "#F26419" }} />
                      <div className={styles.swatchMeta}>
                        <span className={styles.swatchHex}>#F26419</span>
                        <span className={styles.swatchType}>Dominant</span>
                      </div>
                    </div>

                    <div
                      className={styles.swatchItem}
                      onClick={() => copyToClipboard("#E88C2B", "Vibrant Accent")}
                      title="Click to copy color code"
                    >
                      <div className={styles.swatchColorBox} style={{ backgroundColor: "#E88C2B" }} />
                      <div className={styles.swatchMeta}>
                        <span className={styles.swatchHex}>#E88C2B</span>
                        <span className={styles.swatchType}>Vibrant</span>
                      </div>
                    </div>

                    <div
                      className={styles.swatchItem}
                      onClick={() => copyToClipboard("#8D7166", "Muted Accent")}
                      title="Click to copy color code"
                    >
                      <div className={styles.swatchColorBox} style={{ backgroundColor: "#8D7166" }} />
                      <div className={styles.swatchMeta}>
                        <span className={styles.swatchHex}>#8D7166</span>
                        <span className={styles.swatchType}>Muted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata Form & Master Audio Stage */}
              <div className={styles.formCol}>
                <div className={styles.fieldsGrid}>
                  {/* Track Title */}
                  <div className={styles.inputGroup}>
                    <div className={styles.inputGroupHeader}>
                      <label className={styles.fieldLabel}>Track Title</label>
                      <span style={{ color: "#A03B00", fontFamily: "Space Grotesk, sans-serif", fontSize: "11px", fontWeight: 700 }}>
                        Primary Master
                      </span>
                    </div>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                    />
                  </div>

                  {/* Primary Artist */}
                  <div className={styles.inputGroup}>
                    <label className={styles.fieldLabel}>Primary Artist(s)</label>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={primaryArtist}
                      onChange={(e) => setPrimaryArtist(e.target.value)}
                    />
                  </div>

                  {/* Album / Collection */}
                  <div className={styles.inputGroup}>
                    <label className={styles.fieldLabel}>Album / Collection</label>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={albumCollection}
                      onChange={(e) => setAlbumCollection(e.target.value)}
                    />
                  </div>

                  {/* ISRC Identifier */}
                  <div className={styles.inputGroup}>
                    <div className={styles.inputGroupHeader}>
                      <label className={styles.fieldLabel}>ISRC Identifier</label>
                      <span style={{ color: "#5f5e5e", fontFamily: "Space Grotesk, sans-serif", fontSize: "11px", fontWeight: 600 }}>
                        Auto-Generated
                      </span>
                    </div>
                    <div className={styles.isrcInputWrapper}>
                      <input
                        type="text"
                        className={styles.isrcInput}
                        value={isrc}
                        onChange={(e) => setIsrc(e.target.value)}
                      />
                      <span className={`material-symbols-outlined ${styles.verifiedIcon}`} title="Verified ISRC format">
                        verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Genre & Spectral Vibe Tags */}
                <div className={styles.genreContainer}>
                  <label className={styles.fieldLabel}>Categorization &amp; Spectral Vibe Tags</label>
                  <div className={styles.tagPillsRow}>
                    {activeTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={styles.genrePillActive}
                        onClick={() => toggleTag(tag, true)}
                        title="Click to remove tag"
                      >
                        <span>{tag}</span>
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    ))}

                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={styles.genrePillInactive}
                        onClick={() => toggleTag(tag, false)}
                        title="Click to add tag"
                      >
                        <span>{tag}</span>
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      className={styles.addCustomTagBtn}
                      onClick={handleAddCustomTag}
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>Custom Tag</span>
                    </button>
                  </div>
                </div>

                {/* Staged Audio Master Music Player */}
                <div className={`${styles.audioStagePanel} ${isPlaying ? styles.audioStagePanelPlaying : ""}`}>
                  {/* Header: File info, lossless badge, live EQ animation */}
                  <div className={styles.audioHeader}>
                    <div className={styles.audioMetaLeft}>
                      <div className={`${styles.audioDiscIcon} ${isPlaying ? styles.audioDiscSpinning : ""}`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {isPlaying ? "graphic_eq" : "album"}
                        </span>
                      </div>
                      <div className={styles.audioTrackInfo}>
                        <div className={styles.audioFileNameRow}>
                          <span className={styles.audioFileName}>{activeFileName}</span>
                          <span className={styles.fileSizeBadge}>{activeFileSize}</span>
                          <span className={styles.losslessBadge}>48kHz / 24-bit Lossless</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#5f5e5e", marginTop: "2px" }}>
                          Master Audio Engine • Direct R2 Stream
                        </span>
                      </div>
                    </div>

                    <div className={styles.audioHeaderRight}>
                      {/* Animated Equalizer when playing */}
                      {isPlaying ? (
                        <div className={styles.eqVisualizer} title="Lossless Output Active">
                          <div className={`${styles.eqBar} ${styles.eqBar1}`} />
                          <div className={`${styles.eqBar} ${styles.eqBar2}`} />
                          <div className={`${styles.eqBar} ${styles.eqBar3}`} />
                          <div className={`${styles.eqBar} ${styles.eqBar4}`} />
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#5f5e5e", fontWeight: 600 }}>Ready</span>
                      )}
                    </div>
                  </div>

                  {/* Time Readout */}
                  <div className={styles.timeRow}>
                    <span className={styles.currentTimeDisplay}>{currentTime}</span>
                    <span>Track Duration: 04:38.12</span>
                  </div>

                  {/* 55 Frequency Bars Visualizer */}
                  <div
                    className={styles.waveformStrip}
                    onClick={handleWaveformClick}
                    title="Click anywhere to scrub playback position"
                  >
                    {FREQUENCY_HEIGHTS.map((height, idx) => {
                      const barRatio = idx / FREQUENCY_HEIGHTS.length;
                      const isPlayed = barRatio <= playheadRatio;
                      const isPlayhead = Math.abs(barRatio - playheadRatio) < 0.025;

                      if (isPlayhead) {
                        return <div key={idx} className={styles.playheadCursor} />;
                      }

                      return (
                        <div
                          key={idx}
                          className={`${styles.frequencyBar} ${isPlayed ? styles.playedBar : styles.unplayedBar}`}
                          style={{ height: `${height}px` }}
                        />
                      );
                    })}
                  </div>

                  {/* Full Transport Controls Deck */}
                  <div className={styles.playerControlsDeck}>
                    {/* Left/Center: Transport Buttons */}
                    <div className={styles.transportButtonsGroup}>
                      <button
                        type="button"
                        className={`${styles.transportBtn} ${isShuffled ? styles.transportBtnActive : ""}`}
                        onClick={() => {
                          setIsShuffled(!isShuffled);
                          showToast(isShuffled ? "Shuffle disabled" : "Shuffle enabled");
                        }}
                        title="Shuffle"
                      >
                        <span className="material-symbols-outlined text-[16px]">shuffle</span>
                      </button>

                      <button
                        type="button"
                        className={styles.transportBtn}
                        onClick={() => handleSkip(-10)}
                        title="Rewind 10 seconds"
                      >
                        <span className="material-symbols-outlined text-[18px]">replay_10</span>
                      </button>

                      <button
                        type="button"
                        className={styles.playBtnCircle}
                        onClick={togglePlayPause}
                        title={isPlaying ? "Pause Preview" : "Play Master Preview"}
                      >
                        <span
                          className="material-symbols-outlined text-[24px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {isPlaying ? "pause" : "play_arrow"}
                        </span>
                      </button>

                      <button
                        type="button"
                        className={styles.transportBtn}
                        onClick={() => handleSkip(10)}
                        title="Forward 10 seconds"
                      >
                        <span className="material-symbols-outlined text-[18px]">forward_10</span>
                      </button>

                      <button
                        type="button"
                        className={`${styles.transportBtn} ${isLooping ? styles.transportBtnActive : ""}`}
                        onClick={() => {
                          setIsLooping(!isLooping);
                          showToast(isLooping ? "Repeat disabled" : "Repeat loop enabled");
                        }}
                        title="Loop Track"
                      >
                        <span className="material-symbols-outlined text-[16px]">repeat</span>
                      </button>
                    </div>

                    {/* Right: Audio Settings (Speed & Volume) */}
                    <div className={styles.audioSettingsGroup}>
                      <button
                        type="button"
                        className={styles.speedToggleBtn}
                        onClick={cyclePlaybackSpeed}
                        title="Click to change playback speed"
                      >
                        {playbackSpeed}x
                      </button>

                      <div className={styles.volumeControl}>
                        <button
                          type="button"
                          className={styles.muteBtn}
                          onClick={() => setIsMuted(!isMuted)}
                          title={isMuted ? "Unmute" : "Mute"}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isMuted || volume === 0
                              ? "volume_off"
                              : volume < 50
                              ? "volume_down"
                              : "volume_up"}
                          </span>
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            setVolume(Number(e.target.value));
                            if (isMuted) setIsMuted(false);
                          }}
                          className={styles.volumeSlider}
                          title={`Volume: ${isMuted ? 0 : volume}%`}
                        />
                        <span className={styles.volumePercentText}>{isMuted ? "0%" : `${volume}%`}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className={styles.actionButtonsRow}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={togglePlayPause}
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ color: "#5f5e5e" }}>
                      {isPlaying ? "pause_circle" : "play_circle"}
                    </span>
                    <span>{isPlaying ? "Pause Stream" : "Preview Stream"}</span>
                  </button>

                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleSaveDraft}
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ color: "#5f5e5e" }}>
                      save
                    </span>
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    className={styles.btnPublish}
                    onClick={handlePublish}
                  >
                    <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                    <span>Publish to TunedIn Network</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION C: Music Catalog Data Table */}
          <section className={styles.catalogSection}>
            <div className={styles.catalogControls}>
              {/* Category Filter Tabs */}
              <div className={styles.filterTabs}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "all" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("all")}
                >
                  All Tracks
                  <span className={styles.tabCountPill}>
                    {tracks.length > 5 ? tracks.length : "1,248"}
                  </span>
                </button>

                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "processing" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("processing")}
                >
                  Pending Transcode
                  <span className={styles.tabCountPill}>4</span>
                </button>

                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "drafts" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("drafts")}
                >
                  Drafts
                  <span className={styles.tabCountPillAlt}>18</span>
                </button>
              </div>

              {/* Filter Search & Export */}
              <div className={styles.catalogRightActions}>
                <div className={styles.tableFilterInputWrapper}>
                  <span
                    className="material-symbols-outlined"
                    style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "#5f5e5e" }}
                  >
                    filter_list
                  </span>
                  <input
                    type="text"
                    className={styles.tableFilterInput}
                    placeholder="Filter current view..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className={styles.exportBtn}
                  onClick={() => showToast("Exporting catalog metadata to CSV/JSON format...")}
                  title="Export CSV / JSON"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
              <table className={styles.catalogTable}>
                <thead>
                  <tr className={styles.tableHeadRow}>
                    <th className={styles.thCell} style={{ width: "48px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === filteredTracks.length}
                        onChange={handleSelectAll}
                        style={{ accentColor: "#A03B00", cursor: "pointer" }}
                      />
                    </th>
                    <th className={styles.thCell}>Track &amp; Artwork</th>
                    <th className={styles.thCell}>Album Release</th>
                    <th className={styles.thCell} style={{ textAlign: "right" }}>Duration</th>
                    <th className={styles.thCell}>R2 Storage Key</th>
                    <th className={styles.thCell} style={{ textAlign: "right" }}>Streams</th>
                    <th className={styles.thCell}>Status</th>
                    <th className={styles.thCell} style={{ textAlign: "right", paddingRight: "1.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTracks.map((track) => {
                    const isSelected = selectedIds.includes(track.id);
                    return (
                      <tr key={track.id} className={styles.tableRow}>
                        <td className={styles.tdCell} style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(track.id)}
                            style={{ accentColor: "#A03B00", cursor: "pointer" }}
                          />
                        </td>
                        <td className={styles.tdCell}>
                          <div className={styles.trackCell}>
                            <div className={styles.albumThumbnailWrapper}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={track.artworkUrl}
                                alt={track.title}
                                className={styles.albumThumbnail}
                              />
                              <button
                                type="button"
                                className={styles.playOverlayBtn}
                                onClick={() => {
                                  setActiveFileName(`${track.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.flac`);
                                  setTrackTitle(track.title);
                                  setPrimaryArtist(track.artist);
                                  setAlbumCollection(track.album);
                                  setIsrc(track.isrc);
                                  setArtworkUrl(track.artworkUrl);
                                  setCurrentSeconds(0);
                                  if (!isPlaying) {
                                    setIsPlaying(true);
                                    startAudioSynth();
                                  }
                                  showToast(`Loaded and playing "${track.title}" in Master Deck`);
                                  window.scrollTo({ top: 320, behavior: "smooth" });
                                }}
                                title="Play in Master Player"
                              >
                                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  play_arrow
                                </span>
                              </button>
                            </div>
                            <div className={styles.trackMetaCol}>
                              <div className={styles.trackTitleRow}>
                                <span className={styles.trackTitle}>{track.title}</span>
                                {track.editionBadge && (
                                  <span
                                    className={
                                      track.editionBadge === "VIP"
                                        ? styles.editionBadge
                                        : styles.atmosBadge
                                    }
                                  >
                                    {track.editionBadge}
                                  </span>
                                )}
                              </div>
                              <div className={styles.trackSubDetails}>
                                <span>{track.artist}</span>
                                <span>•</span>
                                <span className={styles.isrcCode}>{track.isrc}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={styles.tdCell} style={{ color: "#5f5e5e", fontWeight: 500, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {track.album}
                        </td>
                        <td className={styles.tdCell} style={{ textAlign: "right", fontFamily: "Space Grotesk, sans-serif", color: "#5f5e5e", fontWeight: 500 }}>
                          {track.duration}
                        </td>
                        <td className={styles.tdCell}>
                          <span
                            className={styles.storagePill}
                            onClick={() => copyToClipboard(track.r2Key, "R2 Storage Key")}
                            title="Click to copy R2 key"
                            style={{ cursor: "pointer" }}
                          >
                            {track.r2Key}
                          </span>
                        </td>
                        <td className={styles.tdCell} style={{ textAlign: "right", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: "#1b1c18" }}>
                          {track.streams}
                        </td>
                        <td className={styles.tdCell}>
                          {track.status === "live" ? (
                            <span className={styles.statusLivePill}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                              Live
                            </span>
                          ) : (
                            <span className={styles.statusProcessingPill}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#A03B00" }} />
                              {track.statusText}
                            </span>
                          )}
                        </td>
                        <td className={styles.tdCell} style={{ textAlign: "right", paddingRight: "1.5rem" }}>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.rowActionBtn}
                              title="Stream Telemetry"
                              onClick={() => showToast(`Telemetry: ${track.streams} total requests via edge network.`)}
                            >
                              <span className="material-symbols-outlined text-[18px]">equalizer</span>
                            </button>
                            <button
                              type="button"
                              className={styles.rowActionBtn}
                              title="Edit Metadata"
                              onClick={() => {
                                setTrackTitle(track.title);
                                setPrimaryArtist(track.artist);
                                setAlbumCollection(track.album);
                                setIsrc(track.isrc);
                                setArtworkUrl(track.artworkUrl);
                                showToast(`Loaded "${track.title}" into Ingestion Studio.`);
                                window.scrollTo({ top: 300, behavior: "smooth" });
                              }}
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              className={`${styles.rowActionBtn} ${styles.rowActionBtnDanger}`}
                              title="Archive Master"
                              onClick={() => handleDeleteTrack(track.id, track.title)}
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className={styles.paginationFooter}>
              <div className={styles.paginationInfo}>
                Showing <strong style={{ color: "#1b1c18" }}>1</strong> to{" "}
                <strong style={{ color: "#1b1c18" }}>{filteredTracks.length}</strong> of{" "}
                <strong style={{ color: "#1b1c18" }}>1,248</strong> master recordings
              </div>

              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className={`${styles.pageBtn} ${currentPage === 1 ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                <button
                  type="button"
                  className={`${styles.pageBtn} ${currentPage === 2 ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(2)}
                >
                  2
                </button>
                <button
                  type="button"
                  className={`${styles.pageBtn} ${currentPage === 3 ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(3)}
                >
                  3
                </button>
                <span style={{ padding: "0 4px", color: "#5f5e5e", fontWeight: 600 }}>...</span>
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage(250)}
                >
                  250
                </button>
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
