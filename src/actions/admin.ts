"use server";

import { db } from "@/db";
import { 
  users, videos, categories, comments, subscriptions,
  videoLikes, videoDislikes, notifications, videoHistory, watchLater 
} from "@/db/schema";
import { eq, sql, desc, asc, and, like, count, or } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { errorHandler } from "@/lib/error-handler";
import { neon } from "@neondatabase/serverless";

// Setup a direct neon connection for raw SQL queries
const neonSQL = neon(process.env.DATABASE_URL!);

// Helper function to combine conditions with OR
function orConditions(...conditions) {
  return sql`(${sql.join(conditions, sql` OR `)})`;
}

export async function getAdminDashboardStats() {
  try {
    const userCount = await db
      .select({ count: count() })
      .from(users)
      .then((result) => result[0].count);
    
    const videoCount = await db
      .select({ count: count() })
      .from(videos)
      .then((result) => result[0].count);
    
    const totalViews = await db
      .select({ 
        count: sql<number>`CAST(COUNT(*) AS INTEGER)` 
      })
      .from(videoHistory)
      .then((result) => result[0].count);
    
    const pendingVideosCount = await db
      .select({ count: count() })
      .from(videos)
      .where(eq(videos.status, "PROCESSING"))
      .then((result) => result[0].count);
    
    const reportedCommentsCount = await db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.type, "report"))
      .then((result) => result[0].count);

    return { 
      userCount, 
      videoCount, 
      totalViews, 
      pendingVideosCount,
      reportedCommentsCount 
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw new Error("Failed to fetch admin stats");
  }
}

export async function getViewsOverTime(days: number = 30) {
  try {
    const viewsData = await db
      .select({
        date: sql<string>`to_char(${videoHistory.watchedAt}, 'MM/DD')`,
        count: count(),
      })
      .from(videoHistory)
      .where(
        sql`${videoHistory.watchedAt} > CURRENT_DATE - INTERVAL '${days} days'`
      )
      .groupBy(sql`to_char(${videoHistory.watchedAt}, 'MM/DD')`)
      .orderBy(sql`to_char(${videoHistory.watchedAt}, 'MM/DD')`)
      
    return viewsData.map(item => ({
      date: item.date,
      views: Number(item.count)
    }));
  } catch (error) {
    console.error("Error fetching views over time:", error);
    return [];
  }
}

export async function getCategoryDistribution() {
  try {
    const categoryData = await db
      .select({
        name: categories.name,
        count: count(),
      })
      .from(videos)
      .leftJoin(categories, eq(videos.categoryId, categories.id))
      .groupBy(categories.name)
      .orderBy(desc(count()));
    
    const colors = [
      "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
      "#ec4899", "#ef4444", "#14b8a6", "#84cc16", "#06b6d4"
    ];
    
    return categoryData.map((item, index) => ({
      name: item.name || "Uncategorized",
      value: Number(item.count),
      color: colors[index % colors.length]
    }));
  } catch (error) {
    console.error("Error fetching category distribution:", error);
    return [];
  }
}

export async function getRecentVideos(limit: number = 10) {
  try {
    const recentVideos = await db
      .select({
        id: videos.id,
        title: videos.title,
        status: videos.status,
        createdAt: videos.createdAt,
        userId: videos.userId,
        userName: users.name,
        thumbnail: videos.thumbnail,
      })
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.clerkId))
      .orderBy(desc(videos.createdAt))
      .limit(limit);
    
    // Get view counts for each video
    const videosWithStats = await Promise.all(
      recentVideos.map(async (video) => {
        const views = await db
          .select({ count: count() })
          .from(videoHistory)
          .where(eq(videoHistory.videoId, video.id))
          .then(result => result[0].count);
        
        const likes = await db
          .select({ count: count() })
          .from(videoLikes)
          .where(eq(videoLikes.videoId, video.id))
          .then(result => result[0].count);
        
        return {
          ...video,
          views: Number(views),
          likes: Number(likes),
        };
      })
    );
    
    return videosWithStats;
  } catch (error) {
    console.error("Error fetching recent videos:", error);
    return [];
  }
}

