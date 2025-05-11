import { auth } from "@clerk/nextjs/server";
import { updateUserChannel } from "@/lib/user";
import { NextResponse } from "next/server";

// PUT: Update a user's channel information
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    
    const {
      channelName,
      channelHandle,
      channelDescription,
      channelLocation,
      channelBannerUrl,
      channelAvatarUrl,
    } = await request.json();
    
    if (!channelName || !channelHandle) {
      return new NextResponse(JSON.stringify({ error: "Channel name and handle are required" }), {
        status: 400,
      });
    }
    
    const updatedUser = await updateUserChannel(userId, {
      channelName,
      channelHandle,
      channelDescription,
      channelLocation,
      channelBannerUrl,
      channelAvatarUrl,
    });
    
    if (!updatedUser) {
      return new NextResponse(JSON.stringify({ error: "Failed to update channel" }), {
        status: 500,
      });
    }
    
    // Ensure we return the full user object including the ID for redirection
    return new NextResponse(JSON.stringify({
      id: updatedUser.id,
      name: updatedUser.name,
      channelName: updatedUser.channelName,
      channelHandle: updatedUser.channelHandle,
      channelDescription: updatedUser.channelDescription,
      channelLocation: updatedUser.channelLocation,
      channelBannerUrl: updatedUser.channelBannerUrl,
      channelAvatarUrl: updatedUser.channelAvatarUrl,
      hasCompletedOnboarding: updatedUser.hasCompletedOnboarding
    }), { status: 200 });
  } catch (error) {
    console.error("Error updating channel:", error);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
} 