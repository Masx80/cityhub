import { bunnyVideoLibraryId, bunnyWebhookAPIKey } from "@/config";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

type BunnyWebhookRes = {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;
};

export const POST = async (req: NextRequest) => {
  console.log("⚡ Bunny webhook received", new Date().toISOString());
  try {
    // Get the API key from query parameters
    const searchParams = req.nextUrl.searchParams;
    const apiKey = searchParams.get("key");

    if (!apiKey || apiKey !== bunnyWebhookAPIKey) {
      console.log("🚫 Invalid API key received:", apiKey);
      return NextResponse.json(
        { message: "Invalid API key" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = (await req.json()) as BunnyWebhookRes;
      console.log("📦 Bunny webhook payload:", JSON.stringify(body, null, 2));
    } catch (error) {
      console.error("🚫 Error parsing webhook payload:", error);
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    if (body.VideoLibraryId !== Number.parseInt(bunnyVideoLibraryId ?? "0")) {
      console.log("🚫 Invalid video library ID:", body.VideoLibraryId, "Expected:", bunnyVideoLibraryId);
      return NextResponse.json(
        { message: "Invalid video library" },
        { status: 401 }
      );
    }

    console.log("✅ Webhook authentication successful");

    if (body.Status === 3) {
      // First, check the current status of the video
      const videoRecords = await db
        .select()
        .from(videos)
        .where(eq(videos.videoId, body.VideoGuid))
        .limit(1);
      
      const currentVideo = videoRecords[0];
      console.log("🎬 Current video status:", currentVideo ? currentVideo.status : "not found", "Video ID:", body.VideoGuid);
      
      // Only update if not already PUBLIC to prevent status bouncing
      if (currentVideo && currentVideo.status !== "PUBLIC") {
        console.log("🔄 Updating video status to PUBLIC for video:", body.VideoGuid);
        await db
          .update(videos)
          .set({ 
            status: "PUBLIC", 
            isReady: true, 
            updatedAt: new Date(),
          })
          .where(eq(videos.videoId, body.VideoGuid));
        console.log("✅ Updated video status to PUBLIC and marked as ready");
      } else if (currentVideo && !currentVideo.isReady) {
        // If status is already PUBLIC but isReady is false, update isReady
        console.log("🔄 Video already has PUBLIC status, ensuring isReady is set to true");
        await db
          .update(videos)
          .set({ 
            isReady: true, 
            updatedAt: new Date(),
          })
          .where(eq(videos.videoId, body.VideoGuid));
        console.log("✅ Updated video to be ready");
      } else {
        console.log("ℹ️ Video already has PUBLIC status and is marked ready, skipping update");
      }
    } else {
      console.log("ℹ️ Received status other than 3 (ready):", body.Status);
    }

    return NextResponse.json(
      { message: "Data received successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("🚫 Error handling POST request:", error?.message, error?.stack);
    return NextResponse.json(
      { message: "Error handling request" },
      { status: 500 }
    );
  }
};
