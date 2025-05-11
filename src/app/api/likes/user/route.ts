import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { videoLikes, videos, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { formatVideoForDisplay } from "@/lib/bunny-stream";

// GET: Get all videos liked by the current user with pagination
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page parameter" },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid limit parameter" },
        { status: 400 }
      );
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
    
    return NextResponse.json({
      videos: formattedVideos,
      pagination: {
        currentPage: page,
        totalPages,
        totalVideos,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch liked videos" },
      { status: 500 }
    );
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