export async function getRecentUsers(limit: number = 10) {
  try {
    const recentUsers = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        name: users.name,
        email: sql<string>`'user@example.com'`, // In a real app, get from Clerk
        status: sql<string>`CASE WHEN ${users.hasCompletedOnboarding} THEN 'active' ELSE 'pending' END`,
        createdAt: users.createdAt,
        channelName: users.channelName,
        imageUrl: users.imageUrl,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);
    
    // Get video and subscriber counts for each user
    const usersWithStats = await Promise.all(
      recentUsers.map(async (user) => {
        const videoCount = await db
          .select({ count: count() })
          .from(videos)
          .where(eq(videos.userId, user.clerkId))
          .then(result => result[0].count);
        
        const subscriberCount = await db
          .select({ count: count() })
          .from(subscriptions)
          .where(eq(subscriptions.creatorId, user.clerkId))
          .then(result => result[0].count);
        
        return {
          ...user,
          videos: Number(videoCount),
          subscribers: Number(subscriberCount),
        };
      })
    );
    
    return usersWithStats;
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return [];
  }
}

export async function getAllUsers(
  page: number = 1, 
  limit: number = 10,
  search: string = ""
) {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build search condition if search query is provided
    const whereClause = search
      ? like(users.name, `%${search}%`)
      : undefined;
    
    // Count total users matching the criteria
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause)
      .then(result => result[0].count);
    
    // Fetch users with pagination
    const userResults = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        name: users.name,
        imageUrl: users.imageUrl,
        channelName: users.channelName,
        channelHandle: users.channelHandle,
        createdAt: users.createdAt,
        hasCompletedOnboarding: users.hasCompletedOnboarding,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get video and subscriber counts for each user
    const usersWithStats = await Promise.all(
      userResults.map(async (user) => {
        const videoCount = await db
          .select({ count: count() })
          .from(videos)
          .where(eq(videos.userId, user.clerkId))
          .then(result => result[0].count);
        
        const subscriberCount = await db
          .select({ count: count() })
          .from(subscriptions)
          .where(eq(subscriptions.creatorId, user.clerkId))
          .then(result => result[0].count);
        
        return {
          ...user,
          videoCount: Number(videoCount),
          subscriberCount: Number(subscriberCount),
          status: user.hasCompletedOnboarding ? "active" : "pending"
        };
      })
    );
    
    return {
      users: usersWithStats,
      meta: {
        total: Number(totalResult),
        page,
        limit,
        totalPages: Math.ceil(Number(totalResult) / limit),
      }
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty result in case of error
    return {
      users: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
    };
  }
}

