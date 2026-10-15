import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "../../../../../models/user.model";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email } = body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Update the username if already registered
      user.username = trimmedUsername;
      user.updatedAt = new Date();
      await user.save();
    } else {
      // Create new user with schema defaults (role: 'subadmin', verified: false)
      user = await User.create({
        username: trimmedUsername,
        email: normalizedEmail,
        // Role is deliberately omitted from form inputs as requested; defaults to 'subadmin'
        role: "subadmin",
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile verified. You can now complete Google OAuth authentication.",
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in register-user API:", error);
    return NextResponse.json(
      { error: "Failed to initialize profile. " + errorMessage },
      { status: 500 }
    );
  }
}
