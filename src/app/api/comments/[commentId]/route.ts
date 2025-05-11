import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// Schema validation for updating a comment
const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

// GET handler for retrieving a specific comment with its replies
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    // Await the params Promise
    const resolvedParams = await params;
    const commentId = resolvedParams.commentId;

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    // Fetch the comment with its replies
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
      with: {
        user: {
          columns: {
            name: true,
            imageUrl: true,
            channelHandle: true,
          },
        },
        // Include replies to this comment
        replies: {
          with: {
            user: {
              columns: {
                name: true,
                imageUrl: true,
                channelHandle: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    // Await the params Promise
    const resolvedParams = await params;
    const commentId = resolvedParams.commentId;
    
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = updateCommentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { content } = validationResult.data;

    // First check if this comment belongs to the user
    const existingComment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
      columns: {
        userId: true,
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.userId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to update this comment" },
        { status: 403 }
      );
    }

    // Update the comment
    const updatedComment = await db.update(comments)
      .set({
        content,
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();

    return NextResponse.json(updatedComment[0]);
  } catch (error) {
    console.error("[COMMENT_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    // Await the params Promise
    const resolvedParams = await params;
    const commentId = resolvedParams.commentId;
    
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First check if this comment belongs to the user
    const existingComment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
      columns: {
        userId: true,
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.userId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to delete this comment" },
        { status: 403 }
      );
    }

    // Delete the comment
    await db.delete(comments)
      .where(eq(comments.id, commentId));

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("[COMMENT_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
