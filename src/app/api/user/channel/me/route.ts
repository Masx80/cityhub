import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET current user's channel
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Find the user in our database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Add caching headers
    const headers = new Headers();
    headers.set('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes
    
    // Return the channel information
    return NextResponse.json({
      id: user.id,
      channelName: user.channelName,
      channelHandle: user.channelHandle,
      channelDescription: user.channelDescription,
      channelAvatarUrl: user.channelAvatarUrl,
      channelBannerUrl: user.channelBannerUrl,
      channelCreatedAt: user.channelCreatedAt,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    }, {
      headers
    });
  } catch (error) {
    console.error("Error fetching user channel:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 