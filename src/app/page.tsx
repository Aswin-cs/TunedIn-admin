"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "./page.module.css";

interface CatalogTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  storageKey: string;
  streams: string;
  status: "live" | "processing" | "draft";
  statusText: string;
  editionBadge?: string;
  isrc: string;
  artworkUrl: string;
  category: "all" | "processing" | "drafts";
  rawSong?: any;
}

export type AdminRole =
  | "Super Admin"
  | "SecOps Engineer"
  | "Catalog Lead"
  | "Audio Curator"
  | "Infrastructure Eng";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleColor: string;
  scope: string;
  mfaStatus: "Verified" | "Enforced" | "Pending";
  lastActive: string;
  avatarBg: string;
  avatarColor: string;
  online: boolean;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  time: string;
  status: "success" | "warning";
}

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: "adm-1",
    name: "Aswin",
    email: "aswin@tunedin.internal",
    role: "Super Admin",
    roleColor: "#A03B00",
    scope: "Full Root & Infrastructure Access",
    mfaStatus: "Verified",
    lastActive: "Active now",
    avatarBg: "#FFF2EB",
    avatarColor: "#A03B00",
    online: true,
  },
  {
    id: "adm-2",
    name: "Elena Vance",
    email: "elena.v@tunedin.internal",
    role: "SecOps Engineer",
    roleColor: "#7c3aed",
    scope: "Security Policies & WebAuthn Audit",
    mfaStatus: "Verified",
    lastActive: "14 mins ago",
    avatarBg: "#f3e8ff",
    avatarColor: "#7c3aed",
    online: true,
  },
  {
    id: "adm-3",
    name: "Marcus Thorne",
    email: "marcus.t@tunedin.internal",
    role: "Catalog Lead",
    roleColor: "#2563eb",
    scope: "Backblaze B2 & Release Metadata",
    mfaStatus: "Verified",
    lastActive: "1 hour ago",
    avatarBg: "#dbeafe",
    avatarColor: "#2563eb",
    online: true,
  },
  {
    id: "adm-4",
    name: "Sarah Jenkins",
    email: "sarah.j@tunedin.internal",
    role: "Audio Curator",
    roleColor: "#059669",
    scope: "Playlists Curation & Quality Review",
    mfaStatus: "Verified",
    lastActive: "3 hours ago",
    avatarBg: "#d1fae5",
    avatarColor: "#059669",
    online: false,
  },
  {
    id: "adm-5",
    name: "David Chen",
    email: "d.chen@tunedin.internal",
    role: "Infrastructure Eng",
    roleColor: "#d97706",
    scope: "Transcoding Pipeline & Edge CDN Nodes",
    mfaStatus: "Verified",
    lastActive: "Yesterday",
    avatarBg: "#fef3c7",
    avatarColor: "#d97706",
    online: false,
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-1",
    actor: "Aswin",
    role: "Super Admin",
    action: "Validated master FLAC audio ingestion schema",
    target: "ISRC: US-TUN-25-00491",
    ip: "192.168.1.42 (Frankfurt)",
    time: "8 mins ago",
    status: "success",
  },
  {
    id: "aud-2",
    actor: "Elena Vance",
    role: "SecOps",
    action: "Rotated Backblaze B2 bucket Application Key",
    target: "b2://tunedin-audio/masters/2025/*",
    ip: "10.0.4.11 (Stockholm)",
    time: "42 mins ago",
    status: "success",
  },
  {
    id: "aud-3",
    actor: "Marcus Thorne",
    role: "Catalog Lead",
    action: "Approved VIP master transcode profile",
    target: "Echoes in Obsidian (Deluxe)",
    ip: "172.16.8.20 (London)",
    time: "2 hours ago",
    status: "success",
  },
  {
    id: "aud-4",
    actor: "System Engine",
    role: "Automated",
    action: "Generated encrypted catalog database snapshot",
    target: "backup-2025-snapshot-08.zst",
    ip: "Internal Cluster Node 4",
    time: "4 hours ago",
    status: "success",
  },
];

