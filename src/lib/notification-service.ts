import { db } from "@/db";
import { notifications, users, videos } from "@/db/schema";
import { eq } from "drizzle-orm";

type NotificationType = "like" | "dislike" | "subscription" | "comment";

interface CreateNotificationParams {
  type: NotificationType;
  actorId: string; // User who performed the action
  recipientId: string; // User receiving the notification
  videoId?: string; // Optional, for video-related notifications
  commentId?: string; // Optional, for comment notifications
  content?: string; // Optional additional context
}

/**
 * Creates a notification in the database
 */
export async function createNotification({
  type,
  actorId,
  recipientId,
  videoId,
  commentId,
  content
}: CreateNotificationParams) {
  // Don't create notifications for self-actions
  if (actorId === recipientId) {
    return null;
  }

  try {
    // Create the notification
    const [notification] = await db.insert(notifications).values({
      type,
      actorId,
      recipientId,
      videoId,
      commentId,
      content,
      read: false
    }).returning();

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Creates a like notification
 */
export async function createLikeNotification(userId: string, videoId: string) {
  try {
    // Get the video details first
    const video = await db.query.videos.findFirst({
      where: eq(videos.id, videoId),
    });

    if (!video) {
      throw new Error("Video not found");
    }

    // Get video creator ID
    const recipientId = video.userId;
    
    // Get video title for content
    const content = video.title;

    return createNotification({
      type: "like",
      actorId: userId,
      recipientId,
      videoId,
      content
    });
  } catch (error) {
    console.error("Error creating like notification:", error);
    return null;
  }
}

/**
 * Creates a subscription notification
 */
export async function createSubscriptionNotification(subscriberId: string, creatorId: string) {
  try {
    return createNotification({
      type: "subscription",
      actorId: subscriberId,
      recipientId: creatorId,
    });
  } catch (error) {
    console.error("Error creating subscription notification:", error);
    return null;
  }
}

/**
 * Creates a comment notification
 */
export async function createCommentNotification(userId: string, videoId: string, commentId: string, content: string) {
  try {
    // Get the video details first
    const video = await db.query.videos.findFirst({
      where: eq(videos.id, videoId),
    });

    if (!video) {
      throw new Error("Video not found");
    }

    // Get video creator ID
    const recipientId = video.userId;

    return createNotification({
      type: "comment",
      actorId: userId,
      recipientId,
      videoId,
      commentId,
      content
    });
  } catch (error) {
    console.error("Error creating comment notification:", error);
    return null;
  }
} 