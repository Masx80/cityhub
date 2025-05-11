import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql, or } from "drizzle-orm";
import { db } from "@/db";
import { videoLikes, videoDislikes, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

// POST: Add a dislike to a video
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

    // Use the database video ID for dislikes
    const dbVideoId = videoExists.id;

    // Check if user already disliked the video
    const existingDislike = await db.query.videoDislikes.findFirst({
      where: and(
        eq(videoDislikes.userId, userId),
        eq(videoDislikes.videoId, dbVideoId)
      )
    });

    if (existingDislike) {
      return NextResponse.json(
        { error: "You've already disliked this video" },
        { status: 400 }
      );
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

    return NextResponse.json({ 
      message: "Video disliked successfully",
      likeCount,
      dislikeCount 
    });
  } catch (error) {
    console.error("Error disliking video:", error);
    return NextResponse.json(
      { error: "Failed to dislike video" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a dislike from a video
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

    // Use the database video ID for dislikes
    const dbVideoId = videoExists.id;

    // Check if dislike exists
    const existingDislike = await db.query.videoDislikes.findFirst({
      where: and(
        eq(videoDislikes.userId, userId),
        eq(videoDislikes.videoId, dbVideoId)
      )
    });

    if (!existingDislike) {
      return NextResponse.json(
        { error: "You haven't disliked this video" },
        { status: 400 }
      );
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

    return NextResponse.json({ 
      message: "Video undisliked successfully",
      likeCount,
      dislikeCount 
    });
  } catch (error) {
    console.error("Error removing dislike:", error);
    return NextResponse.json(
      { error: "Failed to remove dislike" },
      { status: 500 }
    );
  }
}

// GET: Check if a user has disliked a video and get dislike count
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

    // Use the database video ID for dislikes
    const dbVideoId = videoExists.id;

    // Get dislike count for the video
    const [dislikeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoDislikes)
      .where(eq(videoDislikes.videoId, dbVideoId));

    const dislikeCount = dislikeResult?.count || 0;

    // If user is not logged in, just return the count
    if (!userId) {
      return NextResponse.json({ 
        dislikeCount,
        isDisliked: false
      });
    }

    // Check if user has disliked the video
    const existingDislike = await db.query.videoDislikes.findFirst({
      where: and(
        eq(videoDislikes.userId, userId),
        eq(videoDislikes.videoId, dbVideoId)
      )
    });

    return NextResponse.json({ 
      dislikeCount,
      isDisliked: !!existingDislike
    });
  } catch (error) {
    console.error("Error checking dislike status:", error);
    return NextResponse.json(
      { error: "Failed to check dislike status" },
      { status: 500 }
    );
  }
} 