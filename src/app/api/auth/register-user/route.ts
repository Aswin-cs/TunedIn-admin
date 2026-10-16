import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "../../../../../models/user.model";
import { usernameSchema } from "@/lib/validations/user";
import { z } from "zod";

const registerUserSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().email("Please enter a valid email address."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = registerUserSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMsg =
        validationResult.error.issues[0]?.message || "Invalid input data.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { username: validatedUsername, email: validatedEmail } =
      validationResult.data;

    await connectDB();

    const normalizedEmail = validatedEmail.toLowerCase();
    const trimmedUsername = validatedUsername;

    // Check if user already exists with this email
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Check if username changed and is taken by another user
      if (user.username !== trimmedUsername) {
        const escaped = trimmedUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const existingUsernameUser = await User.findOne({
          username: { $regex: new RegExp(`^${escaped}$`, "i") },
          _id: { $ne: user._id },
        }).lean();

        if (existingUsernameUser) {
          return NextResponse.json(
            { error: "Username is already taken by another account." },
            { status: 409 }
          );
        }
      }

      user.username = trimmedUsername;
      user.updatedAt = new Date();
      await user.save();
    } else {
      // Check if username taken by another user
      const escaped = trimmedUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existingUsernameUser = await User.findOne({
        username: { $regex: new RegExp(`^${escaped}$`, "i") },
      }).lean();

      if (existingUsernameUser) {
        return NextResponse.json(
          { error: "Username is already taken. Please choose another." },
          { status: 409 }
        );
      }

      // Create new user with schema defaults (role: 'subadmin', verified: false)
      user = await User.create({
        username: trimmedUsername,
        email: normalizedEmail,
        role: "subadmin",
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Profile verified. You can now complete Google OAuth authentication.",
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
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in register-user API:", error);
    return NextResponse.json(
      { error: "Failed to initialize profile. " + errorMessage },
      { status: 500 }
    );
  }
}
