import { NextResponse } from "next/server";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { formatVideoForDisplay } from "@/lib/bunny-stream";
import { auth } from "@clerk/nextjs/server";

// Define page size for pagination
const PAGE_SIZE = 8;

export async function GET(req: Request, { params }: { params: Promise<{ channelId: string }> }) {
  try {
    // Await the params Promise
    const resolvedParams = await params;
    const channelId = resolvedParams.channelId;
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    
    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }
    
    // Get current user for auth check
    const { userId } = await auth();
    console.log(`Videos API - Channel ID: ${channelId}, Current user ID: ${userId || 'Not authenticated'}`);
    
    // Calculate offset for pagination
    const offset = (page - 1) * PAGE_SIZE;
    
    // Generate handle variations for more flexible matching
    const handleVariations = [
      channelId,
      channelId.startsWith("@") ? channelId : `@${channelId}`,
      channelId.startsWith("@") ? channelId.substring(1) : channelId
    ];
    
    console.log(`Trying handle variations for videos: ${handleVariations.join(', ')}`);
    
    // Try to find user by any of the handle variations
    const userQuery = await db
      .select()
      .from(users)
      .where(
        or(
          ...handleVariations.map(handle => eq(users.channelHandle, handle))
        )
      );
    
    // If not found by any handle variation, try looking up by clerkId
    const user = userQuery.length > 0 
      ? userQuery[0] 
      : (await db.select().from(users).where(eq(users.clerkId, channelId)))[0];
    
    if (!user) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404 }
      );
    }
    
    console.log(`Found user for channel ${channelId}: ${user.name}, clerkId: ${user.clerkId}`);
    
    // Determine if current user is owner
    const isOwner = userId === user.clerkId;
    console.log(`Current user ${userId} is ${isOwner ? 'owner' : 'not owner'} of this channel`);
    
    // Expand query to include draft videos if owner
    const videoConditions = isOwner
      ? [
          eq(videos.userId, user.clerkId),
          eq(videos.isReady, true),
        ]
      : [
          eq(videos.userId, user.clerkId),
          eq(videos.isReady, true),
          eq(videos.status, "PUBLIC")
        ];
    
    // Now fetch videos for this user
    const results = await db
      .select({
        video: videos,
        user: users,
      })
      .from(videos)
      .where(and(...videoConditions))
      .orderBy(desc(videos.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset)
      .innerJoin(users, eq(videos.userId, users.clerkId));
    
    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(videos)
      .where(and(...videoConditions));
    
    const totalVideos = countResult?.count || 0;
    const totalPages = Math.ceil(totalVideos / PAGE_SIZE);
    
    // Format results for the frontend and add isOwner to each video
    const formattedVideos = results.map(item => {
      const formattedVideo = formatVideoForDisplay(item.video, item.user);
      return {
        ...formattedVideo,
        isOwner // Add isOwner flag to each video
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
    console.error("Error fetching channel videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel videos" },
      { status: 500 }
    );
  }
} 