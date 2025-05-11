import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findUserByClerkId(clerkId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
    
    return user;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}

export async function createUser(data: {
  clerkId: string;
  name: string;
  imageUrl: string;
}) {
  try {
    const [user] = await db
      .insert(users)
      .values({
        clerkId: data.clerkId,
        name: data.name,
        imageUrl: data.imageUrl,
      })
      .returning();
    
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function updateUserChannel(
  clerkId: string, 
  data: {
    channelName: string;
    channelHandle: string;
    channelDescription?: string;
    channelLocation?: string;
    channelBannerUrl?: string;
    channelAvatarUrl?: string;
  }
) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        channelName: data.channelName,
        channelHandle: data.channelHandle,
        channelDescription: data.channelDescription,
        channelLocation: data.channelLocation,
        channelBannerUrl: data.channelBannerUrl,
        channelAvatarUrl: data.channelAvatarUrl,
        channelCreatedAt: new Date(),
        hasCompletedOnboarding: true,
      })
      .where(eq(users.clerkId, clerkId))
      .returning();
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user channel:", error);
    return null;
  }
}

export async function hasCompletedOnboarding(clerkId: string) {
  try {
    const user = await findUserByClerkId(clerkId);
    return user?.hasCompletedOnboarding || false;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
} 