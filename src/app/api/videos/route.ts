import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos, users, categories, subscriptions } from "@/db/schema";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import { formatVideoForDisplay } from "@/lib/bunny-stream";
import { bunnyStreamUrl, bunnyVideoLibraryId, bunnyStreamKey } from "@/config";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const categoryId = searchParams.get("categoryId");
    const searchQuery = searchParams.get("q");
    
    // Calculate offset for pagination
    const offset = (page - 1) * PAGE_SIZE;
    
    // Build conditions
    let conditions = and(
      eq(videos.isReady, true),
      eq(videos.status, "PUBLIC")
    );
    
    // Add category filter if provided
    if (categoryId && categoryId !== "all") {
      conditions = and(conditions, eq(videos.categoryId, categoryId));
    }
    
    // Add search filter if provided
    if (searchQuery && searchQuery.trim() !== "") {
      const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      
      if (searchTerms.length > 0) {
        // Create a pattern for exact match (higher priority)
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
      .orderBy(sql`RANDOM()`)
      .limit(PAGE_SIZE)
      .offset(offset);
    
    // Calculate pagination data
    const totalCount = countResult ? countResult.count : 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    
    // Add subscriber counts
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
        
        // Try to fetch video data from Bunny CDN to get views
        let videoDataWithViews = { ...item.video };
        try {
          const bunnyData = await fetchVideoDataFromBunny(item.video.videoId);
          if (bunnyData) {
            // Add views from Bunny CDN if available
            if (bunnyData.views !== undefined) {
              videoDataWithViews = {
                ...videoDataWithViews,
                views: bunnyData.views
              } as any;
              console.log(`Updated views for ${item.video.videoId}: ${bunnyData.views}`);
            }
            
            // Add length from Bunny CDN if available
            if (bunnyData.length !== undefined) {
              videoDataWithViews = {
                ...videoDataWithViews,
                length: bunnyData.length
              } as any;
              console.log(`Updated length for ${item.video.videoId}: ${bunnyData.length}`);
            }
          }
        } catch (error) {
          console.error(`Error updating view/length data for ${item.video.videoId}:`, error);
        }
        
        // Format the video with category and user data
        return formatVideoForDisplay(videoDataWithViews, userData);
      })
    );
    
    return NextResponse.json({
      videos: videosWithData,
      pagination: {
        currentPage: page,
        totalPages,
        totalVideos: totalCount,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
} 