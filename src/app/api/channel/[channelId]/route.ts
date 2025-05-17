import { db } from "@/db";
import { users, subscriptions, videos, videoLikes } from "@/db/schema";
import { eq, ilike, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET channel by handle or name
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  try {
    // Await the params Promise
    const resolvedParams = await params;
    const channelHandle = resolvedParams.channelId;
    
    if (!channelHandle) {
      return NextResponse.json({ error: "Channel handle is required" }, { status: 400 });
    }
    
    // Get current user to check if this is the owner's channel
    const authHeader = request.headers.get('Authorization');
    const userId = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    console.log(`API - Channel ID: ${channelHandle}, Current user ID: ${userId || 'Not authenticated'}`);
    
    // Determine if this is a handle or name lookup
    const isHandleLookup = /^[a-zA-Z0-9_@]+$/.test(channelHandle);
    
    try {
      let channel;
      
      if (isHandleLookup) {
        // Try three variations: as-is, with @ prefix, and without @ prefix
        const handleVariations = [
          channelHandle,
          channelHandle.startsWith("@") ? channelHandle : `@${channelHandle}`,
          channelHandle.startsWith("@") ? channelHandle.substring(1) : channelHandle
        ];
        
        console.log(`Trying handle variations: ${handleVariations.join(', ')}`);
        
        // Try each variation
        for (const handle of handleVariations) {
          const result = await db.query.users.findFirst({
            where: eq(users.channelHandle, handle),
            columns: {
              id: true,
              clerkId: true,
              name: true,
              imageUrl: true,
              channelName: true,
              channelDescription: true,
              channelLocation: true,
              channelBannerUrl: true,
              channelAvatarUrl: true,
              channelCreatedAt: true,
              channelHandle: true,
              hasCompletedOnboarding: true,
            }
          });
          
          if (result) {
            channel = result;
            break;
          }
        }
        
        // If no matches with handle variations, fallback to direct lookup
        if (!channel) {
          channel = await db.query.users.findFirst({
            where: eq(users.channelHandle, channelHandle),
            columns: {
              id: true,
              clerkId: true,
              name: true,
              imageUrl: true,
              channelName: true,
              channelDescription: true,
              channelLocation: true,
              channelBannerUrl: true,
              channelAvatarUrl: true,
              channelCreatedAt: true,
              channelHandle: true,
              hasCompletedOnboarding: true,
            }
          });
        }
      } else {
        // Lookup by name as fallback
        channel = await db.query.users.findFirst({
          where: ilike(users.channelName, `%${channelHandle}%`),
          columns: {
            id: true,
            clerkId: true,
            name: true,
            imageUrl: true,
            channelName: true,
            channelDescription: true,
            channelLocation: true,
            channelBannerUrl: true,
            channelAvatarUrl: true,
            channelCreatedAt: true,
            channelHandle: true,
            hasCompletedOnboarding: true,
          }
        });
      }
      
      if (channel) {
        // Check if current user is the channel owner
        const isOwner = userId === channel.clerkId;
        console.log(`Found channel for ${channelHandle} with ID: ${channel.id}, clerkId: ${channel.clerkId}`);
        console.log(`Current user ${userId} is ${isOwner ? 'owner' : 'not owner'} of this channel`);
        console.log(`User ID: ${userId}, Channel clerkId: ${channel.clerkId}, isOwner: ${isOwner}`);
        
        // Only return the channel if it has completed onboarding or the current user is the owner
        if (!channel.hasCompletedOnboarding && !isOwner) {
          return NextResponse.json({ error: "Channel not available" }, { status: 404 });
        }
        
        // Get subscriber count (joined in a single efficient query)
        const [subscriptionResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(subscriptions)
          .where(eq(subscriptions.creatorId, channel.clerkId));
          
        const subscriberCount = subscriptionResult?.count || 0;
        
        // Get video like count as a proxy for popularity/views
        const [likesResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(videoLikes)
          .innerJoin(videos, eq(videoLikes.videoId, videos.id))
          .where(eq(videos.userId, channel.clerkId));
          
        const likeCount = likesResult?.count || 0;
        
        // Simulate view count based on likes
        const estimatedViews = likeCount * 50;
        
        // Format the response
        const formattedChannel = {
          id: channel.id,
          name: channel.channelName || channel.name || "Unnamed Channel",
          handle: channel.channelHandle || `@${channelHandle.replace(/^@/, '')}`,
          description: channel.channelDescription || "No description available",
          location: channel.channelLocation,
          avatar: channel.channelAvatarUrl 
            ? (channel.channelAvatarUrl.startsWith('https://') 
                ? channel.channelAvatarUrl 
                : `https://sexcityhub.b-cdn.net/${channel.channelAvatarUrl}`)
            : channel.imageUrl
              ? (channel.imageUrl.startsWith('https://') 
                  ? channel.imageUrl 
                  : `https://sexcityhub.b-cdn.net/${channel.imageUrl}`)
              : "/avatars/default.jpg",
          banner: channel.channelBannerUrl
            ? (channel.channelBannerUrl.startsWith('https://') 
                ? channel.channelBannerUrl 
                : `https://sexcityhub.b-cdn.net/${channel.channelBannerUrl}`)
            : null,
          joinDate: channel.channelCreatedAt ? new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }).format(new Date(channel.channelCreatedAt)) : "Recently",
          subscribers: subscriberCount,
          views: estimatedViews,
          isOwner,
        };
        
        // Return response with cache headers
        return new NextResponse(JSON.stringify(formattedChannel), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            // Disable caching entirely for debugging
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      }
      
      // Fall back to mock data for demo or development
      const mockChannel = {
        id: `mock-${channelHandle}`,
        name: channelHandle.replace(/-|@/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        handle: channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`,
        description: "This is a temporary channel for demonstration purposes.",
        location: "Worldwide",
        avatar: "/avatars/default.jpg",
        banner: "/banners/default-banner.jpg",
        joinDate: new Intl.DateTimeFormat('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }).format(new Date()),
        subscribers: 0,
        views: 0,
        isOwner: false
      };
      
      // Return the mock channel with appropriate cache headers
      return new NextResponse(JSON.stringify(mockChannel), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' // Short cache time for mock data
        }
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // Return a generic error with proper error code
      return NextResponse.json({ error: "Failed to retrieve channel data" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching channel:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 