export async function getAllVideos(
  page: number = 1, 
  limit: number = 10,
  search: string = "",
  status: string = ""
) {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let whereConditions = [];
    
    // Add search condition if search query is provided
    if (search) {
      whereConditions.push(like(videos.title, `%${search}%`));
    }
    
    // Add status condition if status is provided
    if (status) {
      whereConditions.push(eq(videos.status, status));
    }
    
    // Combine all conditions with AND
    const whereClause = whereConditions.length > 0
      ? and(...whereConditions)
      : undefined;
    
    // Count total videos matching the criteria
    const totalResult = await db
      .select({ count: count() })
      .from(videos)
      .where(whereClause)
      .then(result => result[0].count);
    
    // Fetch videos with pagination
    const videoResults = await db
      .select({
        id: videos.id,
        videoId: videos.videoId,
        title: videos.title,
        status: videos.status,
        thumbnail: videos.thumbnail,
        createdAt: videos.createdAt,
        userId: videos.userId,
      })
      .from(videos)
      .where(whereClause)
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get user names for all videos
    const userIds = [...new Set(videoResults.map(video => video.userId))];
    
    const userInfoMap = new Map();
    
    // Fetch user information if we have videos
    if (userIds.length > 0) {
      const userInfoResults = await db
        .select({
          clerkId: users.clerkId,
          name: users.name,
          imageUrl: users.imageUrl,
        })
        .from(users)
        .where(
          sql`${users.clerkId} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`
        );
      
      // Create a map of userId to user info
      userInfoResults.forEach(user => {
        userInfoMap.set(user.clerkId, {
          name: user.name,
          imageUrl: user.imageUrl,
        });
      });
    }
    
    // Get view and like counts for each video
    const videosWithDetails = await Promise.all(
      videoResults.map(async (video) => {
        const views = await db
          .select({ count: count() })
          .from(videoHistory)
          .where(eq(videoHistory.videoId, video.id))
          .then(result => result[0].count);
        
        const likes = await db
          .select({ count: count() })
          .from(videoLikes)
          .where(eq(videoLikes.videoId, video.id))
          .then(result => result[0].count);
        
        const userInfo = userInfoMap.get(video.userId) || { name: 'Unknown User', imageUrl: '' };
        
        return {
          ...video,
          userName: userInfo.name,
          userImage: userInfo.imageUrl,
          views: Number(views),
          likes: Number(likes)
        };
      })
    );
    
    return {
      videos: videosWithDetails,
      meta: {
        total: Number(totalResult),
        page,
        limit,
        totalPages: Math.ceil(Number(totalResult) / limit),
      }
    };
  } catch (error) {
    console.error("Error fetching videos:", error);
    // Return empty result in case of error
    return {
      videos: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
    };
  }
}

export async function updateVideoStatus(id: string, status: string) {
  try {
    const [updatedVideo] = await db
      .update(videos)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, id))
      .returning();
    
    return updatedVideo;
  } catch (error) {
    console.error("Error updating video status:", error);
    throw new Error("Failed to update video status");
  }
}

export async function updateUserStatus(clerkId: string, isSuspended: boolean) {
  try {
    // In a real application, you would integrate with Clerk Admin API
    // to suspend/unsuspend the user
    
    // First check if user exists
    const userResult = await db
      .select({
        id: users.id,
        hasCompletedOnboarding: users.hasCompletedOnboarding
      })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    
    if (userResult.length === 0) {
      throw new Error("User not found");
    }
    
    // Add a suspended field to track user suspension separately from onboarding
    // For this demo, we'll temporarily use the same updatedAt field timestamp to indicate suspension
    // In a real app, you'd add a proper 'suspended' field to the users table
    
    const [updatedUser] = await db
      .update(users)
      .set({
        // Toggle the onboarding status to change active/inactive state
        // In a real app, you would use a dedicated field for suspension
        hasCompletedOnboarding: !isSuspended,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkId))
      .returning();
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error("Failed to update user status");
  }
}

export async function getReportedContent() {
  try {
    // In a real app, you'd have a reports table
    // For now, we'll just return notifications with type "report"
    
    const reports = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        content: notifications.content,
        createdAt: notifications.createdAt,
        videoId: notifications.videoId,
        commentId: notifications.commentId,
        reporterId: notifications.actorId,
        reporterName: sql<string>`'Anonymous Reporter'`,  // Placeholder
      })
      .from(notifications)
      .where(eq(notifications.type, "report"))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    
    return reports;
  } catch (error) {
    console.error("Error fetching reported content:", error);
    return [];
  }
}

