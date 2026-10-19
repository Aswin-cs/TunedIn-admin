import { NextResponse } from "next/server";
import { getCloudinaryStorageUsage } from "@/config/cloudinary.config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cloudinary = await getCloudinaryStorageUsage();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cloudinary,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch storage metrics";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
