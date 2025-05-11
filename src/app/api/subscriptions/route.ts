import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { createSubscriptionNotification } from "@/lib/notification-service";

// GET /api/subscriptions - Get user subscriptions
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");
    
    // If creatorId is provided, check if the user is subscribed to this creator
    if (creatorId) {
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.subscriberId, userId),
            eq(subscriptions.creatorId, creatorId)
          )
        )
        .limit(1);
      
      return NextResponse.json({
        isSubscribed: subscription.length > 0,
        subscription: subscription[0] || null
      });
    }
    
    // Otherwise, get all channels the user is subscribed to
    const userSubscriptions = await db
      .select({
        subscription: subscriptions,
        creator: users
      })
      .from(subscriptions)
      .where(eq(subscriptions.subscriberId, userId))
      .innerJoin(users, eq(subscriptions.creatorId, users.clerkId));
    
    return NextResponse.json({
      subscriptions: userSubscriptions.map(item => ({
        ...item.subscription,
        creator: {
          id: item.creator.id,
          name: item.creator.name,
          imageUrl: item.creator.imageUrl,
          channelName: item.creator.channelName || item.creator.name,
          channelHandle: item.creator.channelHandle,
          channelAvatarUrl: item.creator.channelAvatarUrl || item.creator.imageUrl
        }
      }))
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Subscribe to a channel
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { creatorId } = await req.json();
    
    if (!creatorId) {
      return NextResponse.json(
        { error: "Creator ID is required" },
        { status: 400 }
      );
    }
    
    // Check if the creator exists
    const creator = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, creatorId))
      .limit(1);
    
    if (!creator.length) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }
    
    // Check if the user is trying to subscribe to themselves
    if (userId === creatorId) {
      return NextResponse.json(
        { error: "You cannot subscribe to your own channel" },
        { status: 400 }
      );
    }
    
    // Check if the subscription already exists
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriberId, userId),
          eq(subscriptions.creatorId, creatorId)
        )
      )
      .limit(1);
    
    if (existingSubscription.length) {
      return NextResponse.json(
        { error: "Already subscribed", subscription: existingSubscription[0] },
        { status: 400 }
      );
    }
    
    // Create the subscription
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        subscriberId: userId,
        creatorId: creatorId
      })
      .returning();
    
    // Create notification for the channel owner
    await createSubscriptionNotification(userId, creatorId);
    
    return NextResponse.json({
      success: true,
      message: `Subscribed to ${creator[0].channelName || creator[0].name}`,
      subscription
    });
  } catch (error) {
    console.error("Error subscribing:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions - Unsubscribe from a channel
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");
    
    if (!creatorId) {
      return NextResponse.json(
        { error: "Creator ID is required" },
        { status: 400 }
      );
    }
    
    // Delete the subscription
    const deleted = await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriberId, userId),
          eq(subscriptions.creatorId, creatorId)
        )
      )
      .returning();
    
    if (!deleted.length) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Unsubscribed successfully"
    });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
} 