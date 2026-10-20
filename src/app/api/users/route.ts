import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, IUser } from "../../../../models/user.model";

// Initial seed admins if collection is completely fresh
const INITIAL_SEED_ADMINS = [
  {
    username: "Aswin",
    email: "aswin@tunedin.internal",
    role: "Super Admin",
    scope: "Full Root & Infrastructure Access",
    verified: true,
  },
  {
    username: "Elena Vance",
    email: "elena.v@tunedin.internal",
    role: "SecOps Engineer",
    scope: "Security Policies & WebAuthn Audit",
    verified: true,
  },
  {
    username: "Marcus Thorne",
    email: "marcus.t@tunedin.internal",
    role: "Catalog Lead",
    scope: "Cloudinary & Release Metadata",
    verified: true,
  },
  {
    username: "Sarah Jenkins",
    email: "sarah.j@tunedin.internal",
    role: "Audio Curator",
    scope: "Playlists Curation & Quality Review",
    verified: true,
  },
  {
    username: "David Chen",
    email: "d.chen@tunedin.internal",
    role: "Infrastructure Eng",
    scope: "Transcoding Pipeline & Edge CDN Nodes",
    verified: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "all";

    // Check count and seed if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      for (const seed of INITIAL_SEED_ADMINS) {
        await User.create({
          ...seed,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const filter: Record<string, any> = {};

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { role: searchRegex },
        { scope: searchRegex },
      ];
    }

    if (role && role !== "all") {
      const roleRegex = new RegExp(role.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.role = roleRegex;
    }

    const users = await User.find(filter)
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        users,
        total: users.length,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users from database: " + message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const username = (body.username || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const role = body.role || "Audio Curator";
    const scope = (body.scope || "").trim();
    const verified = body.verified !== undefined ? Boolean(body.verified) : false;

    if (!username || !email) {
      return NextResponse.json(
        { success: false, error: "Username and email are required." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An administrator with this email or username already exists." },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      username,
      email,
      role,
      scope: scope || "Standard Administrative Access",
      verified,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Administrator "${username}" invited successfully.`,
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create administrator: " + message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, role, verified, username, scope } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required administrator ID." },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Administrator not found in database." },
        { status: 404 }
      );
    }

    if (role !== undefined) user.role = role;
    if (verified !== undefined) user.verified = Boolean(verified);
    if (username !== undefined && username.trim().length > 0) user.username = username.trim();
    if (scope !== undefined) user.scope = scope.trim();
    user.updatedAt = new Date();

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `Administrator "${user.username}" updated successfully.`,
        user,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in PATCH /api/users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update administrator: " + message },
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
        { success: false, error: "Missing required administrator ID." },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Administrator not found in database." },
        { status: 404 }
      );
    }

    if (user.username === "Aswin" && user.role === "Super Admin") {
      return NextResponse.json(
        { success: false, error: "Cannot revoke primary Super Administrator." },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: `Administrator "${user.username}" privileges revoked.`,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in DELETE /api/users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete administrator: " + message },
      { status: 500 }
    );
  }
}
