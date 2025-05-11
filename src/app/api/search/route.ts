import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, and, desc, sql, or, ilike } from "drizzle-orm";
import { formatVideoForDisplay } from "@/lib/bunny-stream";
import { CACHE_TIMES, cachedResponse, getCached, setCache } from "@/lib/utils/cache";

// Define page size for pagination
const PAGE_SIZE = 12;

// Function to optimize search query by breaking it into terms and removing common words
function getSearchTerms(query: string): string[] {
  // Break into terms
  const terms = query.toLowerCase().trim().split(/\s+/).filter(term => term.length > 1);
  
  // Filter out common words that may not be helpful for search
  const commonWords = new Set(['the', 'and', 'or', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'of', 'a', 'an']);
  return terms.filter(term => !commonWords.has(term));
}

// Function to generate search cache key
function getSearchCacheKey(query: string, page: number, categoryId: string | null): string {
  return `search_${query.toLowerCase().trim()}_${page}_${categoryId || 'all'}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const categoryId = searchParams.get("categoryId");
    
    // Calculate offset for pagination
    const offset = (page - 1) * PAGE_SIZE;
    
    // If no search query, return empty results
    if (!query.trim()) {
      return cachedResponse({
        videos: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalVideos: 0,
          hasMore: false
        }
      }, {
        headers: {
          'Cache-Control': 'no-store'
        }
      });
    }
    
    // Generate cache key based on search parameters
    const cacheKey = getSearchCacheKey(query, page, categoryId);
    
    // Check if we have cached results - improves performance significantly
    const cachedResults = getCached(cacheKey);
    if (cachedResults) {
      return cachedResponse(cachedResults, {
        maxAge: CACHE_TIMES.SHORT, // 1 minute for fresher results
        staleWhileRevalidate: CACHE_TIMES.MEDIUM, // 5 minutes
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Lookup': cacheKey
        }
      });
    }
    
    // Break the search query into individual terms for more effective searching
    const searchTerms = getSearchTerms(query);
    
    // Build the base condition for public, ready videos
    let conditions = and(
      eq(videos.isReady, true),
      eq(videos.status, "PUBLIC")
    );
    
    // Add category filter if provided
    if (categoryId) {
      conditions = and(conditions, eq(videos.categoryId, categoryId));
    }
    
    // Add search conditions - optimize with more focus on exact matches
    if (searchTerms.length > 0) {
      // Create patterns for different types of matches
      const exactPattern = `%${query}%`;
      
      // For faster searches with better relevance, focus on key fields first
      const primaryConditions = [
        // Title field searches (high priority)
        ilike(videos.title, exactPattern),
        // Tags field search (medium priority) - using array contains
        sql`${videos.tags}::text ILIKE ${exactPattern}`,
      ];
      
      // Add channel name conditions
      const channelConditions = [
        ilike(users.name, exactPattern),
        ilike(users.channelHandle, exactPattern),
      ];
      
      // Add individual term matches for more comprehensive results
      const termConditions = searchTerms.flatMap(term => [
        ilike(videos.title, `%${term}%`),
        ilike(videos.description, `%${term}%`),
        sql`${videos.tags}::text ILIKE ${'%' + term + '%'}`
      ]);
      
      // Combine all search conditions
      conditions = and(
        conditions,
        or(...primaryConditions, ...channelConditions, ...termConditions)
      );
    }
    
    // Optimized query without heavy relevance calculation for faster results 
    const results = await db
      .select({
        video: videos,
        user: users,
        // Simplified relevance scoring for better performance
        relevance: sql<number>`
          CASE 
            WHEN LOWER(${videos.title}) = LOWER(${query}) THEN 100
            WHEN LOWER(${videos.title}) LIKE LOWER(${'%' + query + '%'}) THEN 80
            WHEN ${videos.tags}::text ILIKE ${`%"${query}"%`} THEN 60
            WHEN LOWER(${users.name}) = LOWER(${query}) THEN 50
            WHEN LOWER(${users.channelHandle}) = LOWER(${query}) THEN 50
            WHEN LOWER(${videos.description}) LIKE LOWER(${'%' + query + '%'}) THEN 40
            ELSE 20
          END
        `
      })
      .from(videos)
      .where(conditions)
      .orderBy(sql`relevance DESC`, desc(videos.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset)
      .innerJoin(users, eq(videos.userId, users.clerkId));
    
    // Use optimized count query with same conditions but without complex joins
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videos)
      .where(conditions);
    
    const totalVideos = countResult?.count || 0;
    const totalPages = Math.ceil(totalVideos / PAGE_SIZE);
    
    // Format results for the frontend
    const formattedVideos = results.map(item => formatVideoForDisplay(item.video, item.user));
    
    // Prepare response data
    const responseData = {
      videos: formattedVideos,
      pagination: {
        currentPage: page,
        totalPages,
        totalVideos,
        hasMore: page < totalPages
      }
    };
    
    // Cache results for a shorter time to ensure freshness
    setCache(cacheKey, responseData, CACHE_TIMES.SHORT);
    
    // Return response with cache headers and disable any browser caching
    return cachedResponse(responseData, {
      maxAge: CACHE_TIMES.SHORT, // 1 minute
      staleWhileRevalidate: CACHE_TIMES.MEDIUM, // 5 minutes
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Lookup': cacheKey,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error("Error searching videos:", error);
    return NextResponse.json(
      { error: "Failed to search videos" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
} 