const INITIAL_TRACKS: CatalogTrack[] = [
  {
    id: "tr-1",
    title: "Midnight Reverie (VIP Mix)",
    artist: "Aswin & Kiasmos",
    album: "Echoes in Obsidian",
    duration: "04:12",
    storageKey: "b2://tunedin-audio/2025/tr-9812.flac",
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
    storageKey: "b2://tunedin-audio/2025/tr-9804.mp3",
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
    storageKey: "b2://tunedin-audio/2025/tr-9799.flac",
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
    storageKey: "b2://tunedin-audio/2025/tr-9712.flac",
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
    storageKey: "b2://tunedin-audio/2025/tr-9642.flac",
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
  // Authentication Guard State
  const { data: session, status } = useSession();

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
  const [rawSongs, setRawSongs] = useState<any[]>([]);
  const [trackCounts, setTrackCounts] = useState({
    all: 1248,
    pending: 4,
    drafts: 18,
    verified: 1240,
  });
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);
  const [inspectingSong, setInspectingSong] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState<"all" | "processing" | "drafts">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Status & Feedback
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin Panel State
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("all");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [securityPolicies, setSecurityPolicies] = useState({
    strictMfa: true,
    b2WriteLock: true,
    edgeInvalidation: true,
    dbSnapshots: true,
    maintenanceMode: false,
  });

  // Fetch Raw Songs from MongoDB Song model API route
  const fetchCatalogSongs = async () => {
    setIsLoadingTracks(true);
    try {
      const res = await fetch("/api/songs");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.songs)) {
          setRawSongs(data.songs);
          if (data.counts) {
            setTrackCounts(data.counts);
          }
          const mapped: CatalogTrack[] = data.songs.map((song: any) => {
            const durSec = typeof song.duration === "number" ? song.duration : 0;
            const mins = Math.floor(durSec / 60);
            const secs = Math.floor(durSec % 60);
            const durFormatted = `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;

            const isLive = song.verificationStatus === "verified";
            const isPending = song.verificationStatus === "pending";
            const status: "live" | "processing" | "draft" = isLive
              ? "live"
              : isPending
              ? "processing"
              : "draft";
            const statusText = isLive
              ? "Live"
              : isPending
              ? "Processing 84%"
              : "Draft";
            const category: "all" | "processing" | "drafts" = isPending
              ? "processing"
              : isLive
              ? "all"
              : "drafts";

            const artistText = Array.isArray(song.artist)
              ? song.artist.join(" & ")
              : song.artist || "Unknown Artist";
            const streamsText =
              typeof song.plays === "number" ? song.plays.toLocaleString() : "0";
            const isrcText =
              song.aiObservation?.isrc ||
              `US-TUN-25-${(song._id || "").toString().slice(-5).toUpperCase()}`;

            return {
              id: song._id?.toString() || `tr-${Date.now()}`,
              title: song.title,
              artist: artistText,
              album: song.album,
              duration: durFormatted,
              storageKey:
                song.audio_Id || song.audio_url || "b2://tunedin-audio/2025/master.flac",
              streams: streamsText,
              status,
              statusText,
              editionBadge: song.aiObservation?.badge || undefined,
              isrc: isrcText,
              artworkUrl:
                song.poster_url ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDMahkNExERLuA_PCTQN9pyuiAwa9vKRWI4nmxTwOP0Be-6MnX6CDbEnxtkwAJf2WLYWWuDk0iMO1I5H_SaLbR2ZAJJGpBeZ4orUW6KELkwMm3SCpLm_QgnvgxT-4k4kbCY8oDOUTrc2L10DHfRW10sfwmxIpsRgqTTE9f28dQ9t4nmXKj26ElmRMoShspWoMIGzL6vb27H2-BAvLZMoPr2JG64VnO8Vs3CZcJ1lMoHl8iyoPAsAthW",
              category,
              rawSong: song,
            };
          });
          setTracks(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch catalog tracks from /api/songs:", err);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  // Live Storage Metrics State (Exact details from config/backblaze and config/cloudinary)
  const [liveStorage, setLiveStorage] = useState<{
    backblaze: {
      configured: boolean;
      bucketName: string;
      bucketId: string;
      region: string;
      fileCount: number;
      totalBytes: number;
      formattedSize: string;
      freeTierLimitBytes: number;
      freeTierFormatted: string;
      percentUsed: number;
      status: string;
    };
    cloudinary: {
      configured: boolean;
      plan: string;
      storageBytes: number;
      storageFormatted: string;
      bandwidthBytes: number;
      bandwidthFormatted: string;
      objectsCount: number;
      transformations: number;
      creditsUsed: number;
      creditsLimit: number;
      creditsUsedPercent: number;
      status: string;
    };
  } | null>(null);

  const fetchLiveStorage = async () => {
    try {
      const res = await fetch("/api/storage/metrics");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLiveStorage(data);
        }
      }
    } catch {
      // Handled gracefully
    }
  };

  useEffect(() => {
    fetchLiveStorage();
    fetchCatalogSongs();
  }, []);

  // Admin Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("Audio Curator");
  const [inviteScope, setInviteScope] = useState("");

  const handleTogglePolicy = (policyKey: keyof typeof securityPolicies, label: string) => {
    setSecurityPolicies((prev) => {
      const next = !prev[policyKey];
      showToast(`${label} policy ${next ? "enabled" : "disabled"}.`);
      return { ...prev, [policyKey]: next };
    });
  };

  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      showToast("Please provide both name and email.");
      return;
    }

    const roleColors: Record<AdminRole, { bg: string; color: string }> = {
      "Super Admin": { bg: "#FFF2EB", color: "#A03B00" },
      "SecOps Engineer": { bg: "#f3e8ff", color: "#7c3aed" },
      "Catalog Lead": { bg: "#dbeafe", color: "#2563eb" },
      "Audio Curator": { bg: "#d1fae5", color: "#059669" },
      "Infrastructure Eng": { bg: "#fef3c7", color: "#d97706" },
    };

    const newAdmin: AdminUser = {
      id: `adm-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      roleColor: roleColors[inviteRole].color,
      scope: inviteScope.trim() || "Standard Department Access",
      mfaStatus: "Pending",
      lastActive: "Invited just now",
      avatarBg: roleColors[inviteRole].bg,
      avatarColor: roleColors[inviteRole].color,
      online: false,
    };

    setAdmins((prev) => [newAdmin, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actor: "Aswin",
        role: "Super Admin",
        action: `Issued administrator invitation to ${inviteName.trim()} (${inviteRole})`,
        target: inviteEmail.trim(),
        ip: "192.168.1.42 (Local)",
        time: "Just now",
        status: "success",
      },
      ...prev,
    ]);

    setIsInviteModalOpen(false);
    setInviteName("");
    setInviteEmail("");
    setInviteScope("");
    showToast(`Administrator invitation sent to ${inviteEmail}.`);
  };

  const handleRevokeAdmin = (id: string, name: string) => {
    if (name === "Aswin") {
      showToast("Cannot revoke primary Super Administrator.");
      return;
    }
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actor: "Aswin",
        role: "Super Admin",
        action: `Revoked console permissions for ${name}`,
        target: `User ID: ${id}`,
        ip: "192.168.1.42 (Local)",
        time: "Just now",
        status: "warning",
      },
      ...prev,
    ]);
    showToast(`Revoked console privileges for ${name}.`);
  };

  const handleCycleRole = (id: string, currentRole: AdminRole, name: string) => {
    if (name === "Aswin") {
      showToast("Primary account retains permanent Super Admin authorization.");
      return;
    }
    const roles: AdminRole[] = [
      "Super Admin",
      "SecOps Engineer",
      "Catalog Lead",
      "Audio Curator",
      "Infrastructure Eng",
    ];
    const currentIndex = roles.indexOf(currentRole);
    const nextRole = roles[(currentIndex + 1) % roles.length];

    const roleColors: Record<AdminRole, { bg: string; color: string }> = {
      "Super Admin": { bg: "#FFF2EB", color: "#A03B00" },
      "SecOps Engineer": { bg: "#f3e8ff", color: "#7c3aed" },
      "Catalog Lead": { bg: "#dbeafe", color: "#2563eb" },
      "Audio Curator": { bg: "#d1fae5", color: "#059669" },
      "Infrastructure Eng": { bg: "#fef3c7", color: "#d97706" },
    };

    setAdmins((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              role: nextRole,
              roleColor: roleColors[nextRole].color,
              avatarBg: roleColors[nextRole].bg,
              avatarColor: roleColors[nextRole].color,
            }
          : a
      )
    );
    showToast(`Updated role for ${name} to ${nextRole}.`);
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesFilter =
      adminRoleFilter === "all" || admin.role.toLowerCase().includes(adminRoleFilter.toLowerCase());
    const matchesSearch =
      admin.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      admin.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
      admin.scope.toLowerCase().includes(adminSearch.toLowerCase()) ||
      admin.role.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchLiveStorage(), fetchCatalogSongs()]);
    setIsRefreshing(false);
    showToast("Live storage metrics and MongoDB catalog tracks updated.");
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

  const handlePublish = async () => {
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trackTitle,
          artist: [primaryArtist],
          album: albumCollection,
          duration: 278,
          audio_url: "https://s3.eu-central-003.backblazeb2.com/tunedin/masters/audio.flac",
          audio_Id: `b2://tunedin-audio/2025/tr-${Math.floor(1000 + Math.random() * 9000)}.flac`,
          poster_url: artworkUrl,
          poster_Id: `poster_${Date.now()}`,
          genre: activeTags,
          plays: 0,
          likes: 0,
          aiObservation: { badge: "NEW", isrc },
          verificationStatus: "verified",
          verified: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCatalogSongs();
        showToast(`Master "${trackTitle}" published to MongoDB catalog!`);
      } else {
        showToast(data.error || "Failed to publish master track.");
      }
    } catch {
      showToast("Error connecting to catalog API.");
    }
  };

  const handleDeleteTrack = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/songs?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTracks((prev) => prev.filter((t) => t.id !== id));
        showToast(`Archived "${name}" from MongoDB catalog.`);
        fetchCatalogSongs();
      } else {
        setTracks((prev) => prev.filter((t) => t.id !== id));
        showToast(`Archived "${name}" from local view.`);
      }
    } catch {
      setTracks((prev) => prev.filter((t) => t.id !== id));
      showToast(`Archived "${name}" from catalog.`);
    }
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
      track.storageKey.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  // Authentication Gate Check
  if (status === "loading") {
    return (
      <div className={styles.authGateContainer}>
        <div className={styles.authGateCard}>
          <div className={styles.authGateSpinner} />
          <p className={styles.authGateLoadingText}>Verifying administrator session...</p>
        </div>
      </div>
    );
  }

  // Not Logged In View
  if (status === "unauthenticated" || !session) {
    return (
      <div className={styles.authGateContainer}>
        <div className={styles.authGateAmbient1} aria-hidden="true" />
        <div className={styles.authGateAmbient2} aria-hidden="true" />

        <div className={styles.authGateCard}>
          <div className={styles.authGateIconWrap}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "38px", color: "var(--primary, #A03B00)" }}
            >
              lock
            </span>
          </div>

          <div className={styles.authGateBadge}>
            <span className={styles.authGateBadgeDot} />
            <span>Access Restricted • Session Inactive</span>
          </div>

          <h1 className={styles.authGateTitle}>You Are Not Logged In</h1>

          <p className={styles.authGateDesc}>
            The <strong>TunedIn Admin Console</strong> is strictly restricted to authorized administrators.
            Please sign in with your verified credentials to access audio ingestion,
            catalog management, and master storage configurations.
          </p>

          <div className={styles.authGateActions}>
            <Link href="/login" className={styles.authGatePrimaryBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                login
              </span>
              <span>Go to Admin Login</span>
            </Link>
          </div>

          <div className={styles.authGateFooter}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#8d7166" }}>
              shield
            </span>
            <span>Zero-Trust Security • Protected by NextAuth &amp; Google OAuth</span>
          </div>
        </div>
      </div>
    );
  }

  const authenticatedUsername =
    (session.user as { username?: string })?.username ||
    session.user?.name ||
    "Admin";
  const authenticatedRole =
    (session.user as { role?: string })?.role || "Admin";
  const avatarLetter = authenticatedUsername[0]?.toUpperCase() || "A";

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
                className={`${styles.navItem} ${activeNav === "admin-panel" ? styles.navItemActive : ""}`}
                onClick={() => setActiveNav("admin-panel")}
              >
                <span className={`material-symbols-outlined ${styles.navItemIcon}`}>admin_panel_settings</span>
                <span>Admin Panel</span>
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
                <div className={styles.userAvatar}>{avatarLetter}</div>
                <span className={styles.statusIndicator} title="Online" />
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userNameRow}>
                  <span className={styles.userName}>{authenticatedUsername}</span>
                  <span
                    className={styles.userRoleBadge}
                    onClick={() => setActiveNav("admin-panel")}
                    title="Open Admin Panel"
                    style={{ cursor: "pointer" }}
                  >
                    {authenticatedRole}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={styles.logoutBtn}
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
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
              placeholder={
                activeNav === "admin-panel"
                  ? "Search administrators, access scopes, or audit trail..."
                  : "Search catalog, artists, ISRCs, or storage keys..."
              }
              value={activeNav === "admin-panel" ? adminSearch : searchQuery}
              onChange={(e) =>
                activeNav === "admin-panel"
                  ? setAdminSearch(e.target.value)
                  : setSearchQuery(e.target.value)
              }
            />
            <div className={styles.searchShortcut}>
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>

          <div className={styles.headerRightActions}>
            <div className={styles.headerStatusBadge}>
              <span className={styles.headerStatusDot}></span>
              <span>{activeNav === "admin-panel" ? "Admin Security Active" : "Live System"}</span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className={styles.mainContainer}>
          {/* Ambient Decorative Glows */}
          <div className={styles.ambientGlow1} aria-hidden="true" />
          <div className={styles.ambientGlow2} aria-hidden="true" />

          {activeNav === "admin-panel" ? (
            <div className={styles.adminPanelWrap}>
              {/* Telemetry Bar */}
              <div className={styles.adminTelemetryBar}>
                <div>
                  <h1 className={styles.pageTitle}>System Administration &amp; Access Control</h1>
                  <p className={styles.sectionSubtitle} style={{ marginTop: "4px" }}>
                    Manage administrative roles, zero-trust policies, and cryptographically verified audit records
                  </p>
                </div>
                <div className={styles.telemetryActions}>
                  <button
                    type="button"
                    className={styles.btnPublish}
                    onClick={() => setIsInviteModalOpen(true)}
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>Invite Administrator</span>
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => {
                      const dataStr =
                        "data:text/json;charset=utf-8," +
                        encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                      const downloadAnchor = document.createElement("a");
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute(
                        "download",
                        `tunedin_audit_log_${new Date().toISOString().slice(0, 10)}.json`
                      );
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      showToast("Exported JSON audit records successfully.");
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Export Audit Trail</span>
                  </button>
                </div>
              </div>

              {/* Admin Stat KPI Cards */}
              <div className={styles.adminStatsGrid}>
                {/* Stat 1: Total Admins */}
                <div className={styles.statCard}>
                  <div>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Active Administrators</span>
                      <span className={styles.statBadge}>
                        <span className="material-symbols-outlined text-[13px]">shield</span>
                        Zero-Trust
                      </span>
                    </div>
                    <div className={styles.statValueRow}>
                      <span className={styles.statValue}>{admins.length}</span>
                      <span className={styles.statUnit}>/ {admins.filter((a) => a.online).length} online</span>
                    </div>
                    <div className={styles.statCalloutRow}>
                      <span style={{ color: "#5f5e5e", fontWeight: 500 }}>MFA Enforcement</span>
                      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: "#059669" }}>100% Compliant</span>
                    </div>
                  </div>
                  <div className={styles.statFooter}>
                    <span>Role-Based Access Control</span>
                    <span style={{ fontWeight: 600, color: "#1b1c18" }}>5 Assigned Roles</span>
                  </div>
                </div>

                {/* Stat 2: Security Clearance */}
                <div className={styles.statCard}>
                  <div>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Security Posture</span>
                      <span className={styles.statBadgeAlt}>WebAuthn</span>
                    </div>
                    <div className={styles.statValueRow}>
                      <span className={styles.statValue}>Tier 1</span>
                    </div>
                    <div className={styles.statCalloutRow}>
                      <span style={{ color: "#5f5e5e", fontWeight: 500 }}>Passkey Verification</span>
                      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: "#1b1c18" }}>Hardware Token</span>
                    </div>
                  </div>
                  <div className={styles.statFooter}>
                    <span>Security Assertion Protocol</span>
                    <span style={{ color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                      Enforced
                    </span>
                  </div>
                </div>

                {/* Stat 3: B2 Storage Tokens */}
                <div className={styles.statCard}>
                  <div>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>B2 Storage Tokens</span>
                      <span className={styles.statBadgeAlt}>Backblaze B2</span>
                    </div>
                    <div className={styles.statValueRow}>
                      <span className={styles.statValue}>4</span>
                      <span className={styles.statUnit}>active keys</span>
                    </div>
                    <div className={styles.statCalloutRow}>
                      <span style={{ color: "#5f5e5e", fontWeight: 500 }}>Key Rotation Cycle</span>
                      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: "#1b1c18" }}>3 Days Ago</span>
                    </div>
                  </div>
                  <div className={styles.statFooter}>
                    <span>Master FLAC Write Lock</span>
                    <span style={{ fontWeight: 600, color: "#A03B00" }}>Dual Sign-Off</span>
                  </div>
                </div>

                {/* Stat 4: System Edge Latency */}
                <div className={styles.statCard}>
                  <div>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Edge Health &amp; Uptime</span>
                      <span className={styles.statBadge}>
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        99.99%
                      </span>
                    </div>
                    <div className={styles.statValueRow}>
                      <span className={styles.statValue}>22ms</span>
                      <span className={styles.statUnit}>avg latency</span>
                    </div>
                    <div className={styles.statCalloutRow}>
                      <span style={{ color: "#5f5e5e", fontWeight: 500 }}>Anomalous Access</span>
                      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: "#059669" }}>0 Detected</span>
                    </div>
                  </div>
                  <div className={styles.statFooter}>
                    <span>Global PoP Locations</span>
                    <span style={{ fontWeight: 600, color: "#1b1c18" }}>310 Cities Live</span>
                  </div>
                </div>
              </div>

              {/* SECTION: Administrators Management Table */}
              <div className={styles.adminCard}>
                <div className={styles.adminCardHeader}>
                  <div className={styles.sectionHeaderLeft}>
                    <div className={styles.sectionIconBadge}>
                      <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                    </div>
                    <div>
                      <h2 className={styles.sectionTitle}>Platform Administrators</h2>
                      <p className={styles.sectionSubtitle}>
                        Role allocations, hardware 2FA compliance, and delegated access permissions
                      </p>
                    </div>
                  </div>

                  <div className={styles.sectionHeaderRight}>
                    <div className={styles.autoSaveBadge}>
                      <span className={styles.autoSaveDot}></span>
                      <span>
                        Showing <strong style={{ color: "#1b1c18" }}>{filteredAdmins.length}</strong> of{" "}
                        <strong style={{ color: "#1b1c18" }}>{admins.length}</strong> admins
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div className={styles.adminFilterControls}>
                  <div className={styles.adminRoleTabs}>
                    {[
                      { key: "all", label: "All Roles" },
                      { key: "super admin", label: "Super Admin" },
                      { key: "secops", label: "SecOps" },
                      { key: "catalog", label: "Catalog Leads" },
                      { key: "curator", label: "Curators" },
                      { key: "infrastructure", label: "Infrastructure" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        className={`${styles.adminRoleTabBtn} ${adminRoleFilter === tab.key ? styles.adminRoleTabBtnActive : ""}`}
                        onClick={() => setAdminRoleFilter(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className={styles.adminSearchInputWrapper}>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: "#5f5e5e" }}>search</span>
                    <input
                      type="text"
                      className={styles.adminSearchInputField}
                      placeholder="Filter by name, email, or role..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                    />
                    {adminSearch && (
                      <button
                        type="button"
                        onClick={() => setAdminSearch("")}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#5f5e5e" }}
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className={styles.tableScrollWrapper}>
                  <table className={styles.catalogTable}>
                    <thead>
                      <tr className={styles.tableHeaderRow}>
                        <th className={styles.thCell} style={{ paddingLeft: "1.5rem" }}>Administrator</th>
                        <th className={styles.thCell}>Assigned Role</th>
                        <th className={styles.thCell}>Security (2FA)</th>
                        <th className={styles.thCell}>Delegated Privileges Scope</th>
                        <th className={styles.thCell}>Last Active</th>
                        <th className={styles.thCell} style={{ textAlign: "right", paddingRight: "1.5rem" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#5f5e5e" }}>
                            No administrators found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredAdmins.map((admin) => (
                          <tr key={admin.id} className={styles.tableBodyRow}>
                            <td className={styles.tdCell} style={{ paddingLeft: "1.5rem" }}>
                              <div className={styles.adminUserCell}>
                                <div
                                  className={styles.adminUserAvatar}
                                  style={{ backgroundColor: admin.avatarBg, color: admin.avatarColor, position: "relative" }}
                                >
                                  {admin.name.charAt(0)}
                                  {admin.online && (
                                    <span
                                      style={{
                                        position: "absolute",
                                        bottom: "-1px",
                                        right: "-1px",
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        backgroundColor: "#10b981",
                                        border: "1.5px solid #ffffff",
                                      }}
                                    />
                                  )}
                                </div>
                                <div>
                                  <div className={styles.adminUserName}>{admin.name}</div>
                                  <div className={styles.adminUserEmail}>{admin.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className={styles.tdCell}>
                              <span
                                className={styles.roleBadgePill}
                                style={{
                                  backgroundColor: admin.avatarBg,
                                  color: admin.roleColor,
                                  border: `1px solid ${admin.roleColor}40`,
                                }}
                              >
                                {admin.role}
                              </span>
                            </td>

                            <td className={styles.tdCell}>
                              {admin.mfaStatus === "Verified" ? (
                                <span className={styles.mfaBadgeVerified}>
                                  <span className="material-symbols-outlined text-[13px]">verified_user</span>
                                  2FA Enforced
                                </span>
                              ) : (
                                <span className={styles.mfaBadgePending}>
                                  <span className="material-symbols-outlined text-[13px]">pending</span>
                                  Pending Setup
                                </span>
                              )}
                            </td>

                            <td className={styles.tdCell} style={{ color: "#5f5e5e", fontSize: "13px" }}>
                              {admin.scope}
                            </td>

                            <td className={styles.tdCell} style={{ fontSize: "12px", color: "#5f5e5e", fontFamily: "Space Grotesk, sans-serif" }}>
                              {admin.lastActive}
                            </td>

                            <td className={styles.tdCell} style={{ textAlign: "right", paddingRight: "1.5rem" }}>
                              <div className={styles.rowActions}>
                                <button
                                  type="button"
                                  className={styles.rowActionBtn}
                                  title="Cycle / Reassign Role"
                                  onClick={() => handleCycleRole(admin.id, admin.role, admin.name)}
                                >
                                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                                </button>
                                <button
                                  type="button"
                                  className={styles.rowActionBtn}
                                  title="Send 2FA Reset Email"
                                  onClick={() => showToast(`Sent 2FA reset verification email to ${admin.email}.`)}
                                >
                                  <span className="material-symbols-outlined text-[18px]">key</span>
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.rowActionBtn} ${styles.rowActionBtnDanger}`}
                                  title="Revoke Admin Access"
                                  onClick={() => handleRevokeAdmin(admin.id, admin.name)}
                                >
                                  <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION: Security & System Policies */}
              <div className={styles.adminCard}>
                <div className={styles.adminCardHeader}>
                  <div className={styles.sectionHeaderLeft}>
                    <div className={styles.sectionIconBadge}>
                      <span className="material-symbols-outlined text-[20px]">security</span>
                    </div>
                    <div>
                      <h2 className={styles.sectionTitle}>Security Policies &amp; System Controls</h2>
                      <p className={styles.sectionSubtitle}>
                        Cryptographic enforcement, Backblaze B2 bucket protection, and multi-region CDN caching
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.policyGrid}>
                  {/* Policy 1 */}
                  <div className={styles.policyCard}>
                    <div>
                      <div className={styles.policyCardHeader}>
                        <h3 className={styles.policyCardTitle}>Strict WebAuthn / Passkeys</h3>
                        <label className={styles.switchLabel}>
                          <input
                            type="checkbox"
                            className={styles.switchInput}
                            checked={securityPolicies.strictMfa}
                            onChange={() => handleTogglePolicy("strictMfa", "Strict WebAuthn")}
                          />
                          <span className={styles.switchSlider}></span>
                        </label>
                      </div>
                      <p className={styles.policyCardDesc}>
                        Requires biometric authentication (TouchID, FaceID, or YubiKey) for all administrative sessions.
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: securityPolicies.strictMfa ? "#059669" : "#5f5e5e" }}>
                      {securityPolicies.strictMfa ? "Active Enforcement" : "Optional"}
                    </span>
                  </div>

                  {/* Policy 2 */}
                  <div className={styles.policyCard}>
                    <div>
                      <div className={styles.policyCardHeader}>
                        <h3 className={styles.policyCardTitle}>Master B2 Write Lock</h3>
                        <label className={styles.switchLabel}>
                          <input
                            type="checkbox"
                            className={styles.switchInput}
                            checked={securityPolicies.b2WriteLock}
                            onChange={() => handleTogglePolicy("b2WriteLock", "Master B2 Write Lock")}
                          />
                          <span className={styles.switchSlider}></span>
                        </label>
                      </div>
                      <p className={styles.policyCardDesc}>
                        Prevents unapproved deletion or replacement of studio lossless FLAC audio files in Backblaze B2 buckets.
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: securityPolicies.b2WriteLock ? "#A03B00" : "#5f5e5e" }}>
                      {securityPolicies.b2WriteLock ? "Dual Sign-Off Locked" : "Unlocked"}
                    </span>
                  </div>

                  {/* Policy 3 */}
                  <div className={styles.policyCard}>
                    <div>
                      <div className={styles.policyCardHeader}>
                        <h3 className={styles.policyCardTitle}>Live Edge Invalidation</h3>
                        <label className={styles.switchLabel}>
                          <input
                            type="checkbox"
                            className={styles.switchInput}
                            checked={securityPolicies.edgeInvalidation}
                            onChange={() => handleTogglePolicy("edgeInvalidation", "Live Edge Invalidation")}
                          />
                          <span className={styles.switchSlider}></span>
                        </label>
                      </div>
                      <p className={styles.policyCardDesc}>
                        Automatically purges CDN edge caches worldwide within 500ms of catalog and audio updates.
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: securityPolicies.edgeInvalidation ? "#059669" : "#5f5e5e" }}>
                      {securityPolicies.edgeInvalidation ? "Sub-second Sync Enabled" : "Manual Flush"}
                    </span>
                  </div>

                  {/* Policy 4 */}
                  <div className={styles.policyCard}>
                    <div>
                      <div className={styles.policyCardHeader}>
                        <h3 className={styles.policyCardTitle}>Encrypted DB Snapshots</h3>
                        <label className={styles.switchLabel}>
                          <input
                            type="checkbox"
                            className={styles.switchInput}
                            checked={securityPolicies.dbSnapshots}
                            onChange={() => handleTogglePolicy("dbSnapshots", "Encrypted DB Snapshots")}
                          />
                          <span className={styles.switchSlider}></span>
                        </label>
                      </div>
                      <p className={styles.policyCardDesc}>
                        Captures hourly Zstandard compressed and AES-256 encrypted database state snapshots.
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: securityPolicies.dbSnapshots ? "#059669" : "#5f5e5e" }}>
                      {securityPolicies.dbSnapshots ? "Hourly Automatic Backup" : "Disabled"}
                    </span>
                  </div>

                  {/* Policy 5 */}
                  <div className={styles.policyCard}>
                    <div>
                      <div className={styles.policyCardHeader}>
                        <h3 className={styles.policyCardTitle}>Public Maintenance Mode</h3>
                        <label className={styles.switchLabel}>
                          <input
                            type="checkbox"
                            className={styles.switchInput}
                            checked={securityPolicies.maintenanceMode}
                            onChange={() => handleTogglePolicy("maintenanceMode", "Maintenance Mode")}
                          />
                          <span className={styles.switchSlider}></span>
                        </label>
                      </div>
                      <p className={styles.policyCardDesc}>
                        Suspends public streaming client endpoints and returns HTTP 503 for all unauthenticated listener clients.
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: securityPolicies.maintenanceMode ? "#A03B00" : "#059669" }}>
                      {securityPolicies.maintenanceMode ? "System Paused (Maintenance)" : "Normal Operations"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: Live Security Audit Trail */}
              <div className={styles.adminCard}>
                <div className={styles.adminCardHeader}>
                  <div className={styles.sectionHeaderLeft}>
                    <div className={styles.sectionIconBadge}>
                      <span className="material-symbols-outlined text-[20px]">history</span>
                    </div>
                    <div>
                      <h2 className={styles.sectionTitle}>Live Security Audit Trail</h2>
                      <p className={styles.sectionSubtitle}>
                        Append-only cryptographic timeline of system configuration and administrative events
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.auditList}>
                  {auditLogs.map((log) => (
                    <div key={log.id} className={styles.auditItem}>
                      <div className={styles.auditItemLeft}>
                        <span className={styles.auditActorBadge}>{log.actor}</span>
                        <div>
                          <div className={styles.auditActionText}>{log.action}</div>
                          <div className={styles.auditTarget}>{log.target}</div>
                        </div>
                      </div>

                      <div className={styles.auditMetaRight}>
                        <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>{log.ip}</span>
                        <span>•</span>
                        <span>{log.time}</span>
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: log.status === "success" ? "#10b981" : "#A03B00",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
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
            {/* Card 1: Backblaze B2 Audio Storage */}
            <div className={styles.statCard}>
              <div>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Total Audio Uploads</span>
                  <span className={styles.statBadgeAlt}>
                    Backblaze B2 ({liveStorage?.backblaze.bucketName || "tunedIn"})
                  </span>
                </div>
                <div className={styles.statValueRow}>
                  <span className={styles.statValue}>
                    {liveStorage ? liveStorage.backblaze.formattedSize : "0.00 MB"}
                  </span>
                  <span className={styles.statUnit}>
                    / {liveStorage ? liveStorage.backblaze.freeTierFormatted : "10 GB"}
                  </span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{
                      width: `${liveStorage ? Math.max(0.5, Math.min(100, liveStorage.backblaze.percentUsed)) : 0.5}%`,
                    }}
                  />
                </div>
              </div>
              <div className={styles.statFooter}>
                <span>
                  {liveStorage
                    ? `${liveStorage.backblaze.fileCount} audio files (${liveStorage.backblaze.percentUsed}% pool)`
                    : "0 audio files stored"}
                </span>
                <span style={{ color: "#A03B00", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }}></span>
                  {liveStorage?.backblaze.region ? `${liveStorage.backblaze.region.toUpperCase()} • Live` : "B2 S3 Live"}
                </span>
              </div>
            </div>

            {/* Card 2: Poster CDN & Image Storage */}
            <div className={styles.statCard}>
              <div>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Poster CDN Bandwidth</span>
                  <span className={styles.statBadge}>
                    <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                    Cloudinary ({liveStorage?.cloudinary.plan || "Free"})
                  </span>
                </div>
                <div className={styles.statValueRow}>
                  <span className={styles.statValue}>
                    {liveStorage ? liveStorage.cloudinary.bandwidthFormatted : "177.53 MB"}
                  </span>
                </div>
                <div className={styles.statCalloutRow}>
                  <span style={{ color: "#5f5e5e", fontWeight: 500 }}>
                    Stored Artwork: {liveStorage ? liveStorage.cloudinary.storageFormatted : "12.64 MB"}
                  </span>
                  <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: "#1b1c18" }}>
                    {liveStorage ? `${liveStorage.cloudinary.objectsCount} assets` : "42 assets"}
                  </span>
                </div>
              </div>
              <div className={styles.statFooter}>
                <span>
                  {liveStorage
                    ? `${liveStorage.cloudinary.transformations} Transformations Executed`
                    : "Cloudinary Media Engine"}
                </span>
                <span style={{ fontWeight: 600, color: "#1b1c18" }}>
                  {liveStorage
                    ? `${liveStorage.cloudinary.creditsUsed} / ${liveStorage.cloudinary.creditsLimit} Credits (${liveStorage.cloudinary.creditsUsedPercent}%)`
                    : "Brotli WebP"}
                </span>
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
                    Package masters, spectral art tags, and Backblaze B2 pipeline metadata
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
                          Master Audio Engine • Direct Backblaze B2 Stream
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
                    {trackCounts.all.toLocaleString()}
                  </span>
                </button>

                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "processing" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("processing")}
                >
                  Pending Transcode
                  <span className={styles.tabCountPill}>{trackCounts.pending}</span>
                </button>

                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === "drafts" ? styles.tabBtnActive : ""}`}
                  onClick={() => setActiveTab("drafts")}
                >
                  Drafts
                  <span className={styles.tabCountPillAlt}>{trackCounts.drafts}</span>
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
                  onClick={() => {
                    setInspectingSong(null);
                    setShowRawJsonModal(true);
                  }}
                  title="Inspect Raw MongoDB Data (song.model.ts)"
                  style={{
                    backgroundColor: showRawJsonModal && !inspectingSong ? "#FFF2EB" : "#ffffff",
                    borderColor: showRawJsonModal && !inspectingSong ? "#A03B00" : "#E6E2DA",
                    color: showRawJsonModal && !inspectingSong ? "#A03B00" : "#5f5e5e",
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">data_object</span>
                  <span>Raw Data ({rawSongs.length || tracks.length})</span>
                </button>

                <button
                  type="button"
                  className={styles.exportBtn}
                  onClick={() => {
                    const dataToExport = rawSongs.length > 0 ? rawSongs : tracks;
                    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `tunedin-songs-raw-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast("Exported raw MongoDB catalog metadata to JSON format.");
                  }}
                  title="Export Raw JSON"
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
                    <th className={styles.thCell}>Backblaze B2 Key</th>
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
                            onClick={() => copyToClipboard(track.storageKey, "Backblaze B2 Key")}
                            title="Click to copy Backblaze B2 key"
                            style={{ cursor: "pointer" }}
                          >
                            {track.storageKey}
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
                              title="Inspect Raw MongoDB Document"
                              onClick={() => {
                                setInspectingSong(track.rawSong || track);
                                setShowRawJsonModal(true);
                              }}
                            >
                              <span className="material-symbols-outlined text-[18px]">data_object</span>
                            </button>
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
                Showing <strong style={{ color: "#1b1c18" }}>{filteredTracks.length > 0 ? 1 : 0}</strong> to{" "}
                <strong style={{ color: "#1b1c18" }}>{filteredTracks.length}</strong> of{" "}
                <strong style={{ color: "#1b1c18" }}>{trackCounts.all.toLocaleString()}</strong> master recordings
                {isLoadingTracks && (
                  <span style={{ marginLeft: "8px", fontSize: "12px", color: "#A03B00", fontWeight: 600 }}>
                    • Syncing with MongoDB...
                  </span>
                )}
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
            </>
          )}
        </main>
      </div>

      {/* Invite Administrator Modal */}
      {isInviteModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsInviteModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#A03B00" }}>person_add</span>
                <h3 className={styles.modalTitle}>Invite Platform Administrator</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsInviteModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteAdmin}>
              <div className={styles.modalBody}>
                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Full Name</label>
                  <input
                    type="text"
                    required
                    className={styles.textInput}
                    placeholder="e.g. Kai Sterling"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Internal Email</label>
                  <input
                    type="email"
                    required
                    className={styles.textInput}
                    placeholder="kai.s@tunedin.internal"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Administrative Role</label>
                  <select
                    className={styles.textInput}
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                  >
                    <option value="Super Admin">Super Admin (Full Root Clearance)</option>
                    <option value="SecOps Engineer">SecOps Engineer (Security &amp; Audit)</option>
                    <option value="Catalog Lead">Catalog Lead (Backblaze B2 &amp; Releases)</option>
                    <option value="Audio Curator">Audio Curator (Playlists &amp; Ingestion)</option>
                    <option value="Infrastructure Eng">Infrastructure Eng (CDN &amp; Transcoding)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.fieldLabel}>Delegated Access Scope (Optional)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    placeholder="e.g. European Edge Clusters &amp; Atmos Masters"
                    value={inviteScope}
                    onChange={(e) => setInviteScope(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPublish}>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Send Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raw MongoDB Song Data Inspection Modal */}
      {showRawJsonModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRawJsonModal(false)}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: "780px", maxHeight: "88vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#FFF2EB",
                    color: "#A03B00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">data_object</span>
                </div>
                <div>
                  <h3 className={styles.modalTitle}>
                    {inspectingSong
                      ? `Raw Document: ${inspectingSong.title}`
                      : "MongoDB Catalog Raw Data"}
                  </h3>
                  <p className={styles.modalSubtitle}>
                    Mongoose Schema: <code style={{ color: "#A03B00", fontWeight: 700 }}>Song</code> (models/song.model.ts) •{" "}
                    {inspectingSong ? "1 document" : `${rawSongs.length || tracks.length} documents fetched via /api/songs`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowRawJsonModal(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div
              style={{
                padding: "1rem 1.5rem",
                overflowY: "auto",
                flex: 1,
                backgroundColor: "#161614",
                borderRadius: "8px",
                margin: "1rem 1.5rem",
                border: "1px solid #2a2a26",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: "'Space Grotesk', monospace, Consolas",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  color: "#d4d4d0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(
                  inspectingSong || (rawSongs.length > 0 ? rawSongs : tracks),
                  null,
                  2
                )}
              </pre>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  const content = JSON.stringify(
                    inspectingSong || (rawSongs.length > 0 ? rawSongs : tracks),
                    null,
                    2
                  );
                  copyToClipboard(content, "Raw JSON");
                }}
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                <span>Copy JSON</span>
              </button>
              <button
                type="button"
                className={styles.btnPublish}
                onClick={() => setShowRawJsonModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
