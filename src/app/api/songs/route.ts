import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Song } from "../../../../models/song.model";
import { User } from "../../../../models/user.model";

// Seed songs matching the TunedIn Admin console catalog if the collection is empty
const INITIAL_SEED_TRACKS = [
  {
    title: "Midnight Reverie (VIP Mix)",
    album: "Echoes in Obsidian",
    artist: ["Aswin", "Kiasmos"],
    poster_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMahkNExERLuA_PCTQN9pyuiAwa9vKRWI4nmxTwOP0Be-6MnX6CDbEnxtkwAJf2WLYWWuDk0iMO1I5H_SaLbR2ZAJJGpBeZ4orUW6KELkwMm3SCpLm_QgnvgxT-4k4kbCY8oDOUTrc2L10DHfRW10sfwmxIpsRgqTTE9f28dQ9t4nmXKj26ElmRMoShspWoMIGzL6vb27H2-BAvLZMoPr2JG64VnO8Vs3CZcJ1lMoHl8iyoPAsAthW",
    poster_Id: "poster_tr_9812",
    audio_url: "https://s3.eu-central-003.backblazeb2.com/tunedin/2025/tr-9812.flac",
    audio_Id: "b2://tunedin-audio/2025/tr-9812.flac",
    duration: 252, // 04:12
    genre: ["Deep House", "Melodic Techno"],
    releasedDate: new Date("2025-01-15"),
    plays: 412890,
    likes: 18450,
    aiObservation: {
      vibe: "VIP Master",
      bpm: 124,
      spectralQuality: "Lossless 48kHz/24-bit FLAC",
      mood: "Atmospheric",
      badge: "VIP",
      isrc: "US-TUN-25-00491",
    },
    verificationStatus: "verified",
    verified: true,
    verificationDate: new Date("2025-01-16"),
  },
  {
    title: "Chronos Descent (Atmos Master)",
    album: "Spatial Horizons OST",
    artist: ["Max Richter", "Olafur"],
    poster_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAo4tkL5aSmkFp4UEVu43LSbaqMZdarbt7DsGxONqM9ZOm7S2YOuXkkT5TtKNLOC4oYcW61Mp_WtITsIrMcThehmaQyXEBd_CT3si9yy36ge3pROzwJSftsJW6f1DlA4S7wbycaNeD89M5arPCSxQc2cy7g6sqTR7rEQ-Pdv1DpbJhqGdW5Vfj7xida3bRc4FDlVq5-jJCHFZpI4cTLVgEekh8abxMeoqqATeu0Yc746OxCMP6bKgog",
    poster_Id: "poster_tr_9804",
    audio_url: "https://s3.eu-central-003.backblazeb2.com/tunedin/2025/tr-9804.mp3",
    audio_Id: "b2://tunedin-audio/2025/tr-9804.mp3",
    duration: 408, // 06:48
    genre: ["Classical Crossover", "Ambient"],
    releasedDate: new Date("2025-02-01"),
    plays: 284110,
    likes: 14220,
    aiObservation: {
      vibe: "Spatial Soundscape",
      bpm: 98,
      spectralQuality: "Dolby Atmos 7.1.4 Bed",
      mood: "Cinematic",
      badge: "ATMOS",
      isrc: "DE-TUN-25-00104",
    },
    verificationStatus: "verified",
    verified: true,
    verificationDate: new Date("2025-02-02"),
  },
  {
    title: "Solitude in F Minor",
    album: "The Solitary Architect",
    artist: ["Nils Frahm Ensemble"],
    poster_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDu1Ad2G3mtCtKwI_McMSCx7dT4evys6R06tq-Lx4nacgqqLbytDzh3lm52g9gMnPK0r6sMWprwz3Q04fo_2AUhLLo6TWAK82f3d8Qea8htfZlQ4B6qHO9qlUwHYS49PcPvmKS8ZXN5wmUZJkVML678GIdL3_kbsvKhGyTtDivhHpdMoGlzbkx4n_518931u16RHZQoFpPjLtAyI1IPBoKqmmiN--XwCOAGXcEovrmOtFZmxnAHo4YB",
    poster_Id: "poster_tr_9799",
    audio_url: "https://s3.eu-central-003.backblazeb2.com/tunedin/2025/tr-9799.flac",
    audio_Id: "b2://tunedin-audio/2025/tr-9799.flac",
    duration: 322, // 05:22
    genre: ["Neoclassical", "Minimalist"],
    releasedDate: new Date("2025-02-18"),
    plays: 19420,
    likes: 1200,
    aiObservation: {
      vibe: "Acoustic Piano Reverb",
      bpm: 76,
      spectralQuality: "Transcode queue: 84% complete",
      mood: "Melancholic",
      isrc: "UK-TUN-25-09823",
    },
    verificationStatus: "pending",
    verified: false,
    verificationDate: new Date(),
  },
  {
    title: "Sub-Orbital Drift",
    album: "Singularity Resonances",
    artist: ["Jon Hopkins", "Tycho"],
    poster_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcv4YHS-dDsuuLooV8r9plcG24mhNC8pG1YmXDv654IIZXQ-Gvfi8oUBIVs-mYKk-odBdIncm8Uz1623N5ZewyKZ4KI4x36rO9OyRTg3gMDXFMsLDj_uQkQsV0-mWfrftTSOeiWNaAxNfWYN2eFoVshujhMhq0do80w9KEjZ7iePgOnO94HCEcXOU2Ryer4oXFczEgoE_nJs4Bt9dr0jrSVnoLeUwENTqhi8QOBdSZYmuFAtpF42Jm",
    poster_Id: "poster_tr_9712",
    audio_url: "https://s3.eu-central-003.backblazeb2.com/tunedin/2025/tr-9712.flac",
    audio_Id: "b2://tunedin-audio/2025/tr-9712.flac",
    duration: 435, // 07:15
    genre: ["Ambient Downtempo", "Electronica"],
    releasedDate: new Date("2025-03-02"),
    plays: 670450,
    likes: 31200,
    aiObservation: {
      vibe: "Cosmic Drone",
      bpm: 110,
      spectralQuality: "FLAC 96kHz High-Res",
      mood: "Expansive",
      isrc: "US-TUN-25-00388",
    },
    verificationStatus: "verified",
    verified: true,
    verificationDate: new Date("2025-03-03"),
  },
  {
    title: "Hyperline Vector 86",
    album: "Neon Overdrive",
    artist: ["GUNSHIP", "Kavinsky"],
    poster_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFT9K1kakYB6LH35QbHvvAMuGXdP9uZUlVB8Sh8iI5BuDtT-Iqxra82nd89CJaxRbWwGczgr4bYt_9DgRnvOmoNmQ6Jnvt5n0w2iMTuJwaqUOzubQKPeUl_QSYNPdpiofszXW3BO8UEy6zoQbbTT8uFJgqNXFklbfylZoUQDQKmc00cPgM6Qn2fz8N2jhvOrFtforHx2ZRN1_V0AqWlCuwjP6p9YoaVoE89UjrIfd23XXaDYII9I_f",
    poster_Id: "poster_tr_9642",
    audio_url: "https://s3.eu-central-003.backblazeb2.com/tunedin/2025/tr-9642.flac",
    audio_Id: "b2://tunedin-audio/2025/tr-9642.flac",
    duration: 229, // 03:49
    genre: ["Synthwave", "Darksynth"],
    releasedDate: new Date("2025-03-10"),
    plays: 1124000,
    likes: 54100,
    aiObservation: {
      vibe: "Retro Wave",
      bpm: 130,
      spectralQuality: "Master Audio 24-bit",
      mood: "High Octane",
      isrc: "FR-TUN-25-00812",
    },
    verificationStatus: "verified",
    verified: true,
    verificationDate: new Date("2025-03-11"),
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-seed initial catalog tracks if database has no songs yet
    const existingCount = await Song.countDocuments();
    if (existingCount === 0) {
      let defaultUser = await User.findOne();
      if (!defaultUser) {
        defaultUser = await User.create({
          username: "admin_catalog",
          email: "catalog@tunedin.internal",
          role: "admin",
          verified: true,
        });
      }

      const seedDocs = INITIAL_SEED_TRACKS.map((track) => ({
        ...track,
        uploadUser: defaultUser._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await Song.insertMany(seedDocs);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim().toLowerCase() || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    // Filter query builder
    const filter: Record<string, any> = {};

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { title: searchRegex },
        { album: searchRegex },
        { artist: searchRegex },
        { audio_Id: searchRegex },
        { "aiObservation.isrc": searchRegex },
      ];
    }

    if (status === "processing" || status === "pending") {
      filter.verificationStatus = "pending";
    } else if (status === "drafts" || status === "draft" || status === "rejected") {
      filter.verificationStatus = "rejected";
    } else if (status === "live" || status === "verified") {
      filter.verificationStatus = "verified";
    }

    // Counts for tabs
    const [allCount, pendingCount, draftsCount, verifiedCount, totalFiltered, songs] =
      await Promise.all([
        Song.countDocuments(),
        Song.countDocuments({ verificationStatus: "pending" }),
        Song.countDocuments({ verificationStatus: "rejected" }),
        Song.countDocuments({ verificationStatus: "verified" }),
        Song.countDocuments(filter),
        Song.find(filter)
          .populate("uploadUser", "username email role")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

    return NextResponse.json(
      {
        success: true,
        songs,
        pagination: {
          total: totalFiltered,
          page,
          limit,
          totalPages: Math.ceil(totalFiltered / limit) || 1,
        },
        counts: {
          all: allCount,
          pending: pendingCount,
          drafts: draftsCount,
          verified: verifiedCount,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in GET /api/songs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch songs: " + message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        username: "admin_catalog",
        email: "catalog@tunedin.internal",
        role: "admin",
        verified: true,
      });
    }

    const newSong = await Song.create({
      title: body.title || "Untitled Master",
      album: body.album || "Single",
      artist: Array.isArray(body.artist) ? body.artist : [body.artist || "Unknown Artist"],
      poster_url: body.poster_url || "",
      poster_Id: body.poster_Id || `poster_${Date.now()}`,
      audio_url: body.audio_url || "",
      audio_Id: body.audio_Id || `b2://tunedin-audio/2025/tr-${Date.now()}.flac`,
      duration: Number(body.duration) || 180,
      genre: Array.isArray(body.genre) ? body.genre : [body.genre || "Electronic"],
      uploadUser: body.uploadUser || user._id,
      releasedDate: body.releasedDate ? new Date(body.releasedDate) : new Date(),
      plays: Number(body.plays) || 0,
      likes: Number(body.likes) || 0,
      aiObservation: body.aiObservation || { vibe: "Freshly Ingested" },
      verificationStatus: body.verificationStatus || "verified",
      verified: body.verified !== undefined ? body.verified : true,
      verificationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Song registered successfully in catalog.",
        song: newSong,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in POST /api/songs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create song: " + message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required song ID" },
        { status: 400 }
      );
    }

    const deleted = await Song.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Song not found with given ID" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Song successfully removed from catalog database.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in DELETE /api/songs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete song: " + message },
      { status: 500 }
    );
  }
}
