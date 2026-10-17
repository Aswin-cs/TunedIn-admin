# 🎛️ TunedIn Admin Console

> **Audio Operations, Catalog Ingestion & System Administration Studio**  
> Part of the **TunedIn** music streaming ecosystem.

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.1-green?logo=mongodb)
![NextAuth](https://img.shields.io/badge/NextAuth.js-4.24-purple?logo=nextdotjs)
![Port](https://img.shields.io/badge/Port-3001-orange)

---

## 📖 Overview

The **TunedIn Admin Console** is a high-performance, editorial-grade administration dashboard and audio ingestion suite designed for managing the **TunedIn** streaming platform. Rejecting generic dark-mode tropes, TunedIn implements a warm, daylight-infused studio aesthetic ("TunedIn Light") reminiscent of boutique vinyl listening rooms and precision master hardware.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Mongoose**, and **NextAuth.js**, the console allows administrators to stage lossless master audio, analyze chroma swatches, inspect real-time waveforms via Web Audio API, administer zero-trust security policies, manage RBAC privileges, and track edge delivery telemetry across Cloudflare R2 and CDN networks.

---

## ✨ Features

### 1. 🎵 Release & Asset Ingestion Studio
- **Master Artwork Canvas**: High-resolution 1:1 artwork dropzone with instant preview and interactive URL replacement.
- **Chroma Palette Extraction**: Automatic extraction and one-click clipboard copying of Dominant (`#F26419`), Vibrant (`#E88C2B`), and Muted (`#8D7166`) accent hex swatches.
- **Master Metadata Staging**: Track title, primary artists, album release, ISRC code, and dynamic genre/spectral vibe tags.
- **Cloudflare R2 Staging Key**: Previews assigned lossless FLAC object keys (e.g., `r2://masters/2025/...`).

### 2. 🎚️ Lossless Audio Synthesis & Waveform Transport
- **Web Audio API Synthesizer**: Built-in harmonic chord synthesizer (F minor 9: F3, Ab3, C4, Eb4, G4) providing instantaneous acoustic preview without requiring external media assets.
- **55-Bar Frequency Waveform**: Interactive responsive canvas reflecting playback progress with click-to-seek scrub controls.
- **Precision Transport Controls**: Play/pause, ±10s seeking, looping toggle, and speed adjustment (0.8x, 1.0x, 1.25x, 1.5x).
- **Master Volume & Muting**: Smooth-ramping audio gain control with real-time percentage feedback.

### 3. 📚 Music Catalog Data Grid
- **Search & Categorization**: Real-time filtering across titles, artists, ISRCs, and R2 storage keys.
- **Category Tabs**: Filter between *All Tracks*, *Pending Transcode*, and *Drafts*.
- **Row Actions**: One-click stream telemetry viewing, metadata editing in the ingestion studio, ISRC/key copying, and master archiving.
- **Batch Operations**: Bulk selection checkboxes with catalog export (JSON/CSV).
- **Tabular Data Navigation**: Pagination controls with record range indicators.

### 4. 🛡️ System Administration & Access Control (RBAC)
- **Zero-Trust Role Hierarchy**: Support for 5 specialized console roles:
  - `Super Admin` (Full root & infrastructure clearance)
  - `SecOps Engineer` (Security policies & WebAuthn audit)
  - `Catalog Lead` (Cloudflare R2 & release metadata)
  - `Audio Curator` (Playlists curation & quality review)
  - `Infrastructure Eng` (Transcoding pipeline & edge CDN nodes)
- **Administrator Invitations**: Modal interface for inviting team members with internal email validation and delegated access scopes.
- **Role Re-assignment & Revocation**: Instant cycling through role permissions and console access revocation.
- **Configurable Security Policies**:
  - Strict Hardware MFA / WebAuthn
  - Cloudflare R2 Master Write-Lock
  - Global Edge CDN Cache Purge on publish
  - Hourly AES-256 Encrypted Database Snapshots
  - Public Maintenance Mode toggle (HTTP 503 fallback for listener clients)
- **Live Security Audit Trail**: Append-only cryptographic log recording actor, IP, timestamp, action, and target, with one-click JSON export.

### 5. 🔐 Authentication & Onboarding
- **Google OAuth via NextAuth.js**: Secure sign-in integrated with Google Cloud Console credentials.
- **Two-Step Onboarding & Username Reservation**:
  - Debounced username availability validation (`/api/auth/check-username`).
  - Strict Zod schema checking (3–20 characters, alphanumeric + underscore).
  - Secure temporary HTTP-only/Lax cookie bridge (`pending_admin_username`) ensuring usernames are validated before completing OAuth account provisioning.
- **Session Enrichment**: Custom JWT callbacks attaching user ID, username, database role, and verification status directly into the NextAuth session.

---

## 🎨 Design Philosophy & Aesthetics

The UI adheres to the design specification documented in [`design.md`](file:///e:/New%20folder/java/NEW%20PROJECT/spotify%20clone/admin/design.md):
- **Base Canvas**: Warm Linen (`#FBF9F3` / `#F8F6F0`) creating visual depth through tactile milk-white cards rather than harsh dark-mode panels.
- **Accent**: Sunburst Orange (`#F26419` / `#A03B00`) for active kinetic states, play controls, and primary CTAs.
- **Typography**: Architectural **Space Grotesk** for display headlines, coupled with high-legibility **Hanken Grotesk** and **Geist** for tabular data and metadata.
- **Elevation**: Amber-sand tinted ambient shadows (`rgba(60, 45, 20, ...)`) paired with crisp Sand structural borders (`#E6E2DA`).

---

## 🏗️ Architecture & Project Structure

```text
admin/
├── models/                         # Mongoose Database Models
│   ├── playlist.model.ts           # Playlist schema (owner, songs, image, duration)
│   ├── song.model.ts               # Song schema (audio/poster URLs, ISRC, AI observation)
│   └── user.model.ts               # User schema (username, email, role, verified)
├── public/                         # Static Assets & SVGs
│   └── music-logo-orbit.svg        # TunedIn brand mark
├── src/
│   ├── app/
│   │   ├── api/auth/
│   │   │   ├── [...nextauth]/      # NextAuth.js API route handler
│   │   │   ├── check-username/     # Real-time username availability endpoint
│   │   │   ├── register-user/      # Admin user registration endpoint
│   │   │   └── set-username/       # Cookie-bridged username reservation endpoint
│   │   ├── login/                  # Two-step Admin Login & Registration page
│   │   │   ├── login.module.css    # Scoped styles for authentication UI
│   │   │   └── page.tsx            # Login form with debounced validation
│   │   ├── globals.css             # Root CSS tokens, fonts & resets
│   │   ├── layout.tsx              # Root HTML shell & AuthProvider wrapper
│   │   ├── page.module.css         # Scoped styling for the main dashboard
│   │   └── page.tsx                # Unified Admin Console & Ingestion Studio
│   ├── components/
│   │   └── AuthProvider.tsx        # NextAuth SessionProvider client wrapper
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth options, Google provider & callbacks
│   │   ├── db.ts                   # Cached singleton MongoDB Mongoose client
│   │   └── validations/
│   │       └── user.ts             # Zod validation schemas for usernames
│   └── types/
│       └── next-auth.d.ts          # Extended NextAuth session & JWT typings
├── .env.example                    # Environment variables template
├── design.md                       # Design system token specifications
├── next.config.ts                  # Next.js build configuration
├── package.json                    # Project dependencies & scripts
└── tsconfig.json                   # TypeScript compiler configuration
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/) |
| **Authentication** | [NextAuth.js 4](https://next-auth.js.org/) (Google OAuth Provider) |
| **Validation** | [Zod 4](https://zod.dev/) |
| **Audio Processing** | Web Audio API (Multi-Oscillator AudioContext Synthesis) |
| **Styling** | Vanilla CSS Modules with custom design tokens |
| **Debounce** | `use-debounce` |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally or a MongoDB Atlas URI
- A Google Cloud Project with OAuth 2.0 Credentials configured

### 1. Installation

Clone or navigate to the admin repository directory:

```bash
cd admin
npm install
```

### 2. Environment Configuration

Copy the example environment file to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:

```env
# MongoDB Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/spotify_admin

# NextAuth Settings (Console runs on port 3001)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=tunedin_spotify_admin_nextauth_super_secret_key_12345

# Google OAuth Credentials
# In Google Cloud Console, add Authorized redirect URI:
# http://localhost:3001/api/auth/callback/google
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select your project.
3. Under **APIs & Services** > **Credentials**, create an **OAuth 2.0 Client ID** (Web application).
4. Add the following to **Authorized redirect URIs**:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
5. Copy the Client ID and Client Secret into your `.env.local`.

### 4. Running the Development Server

Start the development server (configured to bind to port **3001**):

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3001
```

- **Dashboard**: `http://localhost:3001/`
- **Login / Onboarding**: `http://localhost:3001/login`

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | `GET`, `POST` | NextAuth.js OAuth callback & session routes |
| `/api/auth/check-username` | `GET` | Validates username against Zod rules and checks MongoDB uniqueness (case-insensitive) |
| `/api/auth/set-username` | `POST` | Sets a validated username into a 15-minute HTTP-only cookie before Google OAuth redirection |
| `/api/auth/register-user` | `POST` | Direct profile registration/synchronization endpoint |

---

## 🗄️ Database Schemas

### `User` (`models/user.model.ts`)
```typescript
{
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  role: { type: String, enum: ["admin", "subadmin", "editor"], default: "subadmin" },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### `Song` (`models/song.model.ts`)
```typescript
{
  title: String,
  album: String,
  artist: [String],
  poster_url: String,
  audio_url: String,
  duration: Number,
  genre: [String],
  uploadUser: ObjectId (ref: "User"),
  releasedDate: Date,
  plays: Number,
  likes: Number,
  aiObservation: Object,
  verificationStatus: "pending" | "verified" | "rejected",
  verified: Boolean,
  verificationDate: Date
}
```

### `Playlist` (`models/playlist.model.ts`)
```typescript
{
  name: String,
  description: String,
  image: String,
  owner: ObjectId (ref: "User"),
  songs: [ObjectId (ref: "Song")],
  totalDuration: Number,
  isPublic: Boolean,
  timestamps: true
}
```

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts development server on port 3001 (`next dev -p 3001`) |
| `npm run build` | Compiles production application bundle (`next build`) |
| `npm run start` | Runs production server on port 3001 (`next start -p 3001`) |
| `npm run lint` | Runs ESLint syntax and code quality checks (`eslint`) |

---

## 📄 License

This project is proprietary and confidential. Developed as part of the **TunedIn / Spotify Clone** ecosystem.
