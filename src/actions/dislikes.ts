"use server";

import { eq, and, sql, or } from "drizzle-orm";
import { db } from "@/db";
import { videoLikes, videoDislikes, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function dislikeVideo(videoId: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401
      };
    }
    
    if (!videoId) {
      return {
        success: false,
        error: "Video ID is required",
        status: 400
      };
    }

    // Check if video exists - search by both id and videoId fields
    const videoExists = await db.query.videos.findFirst({
      where: or(
        eq(videos.id, videoId),
        eq(videos.videoId, videoId)
      )
    });

    if (!videoExists) {
      return {
        success: false,
        error: "Video not found",
        status: 404
      };
    }

    // Use the database video ID for operations
    const dbVideoId = videoExists.id;

    // Check if user already disliked the video
    const existingDislike = await db.query.videoDislikes.findFirst({
      where: and(
        eq(videoDislikes.userId, userId),
        eq(videoDislikes.videoId, dbVideoId)
      )
    });

    if (existingDislike) {
      return {
        success: false,
        error: "You've already disliked this video",
        status: 400
      };
    }

    // Check if user has liked the video and remove the like if they did
    const existingLike = await db.query.videoLikes.findFirst({
      where: and(
        eq(videoLikes.userId, userId),
        eq(videoLikes.videoId, dbVideoId)
      )
    });

    if (existingLike) {
      // Remove the like first
      await db.delete(videoLikes).where(
        and(
          eq(videoLikes.userId, userId),
          eq(videoLikes.videoId, dbVideoId)
        )
      );
    }

    // Add dislike
    await db.insert(videoDislikes).values({
      userId,
      videoId: dbVideoId
    });

    // Get updated counts
    const [likeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoLikes)
      .where(eq(videoLikes.videoId, dbVideoId));

    const [dislikeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoDislikes)
      .where(eq(videoDislikes.videoId, dbVideoId));

    const likeCount = likeResult?.count || 0;
    const dislikeCount = dislikeResult?.count || 0;

    // Revalidate the watch page
    revalidatePath(`/watch/${videoId}`);

    return {
      success: true,
      message: "Video disliked successfully",
      likeCount,
      dislikeCount
    };
  } catch (error) {
    console.error("Error disliking video:", error);
    return {
      success: false,
      error: "Failed to dislike video",
      status: 500
    };
  }
}

export async function undislikeVideo(videoId: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401
      };
    }
    
    if (!videoId) {
      return {
        success: false,
        error: "Video ID is required",
        status: 400
      };
    }

    // Check if video exists - search by both id and videoId fields
    const videoExists = await db.query.videos.findFirst({
      where: or(
        eq(videos.id, videoId),
        eq(videos.videoId, videoId)
      )
    });

    if (!videoExists) {
      return {
        success: false,
        error: "Video not found",
        status: 404
      };
    }

    // Use the database video ID for operations
    const dbVideoId = videoExists.id;

    // Check if dislike exists
    const existingDislike = await db.query.videoDislikes.findFirst({
      where: and(
        eq(videoDislikes.userId, userId),
        eq(videoDislikes.videoId, dbVideoId)
      )
    });

    if (!existingDislike) {
      return {
        success: false,
        error: "You haven't disliked this video",
        status: 400
      };
    }

    // Remove dislike
    await db.delete(videoDislikes).where(
      and(
        eq(videoDislikes.userId, userId),
        eq(videoDislikes.videoId, dbVideoId)
      )
    );

    // Get updated counts
    const [likeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoLikes)
      .where(eq(videoLikes.videoId, dbVideoId));

    const [dislikeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoDislikes)
      .where(eq(videoDislikes.videoId, dbVideoId));

    const likeCount = likeResult?.count || 0;
    const dislikeCount = dislikeResult?.count || 0;

    // Revalidate the watch page
    revalidatePath(`/watch/${videoId}`);

    return {
      success: true,
      message: "Dislike removed successfully",
      likeCount,
      dislikeCount
    };
  } catch (error) {
    console.error("Error removing dislike:", error);
    return {
      success: false,
      error: "Failed to remove dislike",
      status: 500
    };
  }
} 