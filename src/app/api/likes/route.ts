import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql, or } from "drizzle-orm";
import { db } from "@/db";
import { videoLikes, videoDislikes, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { createLikeNotification } from "@/lib/notification-service";

// POST: Add a like to a video
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { videoId } = await req.json();
    
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Check if video exists - search by both id and videoId fields
    const videoExists = await db.query.videos.findFirst({
      where: or(
        eq(videos.id, videoId),
        eq(videos.videoId, videoId)
      )
    });

    if (!videoExists) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Use the database video ID for likes
    const dbVideoId = videoExists.id;

    // Check if user already liked the video
    const existingLike = await db.query.videoLikes.findFirst({
      where: and(
        eq(videoLikes.userId, userId),
        eq(videoLikes.videoId, dbVideoId)
      )
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "You've already liked this video" },
        { status: 400 }
      );
    }

    // Check if user has disliked the video and remove the dislike if they did
    const existingDislike = await db.query.videoDislikes.findFirst({
      where: and(
        eq(videoDislikes.userId, userId),
        eq(videoDislikes.videoId, dbVideoId)
      )
    });

    if (existingDislike) {
      // Remove the dislike first
      await db.delete(videoDislikes).where(
        and(
          eq(videoDislikes.userId, userId),
          eq(videoDislikes.videoId, dbVideoId)
        )
      );
    }

    // Add like
    await db.insert(videoLikes).values({
      userId,
      videoId: dbVideoId
    });

    // Create notification for the video creator
    await createLikeNotification(userId, dbVideoId);

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

    return NextResponse.json({ 
      message: "Video liked successfully",
      likeCount,
      dislikeCount
    });
  } catch (error) {
    console.error("Error liking video:", error);
    return NextResponse.json(
      { error: "Failed to like video" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a like from a video
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Check if video exists - search by both id and videoId fields
    const videoExists = await db.query.videos.findFirst({
      where: or(
        eq(videos.id, videoId),
        eq(videos.videoId, videoId)
      )
    });

    if (!videoExists) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Use the database video ID for likes
    const dbVideoId = videoExists.id;

    // Check if like exists
    const existingLike = await db.query.videoLikes.findFirst({
      where: and(
        eq(videoLikes.userId, userId),
        eq(videoLikes.videoId, dbVideoId)
      )
    });

    if (!existingLike) {
      return NextResponse.json(
        { error: "You haven't liked this video" },
        { status: 400 }
      );
    }

    // Remove like
    await db.delete(videoLikes).where(
      and(
        eq(videoLikes.userId, userId),
        eq(videoLikes.videoId, dbVideoId)
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

    return NextResponse.json({ 
      message: "Video unliked successfully",
      likeCount,
      dislikeCount
    });
  } catch (error) {
    console.error("Error unliking video:", error);
    return NextResponse.json(
      { error: "Failed to unlike video" },
      { status: 500 }
    );
  }
}

// GET: Check if a user has liked a video and get like count
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");
    
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Check if video exists - search by both id and videoId fields
    const videoExists = await db.query.videos.findFirst({
      where: or(
        eq(videos.id, videoId),
        eq(videos.videoId, videoId)
      )
    });

    if (!videoExists) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Use the database video ID for likes
    const dbVideoId = videoExists.id;

    // Get counts for the video
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

    // If user is not logged in, just return the counts
    if (!userId) {
      return NextResponse.json({ 
        likeCount,
        dislikeCount,
        isLiked: false,
        isDisliked: false
      });
    }

    // Check if user has liked the video
    const existingLike = await db.query.videoLikes.findFirst({
      where: and(
        eq(videoLikes.userId, userId),
        eq(videoLikes.videoId, dbVideoId)
      )
    });

    // Check if user has disliked the video
    const existingDislike = await db.query.videoDislikes.findFirst({
      where: and(
        eq(videoDislikes.userId, userId),
        eq(videoDislikes.videoId, dbVideoId)
      )
    });

    return NextResponse.json({ 
      likeCount,
      dislikeCount,
      isLiked: !!existingLike,
      isDisliked: !!existingDislike
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 }
    );
  }
} 