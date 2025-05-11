import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";
import { mockChannels } from "@/lib/mock-data";

// GET all channels
export async function GET() {
  try {
    // Fetch all users who have completed onboarding (have channel setup)
    const allChannels = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.hasCompletedOnboarding, true),
    });
    
    // If no channels are found in the database, use mock data
    if (!allChannels || allChannels.length === 0) {
      console.log("No channels found in database, using mock data");
      return NextResponse.json(mockChannels);
    }
    
    // Format the response
    const formattedChannels = allChannels.map(user => ({
      id: user.id,
      name: user.channelName || user.name || "Unnamed Channel",
      handle: user.channelHandle || `@user-${user.id.substring(0, 8)}`,
      description: user.channelDescription || "No description available",
      avatar: user.channelAvatarUrl || user.imageUrl,
      banner: user.channelBannerUrl,
      joinDate: user.channelCreatedAt ? new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(new Date(user.channelCreatedAt)) : "Recently",
    }));
    
    return NextResponse.json(formattedChannels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    console.log("Returning mock data due to error");
    // Return mock data on error
    return NextResponse.json(mockChannels);
  }
} 