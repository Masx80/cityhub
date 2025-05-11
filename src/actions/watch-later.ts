"use server";

import { db } from "@/db";
import { watchLater, videos, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { formatVideoForDisplay } from "@/lib/bunny-stream";
import { WatchLaterVideo } from "@/types";

// Add a video to watch later
export async function addToWatchLater(videoId: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
        status: 401
      };
    }
    
    // Check if the video exists in the database
    const video = await db.query.videos.findFirst({
      where: eq(videos.videoId, videoId)
    });
    
    if (!video) {
      return {
        success: false,
        error: "Video not found",
        status: 404
      };
    }
    
    // Check if already in watch later
    const existing = await db.query.watchLater.findFirst({
      where: and(
        eq(watchLater.userId, userId),
        eq(watchLater.videoId, video.id)
      )
    });
    
    if (existing) {
      return {
        success: true,
        message: "Video already in Watch Later",
        inWatchLater: true
      };
    }
    
    // Add to watch later
    await db.insert(watchLater).values({
      userId,
      videoId: video.id,
    });
    
    // Revalidate the watch later page
    revalidatePath("/watch-later");
    
    return {
      success: true,
      message: "Added to Watch Later",
      inWatchLater: true
    };
  } catch (error) {
    console.error("Error adding to watch later:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
}

// Remove a video from watch later
export async function removeFromWatchLater(videoId: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
        status: 401
      };
    }
    
    // Check if the video exists in the database
    const video = await db.query.videos.findFirst({
      where: eq(videos.videoId, videoId)
    });
    
    if (!video) {
      return {
        success: false,
        error: "Video not found",
        status: 404
      };
    }
    
    // Delete the watch later entry
    await db.delete(watchLater)
      .where(
        and(
          eq(watchLater.userId, userId),
          eq(watchLater.videoId, video.id)
        )
      );
    
    // Revalidate the watch later page
    revalidatePath("/watch-later");
    
    return {
      success: true,
      message: "Removed from Watch Later",
      inWatchLater: false
    };
  } catch (error) {
    console.error("Error removing from watch later:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
}

// Check if a video is in watch later
export async function checkWatchLaterStatus(videoId: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: true,
        inWatchLater: false
      };
    }
    
    // Check if the video exists in the database
    const video = await db.query.videos.findFirst({
      where: eq(videos.videoId, videoId)
    });
    
    if (!video) {
      return {
        success: false,
        error: "Video not found",
        inWatchLater: false
      };
    }
    
    const existing = await db.query.watchLater.findFirst({
      where: and(
        eq(watchLater.userId, userId),
        eq(watchLater.videoId, video.id)
      )
    });
    
    return {
      success: true,
      inWatchLater: Boolean(existing)
    };
  } catch (error) {
    console.error("Error checking watch later status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      inWatchLater: false
    };
  }
}

// Get all watch later videos for the current user
export async function getWatchLaterVideos() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
        videos: []
      };
    }
    
    // Join watch_later with videos and users to get full video details
    const result = await db
      .select({
        watchLater: watchLater,
        video: videos,
        user: users
      })
      .from(watchLater)
      .innerJoin(videos, eq(watchLater.videoId, videos.id))
      .innerJoin(users, eq(videos.userId, users.clerkId))
      .where(eq(watchLater.userId, userId))
      .orderBy(desc(watchLater.createdAt));
    
    // Format the videos for display
    const formattedVideos = result.map(item => {
      const videoWithChannel = formatVideoForDisplay(item.video, item.user);
      
      // Parse views to number if it's a string
      let viewsCount: number | undefined;
      if (typeof videoWithChannel.views === 'string') {
        const parsed = parseInt(videoWithChannel.views.replace(/[^0-9]/g, ''), 10);
        viewsCount = isNaN(parsed) ? undefined : parsed;
      } else {
        viewsCount = videoWithChannel.views;
      }
      
      return {
        ...videoWithChannel,
        id: item.watchLater.id,
        videoId: item.video.id,
        views: viewsCount,
        addedAt: item.watchLater.createdAt,
        timestamp: `Added ${formatTimeAgo(item.watchLater.createdAt)}`,
      } as WatchLaterVideo;
    });
    
    return {
      success: true,
      videos: formattedVideos
    };
  } catch (error) {
    console.error("Error getting watch later videos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      videos: []
    };
  }
}

// Clear all watch later videos for the current user
export async function clearWatchLater() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
        status: 401
      };
    }
    
    // Delete all watch later entries for this user
    await db.delete(watchLater)
      .where(eq(watchLater.userId, userId));
    
    // Revalidate the watch later page
    revalidatePath("/watch-later");
    
    return {
      success: true,
      message: "Watch Later list cleared"
    };
  } catch (error) {
    console.error("Error clearing watch later:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
} 