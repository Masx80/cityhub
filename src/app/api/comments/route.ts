import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// Schema validation for creating a comment
const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  videoId: z.string(), // Accept any string format for video ID
  parentId: z.string().uuid().optional(),
});

// GET handler for retrieving comments for a video
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");
    
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    console.log(`[COMMENTS_GET] Fetching comments for videoId: ${videoId}`);
    
    try {
      // Simplified query - only get comments without relationships
      const videoComments = await db.select().from(comments)
        .where(and(
          eq(comments.videoId, videoId),
          isNull(comments.parentId)
        ))
        .orderBy(desc(comments.createdAt));

      console.log(`[COMMENTS_GET] Found ${videoComments.length} comments for videoId: ${videoId}`);
      return NextResponse.json(videoComments);
    } catch (dbError) {
      console.error("[COMMENTS_GET] Database query error:", dbError);
      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("[COMMENTS_GET] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new comment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.error("[COMMENTS_POST] Unauthorized request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("[COMMENTS_POST] Received comment data:", JSON.stringify(body));
    
    const validationResult = createCommentSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("[COMMENTS_POST] Validation error:", validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { content, videoId, parentId } = validationResult.data;
    
    console.log(`[COMMENTS_POST] Creating comment for videoId: ${videoId}, userId: ${userId}`);
    
    try {
      // Create the comment in the database
      const newComment = await db.insert(comments).values({
        content,
        userId,
        videoId,
        parentId: parentId || null,
      }).returning();
      
      console.log(`[COMMENTS_POST] Comment created successfully with id: ${newComment[0]?.id}`);
      return NextResponse.json(newComment[0]);
    } catch (dbError) {
      console.error("[COMMENTS_POST] Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save comment to database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[COMMENTS_POST] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
} 