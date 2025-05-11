"use server";

import { db } from "@/db";
import { comments } from "@/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema validation for creating a comment
const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  videoId: z.string(),
  parentId: z.string().uuid().optional(),
});

// Schema validation for updating a comment
const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});

/**
 * Add a comment to a video
 */
export async function addComment(formData: FormData | { content: string; videoId: string; parentId?: string }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401
      };
    }

    // Handle both FormData and direct object input
    let content: string;
    let videoId: string;
    let parentId: string | undefined;

    if (formData instanceof FormData) {
      content = formData.get('content') as string;
      videoId = formData.get('videoId') as string;
      parentId = formData.get('parentId') as string || undefined;
    } else {
      content = formData.content;
      videoId = formData.videoId;
      parentId = formData.parentId;
    }

    // Validate the data
    const validationResult = createCommentSchema.safeParse({ 
      content, 
      videoId, 
      parentId 
    });
    
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid comment data",
        validationErrors: validationResult.error.errors,
        status: 400
      };
    }
    
    const validatedData = validationResult.data;
    
    // Create the comment in the database
    const newComment = await db.insert(comments).values({
      content: validatedData.content,
      userId,
      videoId: validatedData.videoId,
      parentId: validatedData.parentId || null,
    }).returning();

    if (!newComment || newComment.length === 0) {
      return {
        success: false,
        error: "Failed to save comment",
        status: 500
      };
    }
    
    // Revalidate the watch page
    revalidatePath(`/watch/${videoId}`);
    
    return {
      success: true,
      comment: newComment[0],
      message: "Comment added successfully"
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
}

/**
 * Update an existing comment
 */
export async function updateComment(commentId: string, content: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401
      };
    }
    
    // Validate the content
    const validationResult = updateCommentSchema.safeParse({ content });
    
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid comment content",
        validationErrors: validationResult.error.errors,
        status: 400
      };
    }

    // Check if this comment belongs to the user
    const existingComment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
      columns: {
        userId: true,
        videoId: true,
      },
    });

    if (!existingComment) {
      return {
        success: false,
        error: "Comment not found",
        status: 404
      };
    }

    if (existingComment.userId !== userId) {
      return {
        success: false,
        error: "You are not authorized to update this comment",
        status: 403
      };
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

    if (!updatedComment || updatedComment.length === 0) {
      return {
        success: false,
        error: "Failed to update comment",
        status: 500
      };
    }
    
    // Revalidate the watch page
    revalidatePath(`/watch/${existingComment.videoId}`);
    
    return {
      success: true,
      comment: updatedComment[0],
      message: "Comment updated successfully"
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401
      };
    }

    // Check if this comment belongs to the user
    const existingComment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
      columns: {
        userId: true,
        videoId: true,
      },
    });

    if (!existingComment) {
      return {
        success: false,
        error: "Comment not found",
        status: 404
      };
    }

    if (existingComment.userId !== userId) {
      return {
        success: false,
        error: "You are not authorized to delete this comment",
        status: 403
      };
    }

    // Delete the comment
    await db.delete(comments).where(eq(comments.id, commentId));
    
    // Revalidate the watch page
    revalidatePath(`/watch/${existingComment.videoId}`);
    
    return {
      success: true,
      message: "Comment deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
}

/**
 * Get comments for a video
 */
export async function getVideoComments(videoId: string) {
  try {
    if (!videoId) {
      return {
        success: false,
        error: "Video ID is required",
        status: 400
      };
    }

    // Get top-level comments (those without a parent)
    const videoComments = await db.select().from(comments)
      .where(and(
        eq(comments.videoId, videoId),
        isNull(comments.parentId)
      ))
      .orderBy(desc(comments.createdAt));

    return {
      success: true,
      comments: videoComments
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
}

/**
 * Get a specific comment with replies
 */
export async function getCommentWithReplies(commentId: string) {
  try {
    if (!commentId) {
      return {
        success: false,
        error: "Comment ID is required",
        status: 400
      };
    }

    // Fetch the comment with its replies
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, commentId),
      with: {
        replies: {
          orderBy: [desc(comments.createdAt)]
        }
      }
    });

    if (!comment) {
      return {
        success: false,
        error: "Comment not found",
        status: 404
      };
    }

    return {
      success: true,
      comment
    };
  } catch (error) {
    console.error("Error fetching comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500
    };
  }
} 