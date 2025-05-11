"use server";

import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

type VideoStatus = "UPLOADING" | "PROCESSING" | "PUBLIC" | "FAILED";

export async function getVideoStatus(videoId: string) {
  try {
    const video = await db
      .select()
      .from(videos)
      .where(eq(videos.videoId, videoId))
      .limit(1);

    return video[0] || null;
  } catch (error) {
    console.error("Error getting video status:", error);
    return null;
  }
}

export async function createVideoRecord(data: {
  videoId: string;
  title: string;
  userId: string;
}) {
  try {
    // Ensure we have valid fields
    if (!data.videoId || !data.userId || !data.title) {
      throw new Error("Missing required fields");
    }

    console.log("Creating initial video record with data:", data);

    const [newVideo] = await db
      .insert(videos)
      .values({
        videoId: data.videoId,
        title: data.title,
        userId: data.userId,
        status: "UPLOADING",
        isReady: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("Created initial video record:", newVideo);

    return { data: newVideo, message: "Success" };
  } catch (error) {
    console.error("Error creating initial video record:", error);
    return { message: "Failed to create video record" };
  }
}

export async function updateVideoRecord(data: {
  videoId: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  categoryId?: string;
  tags?: string[];
  status?: VideoStatus;
  isReady?: boolean;
  userId?: string;
}) {
  try {
    if (!data.videoId) {
      throw new Error("Video ID is required");
    }

    // If status update is requested, first check the current status
    if (data.status) {
      const currentVideo = await getVideoStatus(data.videoId);
      
      // Validate status transitions to prevent flip-flopping
      if (currentVideo) {
        // Don't downgrade from PUBLIC to PROCESSING
        if (currentVideo.status === "PUBLIC" && data.status === "PROCESSING") {
          console.log("Preventing status downgrade from PUBLIC to PROCESSING");
          // Remove status update from data object
          delete data.status;
          delete data.isReady;
        }
        
        // Don't update if status is already the target status
        if (currentVideo.status === data.status) {
          console.log(`Video already has status ${data.status}, skipping status update`);
          // Remove status update from data object
          delete data.status;
          delete data.isReady;
        }
      }
    }

    console.log("Updating video record with data:", data);

    // Only proceed with update if there's something to update
    if (Object.keys(data).length <= 1) {
      console.log("No fields to update");
      const currentVideo = await getVideoStatus(data.videoId);
      return { data: currentVideo, message: "Nothing to update" };
    }

    const [updatedVideo] = await db
      .update(videos)
      .set({
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        categoryId: data.categoryId,
        tags: data.tags,
        status: data.status,
        isReady: data.isReady,
        updatedAt: new Date(),
      })
      .where(eq(videos.videoId, data.videoId))
      .returning();

    console.log("Updated video record:", updatedVideo);

    return { data: updatedVideo, message: "Success" };
  } catch (error) {
    console.error("Error updating video record:", error);
    return { message: "Failed to update video record" };
  }
}
