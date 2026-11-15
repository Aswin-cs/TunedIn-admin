import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Playlist } from "../../../../models/playlist.model";
import { User } from "../../../../models/user.model";

interface PopulatedPlaylist {
  _id: { toString(): string };
  name: string;
  description?: string;
  image?: string;
  totalDuration?: number;
  isPublic?: boolean;
  songs?: unknown[];
  owner?: { username?: string };
  updatedAt?: string | Date;
}

const DEFAULT_CURATED_PLAYLISTS = [
  {
    _id: "pl-curated-1",
    name: "TunedIn Studio Master Sessions",
    description: "Lossless 48kHz studio masters, acoustic deep dives, and analog tape recordings.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    totalDuration: 1840,
    isPublic: true,
    songsCount: 8,
    category: "Editorial",
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "pl-curated-2",
    name: "Late Night Vinyl Minimal",
    description: "Warm linen analog textures, ambient sub-bass, and melodic chords for deep focus.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    totalDuration: 2420,
    isPublic: true,
    songsCount: 12,
    category: "Ambient",
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    _id: "pl-curated-3",
    name: "Sunburst Electronic & Melodic",
    description: "Peak-hour energetic electronica, progressive builds, and melodic synth wave.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    totalDuration: 1980,
    isPublic: true,
    songsCount: 9,
    category: "Electronic",
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: "pl-curated-4",
    name: "Acoustic Clarity & High Fidelity",
    description: "Pristine acoustic guitars, studio vocals, and unprocessed dynamic range audio.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80",
    totalDuration: 1650,
    isPublic: false,
    songsCount: 6,
    category: "Acoustic",
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export async function GET(_req: NextRequest) {
  try {
    await connectDB();
    const playlists = await Playlist.find()
      .populate("owner", "username email")
      .populate("songs", "title artist poster_url duration")
      .sort({ updatedAt: -1 })
      .lean();

    if (!playlists || playlists.length === 0) {
      return NextResponse.json({
        success: true,
        playlists: DEFAULT_CURATED_PLAYLISTS,
        total: DEFAULT_CURATED_PLAYLISTS.length,
        isFallback: true,
      });
    }

    const formatted = (playlists as unknown as PopulatedPlaylist[]).map((pl) => ({
      _id: pl._id.toString(),
      name: pl.name,
      description: pl.description || "TunedIn Curated Playlist",
      image: pl.image || DEFAULT_CURATED_PLAYLISTS[0].image,
      totalDuration: pl.totalDuration || 0,
      isPublic: pl.isPublic !== false,
      songsCount: Array.isArray(pl.songs) ? pl.songs.length : 0,
      songs: pl.songs || [],
      owner: pl.owner ? pl.owner.username : "TunedIn Editorial",
      updatedAt: pl.updatedAt ? new Date(pl.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      playlists: formatted,
      total: formatted.length,
      isFallback: false,
    });
  } catch (error: unknown) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json({
      success: true,
      playlists: DEFAULT_CURATED_PLAYLISTS,
      total: DEFAULT_CURATED_PLAYLISTS.length,
      isFallback: true,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, description, image, isPublic } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: "Playlist name is required." }, { status: 400 });
    }

    // Find any admin or fallback user for owner
    let ownerUser = await User.findOne({ role: "admin" });
    if (!ownerUser) {
      ownerUser = await User.findOne();
    }

    const newPlaylist = await Playlist.create({
      name: name.trim(),
      description: description?.trim() || "Editorial playlist collection",
      image: image?.trim() || DEFAULT_CURATED_PLAYLISTS[0].image,
      owner: ownerUser?._id,
      songs: [],
      totalDuration: 0,
      isPublic: isPublic !== false,
    });

    return NextResponse.json({
      success: true,
      message: "Playlist created successfully.",
      playlist: newPlaylist,
    });
  } catch (error: unknown) {
    console.error("Error creating playlist:", error);
    const message = error instanceof Error ? error.message : "Failed to create playlist.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
