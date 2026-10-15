import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();

    const response = NextResponse.json(
      {
        success: true,
        message: "Username registered. You may now continue with Google OAuth.",
        username: trimmedUsername,
      },
      { status: 200 }
    );

    // Store in cookie for NextAuth signIn callback to associate with Google account
    response.cookies.set("pending_admin_username", encodeURIComponent(trimmedUsername), {
      path: "/",
      maxAge: 60 * 15, // 15 minutes
      sameSite: "lax",
    });

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json(
      { error: "Failed to set username: " + errorMessage },
      { status: 500 }
    );
  }
}
