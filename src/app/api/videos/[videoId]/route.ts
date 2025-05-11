import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { videos, users, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatVideoForDisplay } from "@/lib/bunny-stream";
import { auth } from "@clerk/nextjs/server";

// Mock video data for demonstration purposes (kept as fallback)
const mockVideos = [
  {
    id: "video1",
    title: "Getting Started with Web Development",
    description: "Learn the basics of HTML, CSS and JavaScript to start your web development journey.",
    thumbnail: "/thumbnails/web-dev.jpg",
    category: "education",
    tags: ["web development", "coding", "html", "css", "javascript"],
    visibility: "public",
    views: "15K",
    likes: 1200,
    publishedAt: "2023-09-15T14:00:00Z",
    channel: {
      id: "tech-talks",
      name: "Tech Talks",
      avatar: "/avatars/tech-talks.jpg",
    }
  },
  {
    id: "video2",
    title: "Modern UI Design Principles",
    description: "Explore the latest trends and best practices in UI design to create beautiful interfaces.",
    thumbnail: "/thumbnails/ui-design.jpg",
    category: "design",
    tags: ["ui design", "ux", "web design", "mobile design"],
    visibility: "public",
    views: "8.2K",
    likes: 750,
    publishedAt: "2023-10-02T10:30:00Z",
    channel: {
      id: "design-hub",
      name: "Design Hub",
      avatar: "/avatars/design-hub.jpg",
    }
  },
  {
    id: "video3",
    title: "Cooking Italian Pasta from Scratch",
    description: "Learn how to make authentic Italian pasta from scratch with simple ingredients.",
    thumbnail: "/thumbnails/pasta.jpg",
    category: "food",
    tags: ["cooking", "italian food", "pasta", "homemade"],
    visibility: "public",
    views: "32K",
    likes: 2800,
    publishedAt: "2023-08-20T15:45:00Z",
    channel: {
      id: "cooking-studio",
      name: "Cooking Studio",
      avatar: "/avatars/cooking-studio.jpg",
    }
  }
];

// Additional dummy video entries to handle any video ID
const generateDummyVideo = (videoId: string) => {
  return {
    id: videoId,
    title: `Video ${videoId}`,
    description: "This is a placeholder for a video that exists in your system but not in our mock data.",
    thumbnail: "/thumbnails/placeholder.jpg",
    category: "other",
    tags: ["placeholder"],
    visibility: "public",
    views: "1K",
    likes: 100,
    publishedAt: new Date().toISOString(),
    channel: {
      id: "current-user-channel",
      name: "Your Channel",
      avatar: "/avatars/default.jpg",
    }
  };
};

// GET /api/videos/[videoId] - Get details of a specific video
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const resolvedParams = await params;
    const videoId = resolvedParams.videoId;

    // Get authentication data for permission checks
    const { userId } = await auth();
    
    // Fetch from database directly
    const result = await db
      .select({
        video: videos,
        user: users,
        category: categories,
      })
      .from(videos)
      .where(eq(videos.videoId, videoId))
      .innerJoin(users, eq(videos.userId, users.clerkId))
      .leftJoin(categories, eq(videos.categoryId, categories.id))
      .limit(1);

    // If video not found in database, fall back to mock data
    if (!result || result.length === 0) {
      // For development, return mock data so UI still works
      let mockVideo = mockVideos.find(v => v.id === videoId);
      if (!mockVideo) {
        mockVideo = generateDummyVideo(videoId);
      }
      
      return NextResponse.json({ 
        video: mockVideo,
        isOwner: true // Mock ownership
      });
    }
    
    // Get the video and user information
    const item = result[0];
    
    // Check if user is the owner of the video
    const isOwner = userId === item.user.clerkId;
    
    // Format the video with user data
    const videoWithUser = formatVideoForDisplay(item.video, item.user);
    
    // Add category information
    const finalResult = {
      ...videoWithUser,
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
      } : null,
      // Add the raw database record data to ensure we have all fields
      dbData: {
        video: item.video,
        user: item.user
      }
    };
    
    return NextResponse.json({ 
      video: finalResult,
      isOwner 
    });
    
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PATCH /api/videos/[videoId] - Update a video
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const resolvedParams = await params;
    const videoId = resolvedParams.videoId;
    
    // Get authentication data
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse the update data from the request
    const updateData = await req.json();
    
    // Fetch the video to check ownership
    const videoResult = await db
      .select({ userId: videos.userId })
      .from(videos)
      .where(eq(videos.videoId, videoId))
      .limit(1);
    
    // If video doesn't exist
    if (!videoResult || videoResult.length === 0) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the owner
    const isOwner = userId === videoResult[0].userId;
    if (!isOwner) {
      return NextResponse.json(
        { error: "You don't have permission to update this video" },
        { status: 403 }
      );
    }
    
    // Convert visibility from the UI to status for the database
    let status = "PUBLIC";
    if (updateData.visibility === "private") {
      status = "PRIVATE";
    } else if (updateData.visibility === "unlisted") {
      status = "UNLISTED";
    }
    
    // Update the video in the database
    await db.update(videos)
      .set({
        title: updateData.title,
        description: updateData.description,
        tags: updateData.tags,
        status: status,
        // Find or create category ID if needed
      })
      .where(eq(videos.videoId, videoId));
    
    // Fetch the updated video
    const updatedVideo = await db
      .select({
        video: videos,
        user: users,
        category: categories,
      })
      .from(videos)
      .where(eq(videos.videoId, videoId))
      .innerJoin(users, eq(videos.userId, users.clerkId))
      .leftJoin(categories, eq(videos.categoryId, categories.id))
      .limit(1);
    
    if (!updatedVideo || updatedVideo.length === 0) {
      return NextResponse.json(
        { error: "Failed to retrieve updated video" },
        { status: 500 }
      );
    }
    
    // Format the video with user data
    const videoWithUser = formatVideoForDisplay(updatedVideo[0].video, updatedVideo[0].user);
    
    return NextResponse.json({ 
      success: true, 
      message: "Video updated successfully",
      video: videoWithUser
    });
    
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE /api/videos/[videoId] - Delete a video
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const resolvedParams = await params;
    const videoId = resolvedParams.videoId;
    
    // Get authentication data
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Fetch the video to check ownership
    const videoResult = await db
      .select({ userId: videos.userId })
      .from(videos)
      .where(eq(videos.videoId, videoId))
      .limit(1);
    
    // If video doesn't exist
    if (!videoResult || videoResult.length === 0) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the owner
    const isOwner = userId === videoResult[0].userId;
    if (!isOwner) {
      return NextResponse.json(
        { error: "You don't have permission to delete this video" },
        { status: 403 }
      );
    }
    
    // Delete the video from the database
    await db.delete(videos)
      .where(eq(videos.videoId, videoId));
    
    return NextResponse.json({ 
      success: true,
      message: "Video deleted successfully" 
    });
    
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 