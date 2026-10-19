import { NextRequest, NextResponse } from "next/server";
import { uploadPoster, isCloudinaryConfigured } from "../../../../../config/cloudinary.config";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided in form data." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isCloudinaryConfigured()) {
        const uploadResult = await uploadPoster(buffer, {
          folder: process.env.CLOUDINARY_POSTER_FOLDER || "tunedin/posters",
          tags: ["artwork", "tunedin", "catalog"],
        });

        return NextResponse.json(
          {
            success: true,
            url: uploadResult.secure_url || uploadResult.url,
            poster_Id: uploadResult.public_id,
            bytes: uploadResult.bytes,
            format: uploadResult.format,
          },
          { status: 200 }
        );
      } else {
        // Fallback for offline/local development without active Cloudinary credentials
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
        return NextResponse.json(
          {
            success: true,
            url: base64,
            poster_Id: `local_poster_${Date.now()}`,
            bytes: buffer.length,
            format: file.type.split("/")[1] || "png",
          },
          { status: 200 }
        );
      }
    } else {
      const body = await req.json();
      const { image, url } = body;
      const target = image || url;

      if (!target) {
        return NextResponse.json(
          { success: false, error: "No image URL or base64 data provided." },
          { status: 400 }
        );
      }

      if (isCloudinaryConfigured()) {
        const uploadResult = await uploadPoster(target, {
          folder: process.env.CLOUDINARY_POSTER_FOLDER || "tunedin/posters",
        });

        return NextResponse.json(
          {
            success: true,
            url: uploadResult.secure_url || uploadResult.url,
            poster_Id: uploadResult.public_id,
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            success: true,
            url: target,
            poster_Id: `poster_${Date.now()}`,
          },
          { status: 200 }
        );
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in POST /api/songs/upload-artwork:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload artwork: " + message },
      { status: 500 }
    );
  }
}
