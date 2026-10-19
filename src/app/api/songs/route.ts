import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Song } from "../../../../models/song.model";
import { User } from "../../../../models/user.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

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
