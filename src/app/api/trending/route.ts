import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos, users, categories, subscriptions } from "@/db/schema";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import { formatVideoForDisplay } from "@/lib/bunny-stream";
import { bunnyStreamUrl, bunnyVideoLibraryId, bunnyStreamKey } from "@/config";
import { CACHE_TIMES, cachedResponse, getCached, setCache } from "@/lib/utils/cache";

// Define page size for pagination
const PAGE_SIZE = 8;

// Function to fetch video data from Bunny CDN to get accurate view counts
async function fetchVideoDataFromBunny(videoId: string) {
  try {
    const response = await fetch(
      `${bunnyStreamUrl}/library/${bunnyVideoLibraryId}/videos/${videoId}`,
      {
        headers: {
          'AccessKey': bunnyStreamKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching video ${videoId} from Bunny CDN:`, error);
    return null;
  }
}

// Function to fetch all videos from Bunny CDN library
async function fetchAllVideosFromBunny() {
  try {
    const response = await fetch(
      `${bunnyStreamUrl}/library/${bunnyVideoLibraryId}/videos`,
      {
        headers: {
          'AccessKey': bunnyStreamKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching videos from Bunny CDN:`, error);
    return [];
  }
}

// Define Bunny Video interface to address TypeScript errors
interface BunnyVideo {
  guid: string;
  title: string;
  views?: number;
  length?: number;
  dateUploaded?: string;
  status?: number;
  thumbnailFileName?: string;
  [key: string]: any; // Allow for additional properties
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const searchQuery = searchParams.get("q");
    
    // Use cache to improve performance
    const cacheKey = `trending_videos_${page}_${searchQuery || ''}`;
    const cachedData = getCached(cacheKey);
    
    if (cachedData) {
      return cachedResponse(cachedData, {
        maxAge: CACHE_TIMES.SHORT // Cache for a short time (1 minute)
      });
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * PAGE_SIZE;
    
    // Build base conditions for public videos
    let conditions = and(
      eq(videos.isReady, true),
      eq(videos.status, "PUBLIC")
    );
    
    // Add search filter if provided
    if (searchQuery && searchQuery.trim() !== "") {
      const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      
      if (searchTerms.length > 0) {
        // Create a pattern for exact match
        const exactPattern = `%${searchQuery}%`;
        
        // Create exact match conditions
        const exactMatchConditions = or(
          like(sql`LOWER(${videos.title})`, sql`LOWER(${exactPattern})`),
          like(sql`LOWER(${videos.description})`, sql`LOWER(${exactPattern})`)
        );
        
        // Create tag-based search conditions
        const tagConditions = searchTerms.map(term => {
          return sql`${videos.tags}::text ILIKE ${'%' + term + '%'}`;
        });
        
        // Create individual term match conditions
        const termMatchConditions = searchTerms.map(term => {
          const termPattern = `%${term}%`;
          return or(
            like(sql`LOWER(${videos.title})`, sql`LOWER(${termPattern})`),
            like(sql`LOWER(${videos.description})`, sql`LOWER(${termPattern})`)
          );
        });
        
        // Combine all search conditions
        const searchCondition = or(
          exactMatchConditions,
          ...tagConditions,
          ...termMatchConditions
        );
        
        // Add search condition to main conditions
        conditions = and(conditions, searchCondition);
      }
    }
    
    // Get total video count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videos)
      .where(conditions);
    
    // Fetch videos with all related data
    const result = await db
      .select({
        video: videos,
        user: users,
        category: categories,
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.clerkId))
      .leftJoin(categories, eq(videos.categoryId, categories.id))
      .where(conditions)
      .orderBy(desc(videos.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset);
    
    // Fetch Bunny CDN data for all videos
    const bunnyVideos = await fetchAllVideosFromBunny();
    
    // Add subscriber counts and Bunny data
    const videosWithData = await Promise.all(
      result.map(async (item) => {
        // Fetch subscription count for the creator
        const [subscriptionResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(subscriptions)
          .where(eq(subscriptions.creatorId, item.user.clerkId));
        
        // Add subscriber count to user data
        const userData = {
          ...item.user,
          subscriberCount: subscriptionResult?.count || 0
        };
        
        // Find matching video in Bunny CDN data
        const bunnyVideo = bunnyVideos.find((v: BunnyVideo) => v.guid === item.video.videoId);
        
        // Add views and length from Bunny CDN if available
        let videoDataWithBunnyFields = { ...item.video };
        
        if (bunnyVideo) {
          if (bunnyVideo.views !== undefined) {
            videoDataWithBunnyFields = {
              ...videoDataWithBunnyFields,
              views: bunnyVideo.views
            } as any;
          }
          
          if (bunnyVideo.length !== undefined) {
            videoDataWithBunnyFields = {
              ...videoDataWithBunnyFields,
              length: bunnyVideo.length
            } as any;
          }
        }
        
        // Format the video with category and user data
        return formatVideoForDisplay(videoDataWithBunnyFields, userData);
      })
    );
    
    // Sort videos by view count to get trending videos
    const sortedVideos = [...videosWithData].sort((a, b) => {
      // Parse view counts to numbers (handle formatted strings like "1.2K")
      const viewsA = typeof a.views === 'string' 
        ? parseInt(a.views.replace(/[^0-9]/g, '')) 
        : (a.views || 0);
      
      const viewsB = typeof b.views === 'string' 
        ? parseInt(b.views.replace(/[^0-9]/g, '')) 
        : (b.views || 0);
      
      // Sort by views in descending order
      return viewsB - viewsA;
    });
    
    // Prepare the response data
    const responseData = {
      videos: sortedVideos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((countResult?.count || 0) / PAGE_SIZE),
        totalVideos: countResult?.count || 0,
        hasMore: page < Math.ceil((countResult?.count || 0) / PAGE_SIZE)
      }
    };
    
    // Cache the response
    setCache(cacheKey, responseData, CACHE_TIMES.SHORT);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending videos", videos: [] },
      { status: 500 }
    );
  }
} 