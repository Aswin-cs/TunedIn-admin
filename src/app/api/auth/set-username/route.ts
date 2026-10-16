import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "../../../../../models/user.model";
import { setUsernameSchema } from "@/lib/validations/user";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate body using Zod
    const validationResult = setUsernameSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg =
        validationResult.error.issues[0]?.message || "Invalid username format.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { username: validatedUsername } = validationResult.data;

    // Connect DB and verify username is not already taken
    await connectDB();
    const escapedUsername = validatedUsername.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${escapedUsername}$`, "i") },
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken. Please choose a different one." },
        { status: 409 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Username registered. You may now continue with Google OAuth.",
        username: validatedUsername,
      },
      { status: 200 }
    );

    // Store in cookie for NextAuth signIn callback to associate with Google account
    response.cookies.set(
      "pending_admin_username",
      encodeURIComponent(validatedUsername),
      {
        path: "/",
        maxAge: 60 * 15, // 15 minutes
        sameSite: "lax",
      }
    );

    return response;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json(
      { error: "Failed to set username: " + errorMessage },
      { status: 500 }
    );
  }
}
