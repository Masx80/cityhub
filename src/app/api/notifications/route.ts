import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { notifications, users, videos } from "@/db/schema";
import { CACHE_TIMES, cachedResponse, getCached, setCache, deleteCache, deleteCacheByPrefix } from "@/lib/utils/cache";

// Function to generate notification cache key
function getNotificationsCacheKey(userId: string, page: number, limit: number, unreadOnly: boolean): string {
  return `notifications_${userId}_${page}_${limit}_${unreadOnly ? 'unread' : 'all'}`;
}

// GET /api/notifications - Get user notifications
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;
    const unreadOnly = searchParams.get("unread") === "true";
    
    // Generate cache key
    const cacheKey = getNotificationsCacheKey(userId, page, limit, unreadOnly);
    
    // Check for cached data
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      // Use a short cache duration for notifications since they change frequently
      return cachedResponse(cachedData, {
        maxAge: CACHE_TIMES.SHORT, // 1 minute
        staleWhileRevalidate: CACHE_TIMES.MEDIUM, // 5 minutes
        private: true, // Private data should not be cached by CDNs
      });
    }
    
    // Prepare base query
    const baseSelect = {
      notification: notifications,
      actor: {
        id: users.id,
        name: users.name,
        imageUrl: users.imageUrl,
        channelName: users.channelName,
        channelHandle: users.channelHandle,
      },
      video: {
        id: videos.id,
        title: videos.title,
        thumbnail: videos.thumbnail,
      }
    };
    
    // Build where condition
    const whereCondition = unreadOnly 
      ? and(eq(notifications.recipientId, userId), eq(notifications.read, false))
      : eq(notifications.recipientId, userId);
    
    // Execute main query
    const userNotifications = await db
      .select(baseSelect)
      .from(notifications)
      .where(whereCondition)
      .innerJoin(users, eq(notifications.actorId, users.clerkId))
      .leftJoin(videos, eq(notifications.videoId, videos.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination using count(*) directly
    const totalResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(notifications)
      .where(eq(notifications.recipientId, userId));
    
    // Get unread count using count(*) directly
    const unreadResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(notifications)
      .where(and(
        eq(notifications.recipientId, userId),
        eq(notifications.read, false)
      ));
    
    const total = totalResult[0]?.count || 0;
    const unreadCount = unreadResult[0]?.count || 0;
    
    // Prepare response data
    const responseData = {
      notifications: userNotifications.map(item => ({
        id: item.notification.id,
        type: item.notification.type,
        content: item.notification.content,
        read: item.notification.read,
        createdAt: item.notification.createdAt,
        actor: {
          id: item.actor.id,
          name: item.actor.name,
          imageUrl: item.actor.imageUrl,
          channelName: item.actor.channelName || item.actor.name,
          channelHandle: item.actor.channelHandle,
        },
        video: item.video ? {
          id: item.video.id,
          title: item.video.title,
          thumbnail: item.video.thumbnail,
        } : null,
      })),
      pagination: {
        total,
        unreadCount,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    };
    
    // Cache the response for a short period
    setCache(cacheKey, responseData, CACHE_TIMES.SHORT);
    
    // Return cached response
    return cachedResponse(responseData, {
      maxAge: CACHE_TIMES.SHORT,
      staleWhileRevalidate: CACHE_TIMES.MEDIUM,
      private: true,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return cachedResponse(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications/read - Mark notifications as read
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { notificationIds } = await req.json();
    
    if (!notificationIds) {
      // Mark all notifications as read
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.recipientId, userId));
        
      // Clear all notification cache for this user
      deleteCacheByPrefix(`notifications_${userId}`);
    } else if (Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      for (const id of notificationIds) {
        await db
          .update(notifications)
          .set({ read: true })
          .where(and(
            eq(notifications.id, id),
            eq(notifications.recipientId, userId)
          ));
      }
      
      // Clear all notification cache for this user since counts have changed
      deleteCacheByPrefix(`notifications_${userId}`);
    } else {
      // Mark a single notification as read
      await db
        .update(notifications)
        .set({ read: true })
        .where(and(
          eq(notifications.id, notificationIds),
          eq(notifications.recipientId, userId)
        ));
        
      // Clear all notification cache for this user since counts have changed
      deleteCacheByPrefix(`notifications_${userId}`);
    }
    
    return NextResponse.json({
      success: true,
      message: "Notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
} 