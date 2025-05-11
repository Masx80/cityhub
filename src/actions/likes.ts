"use server";

import { eq, and, sql, or, desc } from "drizzle-orm";
import { db } from "@/db";
import { videoLikes, videoDislikes, videos, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { createLikeNotification } from "@/lib/notification-service";
import { revalidatePath } from "next/cache";
import { formatVideoForDisplay } from "@/lib/bunny-stream";

export async function likeVideo(videoId: string) {
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
      return {
        success: false,
        error: "You've already liked this video",
        status: 400
      };
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

    // Revalidate the watch page
    revalidatePath(`/watch/${videoId}`);

    return {
      success: true,
      message: "Video liked successfully",
      likeCount,
      dislikeCount
    };
  } catch (error) {
    console.error("Error liking video:", error);
    return {
      success: false,
      error: "Failed to like video",
      status: 500
    };
  }
}

export async function unlikeVideo(videoId: string) {
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
      return {
        success: false,
        error: "You haven't liked this video",
        status: 400
      };
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

    // Revalidate the watch page
    revalidatePath(`/watch/${videoId}`);

    return {
      success: true,
      message: "Video unliked successfully",
      likeCount,
      dislikeCount
    };
  } catch (error) {
    console.error("Error unliking video:", error);
    return {
      success: false,
      error: "Failed to unlike video",
      status: 500
    };
  }
}

export async function getLikeStatus(videoId: string) {
  try {
    const { userId } = await auth();
    
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
      return {
        success: true,
        likeCount,
        dislikeCount,
        isLiked: false,
        isDisliked: false
      };
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

    return {
      success: true,
      likeCount,
      dislikeCount,
      isLiked: !!existingLike,
      isDisliked: !!existingDislike
    };
  } catch (error) {
    console.error("Error checking like status:", error);
    return {
      success: false,
      error: "Failed to check like status",
      status: 500
    };
  }
}

export async function getUserLikedVideos(page: number = 1, limit: number = 20) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401
      };
    }
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return {
        success: false,
        error: "Invalid page parameter",
        status: 400
      };
    }
    
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return {
        success: false,
        error: "Invalid limit parameter",
        status: 400
      };
    }
    
    const offset = (page - 1) * limit;
    
    // Get count of all liked videos for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoLikes)
      .where(eq(videoLikes.userId, userId));
    
    // Get liked videos with pagination
    const likedVideos = await db
      .select({
        video: videos,
        user: users,
        likedAt: videoLikes.createdAt
      })
      .from(videoLikes)
      .where(eq(videoLikes.userId, userId))
      .innerJoin(videos, eq(videoLikes.videoId, videos.id))
      .innerJoin(users, eq(videos.userId, users.clerkId))
      .orderBy(desc(videoLikes.createdAt))
      .limit(limit)
      .offset(offset);
    
    const totalVideos = countResult?.count || 0;
    const totalPages = Math.ceil(totalVideos / limit);
    
    // Format videos for the frontend
    const formattedVideos = likedVideos.map(item => {
      const video = formatVideoForDisplay(item.video, item.user);
      // Add liked timestamp
      return {
        ...video,
        timestamp: `Liked ${formatRelativeTime(item.likedAt)}`
      };
    });
    
    return {
      success: true,
      videos: formattedVideos,
      pagination: {
        currentPage: page,
        totalPages,
        totalVideos,
        hasMore: page < totalPages
      }
    };
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    return {
      success: false,
      error: "Failed to fetch liked videos",
      status: 500
    };
  }
}

export async function clearAllLikedVideos() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401
      };
    }
    
    // Delete all likes for this user
    await db.delete(videoLikes)
      .where(eq(videoLikes.userId, userId));
    
    // Revalidate the liked videos page
    revalidatePath('/liked');
    
    return {
      success: true,
      message: "All liked videos cleared successfully"
    };
  } catch (error) {
    console.error("Error clearing liked videos:", error);
    return {
      success: false,
      error: "Failed to clear liked videos",
      status: 500
    };
  }
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
} 