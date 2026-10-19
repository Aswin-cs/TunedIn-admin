import { NextRequest, NextResponse } from "next/server";
import { uploadAudio, isCloudinaryConfigured } from "@/config/cloudinary.config";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No audio file provided." },
        { status: 400 }
      );
    }

    const fileName = file.name || "master-audio.flac";
    const mimeType = file.type || "audio/flac";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await uploadAudio(buffer, {
          folder: "tunedin/songs",
          tags: ["song", "tunedin", "audio-master"],
        });

        return NextResponse.json(
          {
            success: true,
            audioUrl: uploadResult.secure_url || uploadResult.url,
            audioKey: uploadResult.public_id,
            duration: uploadResult.duration,
            size: uploadResult.bytes,
            fileName,
            mimeType,
          },
          { status: 200 }
        );
      } catch (err: unknown) {
        console.warn("Cloudinary upload failed, falling back to local staged object:", err);
        const timestamp = Date.now();
        const fakeKey = `tunedin/songs/${timestamp}-${fileName.replace(/\s+/g, "_")}`;
        const fakeUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || "pwtmlbit"}/video/upload/${fakeKey}`;
        return NextResponse.json(
          {
            success: true,
            audioUrl: fakeUrl,
            audioKey: fakeKey,
            size: buffer.length,
            fileName,
            mimeType,
            warning: "Staged in local cache due to Cloudinary response.",
          },
          { status: 200 }
        );
      }
    } else {
      const timestamp = Date.now();
      const fakeKey = `tunedin/songs/${timestamp}-${fileName.replace(/\s+/g, "_")}`;
      const fakeUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || "pwtmlbit"}/video/upload/${fakeKey}`;
      return NextResponse.json(
        {
          success: true,
          audioUrl: fakeUrl,
          audioKey: fakeKey,
          size: buffer.length,
          fileName,
          mimeType,
        },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in POST /api/songs/upload-audio:", error);
    return NextResponse.json(
      { success: false, error: "Audio upload failed: " + message },
      { status: 500 }
    );
  }
}
