import { db } from "@/db";
import { categories } from "@/db/schema";
import { NextResponse } from "next/server";
import { CACHE_TIMES, cachedResponse, getCached, setCache } from "@/lib/utils/cache";

// Cache the response for 1 hour
export const revalidate = 3600;

// Cache key for categories
const CATEGORIES_CACHE_KEY = "all_categories";

export async function GET() {
  try {
    // Check if we have cached categories
    const cachedCategories = getCached<any[]>(CATEGORIES_CACHE_KEY);
    
    if (cachedCategories) {
      return cachedResponse(cachedCategories, {
        maxAge: CACHE_TIMES.VERY_LONG, // 1 hour
        staleWhileRevalidate: CACHE_TIMES.DAY, // 24 hours
      });
    }
    
    // If not cached, fetch from database
    const categoryList = await db.select().from(categories);
    
    // Cache the result
    setCache(CATEGORIES_CACHE_KEY, categoryList, CACHE_TIMES.VERY_LONG);
    
    // Return with cache headers
    return cachedResponse(categoryList, {
      maxAge: CACHE_TIMES.VERY_LONG,
      staleWhileRevalidate: CACHE_TIMES.DAY,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    
    return cachedResponse(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