export async function updateUserRole(clerkId: string, role: string) {
  try {
    // In a real app, you would update the user's role in Clerk metadata
    // For now, we'll just return a mock response
    
    return {
      success: true,
      message: `User role updated to ${role}`
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }
}

export async function featureVideo(videoId: string, isFeatured: boolean) {
  try {
    // Use raw SQL approach for description update
    const description = isFeatured 
      ? sql`CONCAT(${videos.description}, ' [FEATURED]')`
      : sql`REPLACE(${videos.description}, ' [FEATURED]', '')`;
      
    const [updatedVideo] = await db
      .update(videos)
      .set({
        description: sql`${description}`,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, videoId))
      .returning();
    
    return updatedVideo;
  } catch (error) {
    console.error("Error featuring video:", error);
    throw new Error("Failed to feature video");
  }
}

export async function deleteVideo(videoId: string) {
  try {
    // In a real app, this would include additional cleanup
    // like removing files from storage, etc.
    
    const [deletedVideo] = await db
      .delete(videos)
      .where(eq(videos.id, videoId))
      .returning();
    
    return deletedVideo;
  } catch (error) {
    console.error("Error deleting video:", error);
    throw new Error("Failed to delete video");
  }
}

export async function getSystemStats() {
  try {
    // Mock system stats for now to get past build errors
    return {
      totalUsers: 1000,
      totalVideos: 5000,
      totalViews: 250000,
      totalLikes: 75000,
      totalComments: 35000,
      totalStorage: "12.5 TB",
      totalBandwidth: "87.2 TB",
      avgLoadTime: "1.2s",
      serverUptime: "99.98%",
      cpuUsage: "42%",
      memoryUsage: "38%",
      diskUsage: "65%",
    };
  } catch (error) {
    console.error("Error getting system stats:", error);
    throw new Error("Failed to get system stats");
  }
}

export async function getApiKeys() {
  // Mock API keys for demonstration
  return [
    { id: "key_1", name: "Production API Key", key: "sk_prod_...890", created: "2023-12-01", lastUsed: "2024-04-15", status: "active" },
    { id: "key_2", name: "Development API Key", key: "sk_dev_...234", created: "2024-01-15", lastUsed: "2024-04-14", status: "active" },
    { id: "key_3", name: "Test API Key", key: "sk_test_...567", created: "2024-02-20", lastUsed: "2024-03-28", status: "inactive" }
  ];
}

export const getAdminLogs = async () => {
  try {
    // Mock logs data to match the AdminLog interface
    const actions = [
      "user_login", 
      "user_signup", 
      "video_uploaded", 
      "comment_added", 
      "account_updated", 
      "payment_processed", 
      "video_deleted", 
      "content_moderated", 
      "file_downloaded", 
      "access_denied"
    ];
    
    const adminNames = [
      "John Smith",
      "Sarah Johnson",
      "Michael Lee",
      "Emily Davis",
      "Robert Wilson"
    ];
    
    const logs = Array.from({ length: 50 }, (_, i) => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const adminName = adminNames[Math.floor(Math.random() * adminNames.length)];
      const adminId = faker.string.uuid();
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
      let details = "";
      let target = "";
      
      switch (action) {
        case "user_login":
          target = "Authentication";
          details = `User login from IP ${faker.internet.ipv4()}`;
          break;
        case "user_signup":
          target = "User Management";
          details = `New user registered with email ${faker.internet.email()}`;
          break;
        case "video_uploaded":
          const videoTitle = faker.lorem.words(4);
          target = `Video: ${videoTitle}`;
          details = `New video "${videoTitle}" uploaded to platform`;
          break;
        case "comment_added":
          const videoId = faker.string.alphanumeric(10);
          target = `Video: ${videoId}`;
          details = `Comment added to video ID ${videoId}`;
          break;
        case "account_updated":
          const userId = faker.string.uuid();
          target = `User: ${userId}`;
          details = `User account settings updated`;
          break;
        case "payment_processed":
          const transactionId = faker.string.alphanumeric(8).toUpperCase();
          target = `Transaction: ${transactionId}`;
          const amount = (Math.random() * 990 + 10).toFixed(2);
          details = `Payment of $${amount} processed for transaction #${transactionId}`;
          break;
        case "video_deleted":
          const deletedVideoTitle = faker.lorem.words(4);
          target = `Video: ${deletedVideoTitle}`;
          details = `Video "${deletedVideoTitle}" deleted from platform`;
          break;
        case "content_moderated":
          const contentId = faker.string.alphanumeric(10);
          target = `Content: ${contentId}`;
          details = `Content moderated: ${faker.lorem.sentence(8)}`;
          break;
        case "file_downloaded":
          const downloadUserId = faker.string.uuid();
          target = `User: ${downloadUserId}`;
          details = `File downloaded by user ID ${downloadUserId}`;
          break;
        case "access_denied":
          const deniedUserId = faker.string.uuid();
          target = `User: ${deniedUserId}`;
          details = `Access denied to protected resource`;
          break;
      }
      
      return {
        id: faker.string.uuid(),
        action,
        adminId,
        adminName,
        target,
        details,
        timestamp: timestamp.toISOString()
      };
    });
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return logs;
  } catch (error) {
    console.error("Error generating admin logs:", error);
    return [];
  }
};

