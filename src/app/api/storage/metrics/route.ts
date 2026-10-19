import { NextResponse } from "next/server";
import { getBackblazeStorageUsage } from "@/config/backblaze.config";
import { getCloudinaryStorageUsage } from "@/config/cloudinary.config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [backblaze, cloudinary] = await Promise.all([
      getBackblazeStorageUsage(),
      getCloudinaryStorageUsage(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      backblaze,
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
