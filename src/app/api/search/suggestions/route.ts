import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos, categories, users } from "@/db/schema";
import { like, sql, eq, desc, and, or } from "drizzle-orm";
import { CACHE_TIMES, cachedResponse, getCached, setCache } from "@/lib/utils/cache";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }
    
    const searchTerm = query.trim().toLowerCase();
    const cacheKey = `search_suggestions_${searchTerm}`;
    
    // Check if we have cached results
    const cachedSuggestions = getCached(cacheKey);
    if (cachedSuggestions) {
      return cachedResponse(cachedSuggestions);
    }
    
    // Get popular video titles that match the search term
    const relatedTitles = await db
      .select({ title: videos.title })
      .from(videos)
      .where(
        and(
          like(videos.title, `%${searchTerm}%`),
          eq(videos.isReady, true),
          eq(videos.status, "PUBLIC")
        )
      )
      .orderBy(desc(videos.createdAt))
      .limit(8);
    
    // Get categories matching search
    const relatedCategories = await db
      .select({ name: categories.name })
      .from(categories)
      .where(like(categories.name, `%${searchTerm}%`))
      .limit(5);
    
    // Get channels matching search - filter out results with null handles after query
    const relatedChannels = await db
      .select({ 
        name: users.name,
        handle: users.channelHandle 
      })
      .from(users)
      .where(
        or(
          like(users.name, `%${searchTerm}%`),
          like(users.channelHandle, `%${searchTerm}%`)
        )
      )
      .limit(8);
    
    // Filter out channels without handles in JavaScript
    const validChannels = relatedChannels.filter(channel => channel.handle !== null);
    
    // Extract search terms for more variations
    const terms = searchTerm.split(/\s+/).filter(term => term.length > 1);
    
    // Create adult content suggestions
    const adultSuggestions = [
      // Exact match first
      searchTerm,
      
      // Adult content qualifiers
      `${searchTerm} xxx`,
      `hot ${searchTerm}`,
      `${searchTerm} naked`,
      `sexy ${searchTerm}`,
      `${searchTerm} uncensored`,
      `${searchTerm} amateur`,
      `${searchTerm} free full`,
      `${searchTerm} hd`,
      `${searchTerm} homemade`,
      `${searchTerm} explicit`,
      `${searchTerm} private`,
      `${searchTerm} exclusive`,
      `${searchTerm} premium`,
      `${searchTerm} full scene`,
      `${searchTerm} uncut`,
      `${searchTerm} compilation`,
    ];
    
    // Add real data suggestions
    const dbSuggestions = [
      ...relatedTitles.map(item => item.title),
      ...relatedCategories.map(cat => `${searchTerm} ${cat.name.toLowerCase()}`),
      ...validChannels.map(channel => channel.handle ? `${channel.handle.replace(/^@/, '')}` : channel.name),
    ];
    
    // Combine all suggestions, remove duplicates, and limit to 10
    const allSuggestions = [...adultSuggestions, ...dbSuggestions];
    const uniqueSuggestions = Array.from(new Set(allSuggestions))
      .slice(0, 10)
      .filter(Boolean) // Remove any null/undefined values
      .map(suggestion => suggestion.toString().trim()); // Normalize and trim
    
    // Store in cache
    const response = {
      suggestions: uniqueSuggestions,
      query: searchTerm
    };
    
    setCache(cacheKey, response, CACHE_TIMES.SHORT); // Cache for a short time (1 minute)
    
    return cachedResponse(response);
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions", suggestions: [] },
      { status: 500 }
    );
  }
} 