// Helper function to get categories
export async function getCategories() {
  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt
      })
      .from(categories)
      .orderBy(asc(categories.name));
    
    // Get video counts for each category
    const categoriesWithStats = await Promise.all(
      allCategories.map(async (category) => {
        const videoCount = await db
          .select({ count: count() })
          .from(videos)
          .where(eq(videos.categoryId, category.id))
          .then(result => result[0].count);
        
        return {
          ...category,
          videoCount: Number(videoCount)
        };
      })
    );
    
    return categoriesWithStats;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function createCategory(data: { name: string, description?: string }) {
  try {
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
        description: data.description || null
      })
      .returning();
    
    return newCategory;
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

export async function updateCategory(id: string, data: { name?: string, description?: string }) {
  try {
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: data.name,
        description: data.description,
        updatedAt: new Date()
      })
      .where(eq(categories.id, id))
      .returning();
    
    return updatedCategory;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
}

export async function deleteCategory(id: string) {
  try {
    // First, update any videos using this category to remove the reference
    await db
      .update(videos)
      .set({ categoryId: null })
      .where(eq(videos.categoryId, id));
    
    // Then delete the category
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    
    return deletedCategory;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}

export async function deleteUser(clerkId: string) {
  try {
    // In a real app, you would:
    // 1. Delete the user from Clerk first using their Admin API
    // 2. Then perform cascade deletion of all user data
    
    // For this implementation, we'll handle the database side:
    
    // Start a transaction
    // In a real app with proper relationships set up, we'd use cascade delete
    await db.transaction(async (tx) => {
      // 1. Delete all the user's videos first
      const userVideos = await tx
        .select({ id: videos.id })
        .from(videos)
        .where(eq(videos.userId, clerkId));
      
      for (const video of userVideos) {
        // Delete video likes
        await tx
          .delete(videoLikes)
          .where(eq(videoLikes.videoId, video.id));
        
        // Delete video dislikes
        await tx
          .delete(videoDislikes)
          .where(eq(videoDislikes.videoId, video.id));
        
        // Delete video history entries
        await tx
          .delete(videoHistory)
          .where(eq(videoHistory.videoId, video.id));
        
        // Delete watch later entries
        await tx
          .delete(watchLater)
          .where(eq(watchLater.videoId, video.id));
        
        // Delete comments on this video
        await tx
          .delete(comments)
          .where(eq(comments.videoId, video.id));
      }
      
      // 2. Delete the videos themselves
      await tx
        .delete(videos)
        .where(eq(videos.userId, clerkId));
      
      // 3. Delete user's comments on other videos
      await tx
        .delete(comments)
        .where(eq(comments.userId, clerkId));
      
      // 4. Delete user's subscriptions to other channels
      await tx
        .delete(subscriptions)
        .where(eq(subscriptions.subscriberId, clerkId));
      
      // 5. Delete other users' subscriptions to this user's channel
      await tx
        .delete(subscriptions)
        .where(eq(subscriptions.creatorId, clerkId));
      
      // 6. Delete user's notifications
      await tx
        .delete(notifications)
        .where(eq(notifications.recipientId, clerkId));
      
      // 7. Delete user's watch history
      await tx
        .delete(videoHistory)
        .where(eq(videoHistory.userId, clerkId));
      
      // 8. Finally delete the user record
      const [deletedUser] = await tx
        .delete(users)
        .where(eq(users.clerkId, clerkId))
        .returning();
      
      if (!deletedUser) {
        throw new Error("User not found");
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
} 