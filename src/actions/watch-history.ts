"use server";

import { db } from "@/db";
import { videoHistory, videos, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { formatVideoForDisplay } from "@/lib/bunny-stream";

// Interface for video history items
export interface HistoryVideo {
  id: string;
  videoId: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  progress: string;
  watchedAt: Date;
  timestamp: string;
  channel?: {
    id?: string;
    name?: string;
    handle?: string;
    avatar?: string;
  };
}

// Add or update a video in watch history
export async function addToWatchHistory(videoId: string, progress: string = "0", shouldRevalidate: boolean = false) {
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
    
    // Check if already in watch history
    const existingHistory = await db.query.videoHistory.findFirst({
      where: and(
        eq(videoHistory.userId, userId),
        eq(videoHistory.videoId, video.id)
      )
    });
    
    if (existingHistory) {
      // Update existing history entry with new watched time and progress
      await db.update(videoHistory)
        .set({
          watchedAt: new Date(),
          progress,
          updatedAt: new Date()
        })
        .where(eq(videoHistory.id, existingHistory.id));
    } else {
      // Add new history entry
      await db.insert(videoHistory).values({
        userId,
        videoId: video.id,
        progress,
        watchedAt: new Date(),
      });
    }
    
    // Only revalidate when explicitly requested (not during render)
    if (shouldRevalidate) {
      revalidatePath("/history");
    }
    
    return {
      success: true,
      message: "Updated watch history"
    };
  } catch (error) {
    console.error("Error updating watch history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
}

// Get a user's watch history with optional filtering
export async function getWatchHistory(filter?: 'today' | 'yesterday' | 'week' | 'all') {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
        videos: []
      };
    }
    
    // Prepare filter conditions
    let filterCondition = undefined;
    
    if (filter) {
      const now = new Date();
      
      if (filter === 'today') {
        // Start of today
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        filterCondition = gte(videoHistory.watchedAt, startOfDay);
      } 
      else if (filter === 'yesterday') {
        // Start and end of yesterday
        const startOfYesterday = new Date(now);
        startOfYesterday.setDate(now.getDate() - 1);
        startOfYesterday.setHours(0, 0, 0, 0);
        
        const endOfYesterday = new Date(now);
        endOfYesterday.setHours(0, 0, 0, 0);
        
        filterCondition = and(
          gte(videoHistory.watchedAt, startOfYesterday),
          sql`${videoHistory.watchedAt} < ${endOfYesterday}`
        );
      }
      else if (filter === 'week') {
        // Start of week (7 days ago)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        
        filterCondition = gte(videoHistory.watchedAt, startOfWeek);
      }
      // 'all' doesn't need additional filtering
    }
    
    // Create the query with base conditions and optional filter
    const baseCondition = eq(videoHistory.userId, userId);
    const whereCondition = filterCondition 
      ? and(baseCondition, filterCondition) 
      : baseCondition;
    
    // Execute the query
    const result = await db
      .select({
        history: videoHistory,
        video: videos,
        user: users
      })
      .from(videoHistory)
      .innerJoin(videos, eq(videoHistory.videoId, videos.id))
      .innerJoin(users, eq(videos.userId, users.clerkId))
      .where(whereCondition)
      .orderBy(desc(videoHistory.watchedAt));
    
    // Process the results to keep only the most recent entry for each unique video
    const uniqueVideos = new Map();
    
    for (const item of result) {
      // If we haven't seen this video yet, or this is a more recent watch, store it
      if (!uniqueVideos.has(item.video.id) || 
          (uniqueVideos.get(item.video.id).history.watchedAt < item.history.watchedAt)) {
        uniqueVideos.set(item.video.id, item);
      }
    }
    
    // Format the videos for display, using only unique entries
    const formattedVideos = Array.from(uniqueVideos.values()).map(item => {
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
        id: item.video.videoId, // Use the Bunny videoId for watch URL
        videoId: item.video.id, // Store the DB id
        views: viewsCount,
        progress: item.history.progress,
        watchedAt: item.history.watchedAt,
        timestamp: `Watched ${formatTimeAgo(item.history.watchedAt)}`,
      } as HistoryVideo;
    });
    
    return {
      success: true,
      videos: formattedVideos
    };
  } catch (error) {
    console.error("Error getting watch history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      videos: []
    };
  }
}

// Clear all watch history for the current user
export async function clearWatchHistory() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
        status: 401
      };
    }
    
    // Delete all watch history entries for this user
    await db.delete(videoHistory)
      .where(eq(videoHistory.userId, userId));
    
    // Revalidate the history page - this is only called from a form action, not during render
    revalidatePath("/history");
    
    return {
      success: true,
      message: "Watch history cleared"
    };
  } catch (error) {
    console.error("Error clearing watch history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
}

// Remove a specific video from watch history
export async function removeFromWatchHistory(videoId: string) {
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
    
    // Delete the watch history entry
    await db.delete(videoHistory)
      .where(
        and(
          eq(videoHistory.userId, userId),
          eq(videoHistory.videoId, video.id)
        )
      );
    
    // This is called from a client component, not during render
    revalidatePath("/history");
    
    return {
      success: true,
      message: "Removed from watch history"
    };
  } catch (error) {
    console.error("Error removing from watch history:", error);
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