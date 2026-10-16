import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "../../../../../models/user.model";
import { usernameSchema } from "@/lib/validations/user";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    // Zod validation for username
    const validationResult = usernameSchema.safeParse(username);
    if (!validationResult.success) {
      const errorMsg =
        validationResult.error.issues[0]?.message || "Invalid username format.";
      return NextResponse.json(
        {
          available: false,
          error: errorMsg,
        },
        { status: 200 }
      );
    }

    const validatedUsername = validationResult.data;

    await connectDB();

    // Case-insensitive exact match to ensure uniqueness
    const escapedUsername = validatedUsername.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${escapedUsername}$`, "i") },
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        {
          available: false,
          message: "Username is already taken.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        available: true,
        message: "Username is available.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to verify username.";
    console.error("Error in check-username route:", error);
    return NextResponse.json(
      { available: false, error: errorMessage },
      { status: 500 }
    );
  }
}
