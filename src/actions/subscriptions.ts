"use server";

import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSubscriptionNotification } from "@/lib/notification-service";

export async function subscribe(creatorId: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401
      };
    }
    
    if (!creatorId) {
      return {
        success: false,
        error: "Creator ID is required",
        status: 400
      };
    }

    // Prevent self-subscription
    if (userId === creatorId) {
      return {
        success: false,
        error: "You cannot subscribe to your own channel",
        status: 400
      };
    }

    // Check if already subscribed
    const existingSubscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.subscriberId, userId),
        eq(subscriptions.creatorId, creatorId)
      )
    });

    if (existingSubscription) {
      return {
        success: false,
        error: "You're already subscribed to this channel",
        status: 400
      };
    }

    // Add subscription
    await db.insert(subscriptions).values({
      subscriberId: userId,
      creatorId: creatorId
    });

    // Create notification
    await createSubscriptionNotification(userId, creatorId);

    // Get updated subscriber count
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.creatorId, creatorId));

    const subscriberCount = result?.count || 0;

    // Revalidate paths
    revalidatePath('/channel/[username]');
    revalidatePath('/watch/[videoId]');
    
    return {
      success: true,
      message: "Subscribed successfully",
      subscriberCount
    };
  } catch (error) {
    console.error("Error subscribing:", error);
    return {
      success: false,
      error: "Failed to subscribe",
      status: 500
    };
  }
}

export async function unsubscribe(creatorId: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401
      };
    }
    
    if (!creatorId) {
      return {
        success: false,
        error: "Creator ID is required",
        status: 400
      };
    }

    // Check if subscription exists
    const existingSubscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.subscriberId, userId),
        eq(subscriptions.creatorId, creatorId)
      )
    });

    if (!existingSubscription) {
      return {
        success: false,
        error: "You are not subscribed to this channel",
        status: 400
      };
    }

    // Remove subscription
    await db.delete(subscriptions).where(
      and(
        eq(subscriptions.subscriberId, userId),
        eq(subscriptions.creatorId, creatorId)
      )
    );

    // Get updated subscriber count
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.creatorId, creatorId));

    const subscriberCount = result?.count || 0;

    // Revalidate paths
    revalidatePath('/channel/[username]');
    revalidatePath('/watch/[videoId]');
    
    return {
      success: true,
      message: "Unsubscribed successfully",
      subscriberCount
    };
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return {
      success: false,
      error: "Failed to unsubscribe",
      status: 500
    };
  }
}

export async function checkSubscriptionStatus(creatorId: string) {
  try {
    const { userId } = await auth();
    
    if (!creatorId) {
      return {
        success: false,
        error: "Creator ID is required",
        status: 400
      };
    }

    // Get subscriber count
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.creatorId, creatorId));

    const subscriberCount = result?.count || 0;

    // If user is not logged in, just return the count
    if (!userId) {
      return {
        success: true,
        subscriberCount,
        isSubscribed: false
      };
    }

    // Check if user is subscribed
    const existingSubscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.subscriberId, userId),
        eq(subscriptions.creatorId, creatorId)
      )
    });

    return {
      success: true,
      isSubscribed: !!existingSubscription,
      subscriberCount
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return {
      success: false,
      error: "Failed to check subscription status",
      status: 500
    };
  }
} 