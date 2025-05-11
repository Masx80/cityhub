import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
  foreignKey,
  unique,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    // Channel-related fields
    channelName: text("channel_name"),
    channelDescription: text("channel_description"),
    channelLocation: text("channel_location"),
    channelBannerUrl: text("channel_banner_url"),
    channelAvatarUrl: text("channel_avatar_url"),
    channelCreatedAt: timestamp("channel_created_at"),
    channelHandle: text("channel_handle"),
    hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  },
  (t) => [
    uniqueIndex("clerk_id_idx").on(t.clerkId),
    // Add index for channel handle lookups
    index("channel_handle_idx").on(t.channelHandle),
    // Add index for channel name searches
    index("channel_name_idx").on(t.channelName),
    // Add composite index for finding channels that have completed onboarding
    index("completed_onboarding_idx").on(t.hasCompletedOnboarding, t.channelCreatedAt),
  ]
);

// Categories table
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("name_idx").on(t.name)]
);

// Videos table
export const videos = pgTable(
  "videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoId: text("video_id").notNull().unique(),
    userId: text("user_id").notNull(),
    categoryId: uuid("category_id"),
    title: text("title").notNull(),
    description: text("description"),
    thumbnail: text("thumbnail"),
    tags: text("tags").array(),
    status: text("status").notNull().default("PROCESSING"),
    isReady: boolean("is_ready").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("video_id_idx").on(t.videoId),
    index("user_id_idx").on(t.userId),
    index("category_id_idx").on(t.categoryId),
    // Add composite indexes for common query patterns
    index("video_status_ready_idx").on(t.status, t.isReady),
    index("video_category_status_idx").on(t.categoryId, t.status, t.isReady),
    // Add index for full-text search on title and description
    index("video_title_idx").on(t.title),
    index("video_description_idx").on(t.description),
    // Add composite index for filtering by user and status (for user's videos)
    index("user_videos_idx").on(t.userId, t.status, t.isReady),
    // Add index for sorting by creation date (commonly used in queries)
    index("video_created_at_idx").on(t.createdAt),
  ]
);

// Comments table
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    userId: text("user_id").notNull(),
    videoId: text("video_id").notNull(),
    parentId: uuid("parent_id"), // For nested replies (null means top-level comment)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    isEdited: boolean("is_edited").default(false),
  },
  (t) => [
    index("comment_user_id_idx").on(t.userId),
    index("comment_video_id_idx").on(t.videoId),
    index("comment_parent_id_idx").on(t.parentId),
    // Add composite index for fetching a video's comments ordered by creation date
    index("video_comments_date_idx").on(t.videoId, t.createdAt),
    // Add composite index for fetching a user's comments across videos
    index("user_comments_date_idx").on(t.userId, t.createdAt),
    // Add index for retrieving threaded comments (parent-child relationships)
    index("threaded_comments_idx").on(t.videoId, t.parentId, t.createdAt),
  ]
);

// Subscriptions table
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriberId: text("subscriber_id").notNull(), // The user who is subscribing
    creatorId: text("creator_id").notNull(), // The channel being subscribed to
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // A user can only subscribe to a channel once
    unique().on(t.subscriberId, t.creatorId),
    index("subscriber_id_idx").on(t.subscriberId),
    index("creator_id_idx").on(t.creatorId),
    // Add index for recent subscribers to a creator (ordered by creation date)
    index("creator_recent_subs_idx").on(t.creatorId, t.createdAt),
    // Add index for recent subscriptions by a user (ordered by creation date)
    index("subscriber_recent_subs_idx").on(t.subscriberId, t.createdAt),
  ]
);

// Video Likes table
export const videoLikes = pgTable(
  "video_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    videoId: uuid("video_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    // A user can only like a video once
    unique().on(t.userId, t.videoId),
    index("like_user_id_idx").on(t.userId),
    index("like_video_id_idx").on(t.videoId),
  ]
);

// Video Dislikes table
export const videoDislikes = pgTable(
  "video_dislikes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    videoId: uuid("video_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    // A user can only dislike a video once
    unique().on(t.userId, t.videoId),
    index("dislike_user_id_idx").on(t.userId),
    index("dislike_video_id_idx").on(t.videoId),
  ]
);

// Notifications table
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(), // "like", "dislike", "subscription", "comment"
    recipientId: text("recipient_id").notNull(), // User receiving the notification
    actorId: text("actor_id").notNull(), // User who performed the action
    videoId: uuid("video_id"), // Optional, for likes/dislikes/comments
    commentId: uuid("comment_id"), // Optional, for comments
    read: boolean("read").default(false).notNull(),
    content: text("content"), // Optional content or context
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("notification_recipient_idx").on(t.recipientId),
    index("notification_actor_idx").on(t.actorId),
    index("notification_video_idx").on(t.videoId),
  ]
);

// Watch Later table
export const watchLater = pgTable(
  "watch_later",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    videoId: uuid("video_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    // A user can only add a video to watch later once
    unique().on(t.userId, t.videoId),
    index("watch_later_user_id_idx").on(t.userId),
    index("watch_later_video_id_idx").on(t.videoId),
    // Add index for sorting by creation date
    index("watch_later_created_at_idx").on(t.createdAt),
  ]
);

// Video History table
export const videoHistory = pgTable(
  "video_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    videoId: uuid("video_id").notNull(),
    watchedAt: timestamp("watched_at").defaultNow().notNull(),
    progress: text("progress").default("0").notNull(), // Stores progress as percentage or seconds
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // Index for user's watch history, latest first
    index("video_history_user_idx").on(t.userId, t.watchedAt),
    // Index for specific video history lookups
    index("video_history_video_idx").on(t.videoId),
    // Index for time-based queries (today, this week, etc.)
    index("video_history_time_idx").on(t.watchedAt),
    // Composite index for checking if a user has watched a specific video
    index("user_video_history_idx").on(t.userId, t.videoId),
  ]
);

// Define relationships separately to avoid circular references
// and allow more control over the database schema
export const videosRelations = {
  user: {
    table: users,
    field: "userId",
    references: "clerkId",
  },
  category: {
    table: categories,
    field: "categoryId",
    references: "id",
  },
};

// Comments relationships
export const commentsRelations = {
  user: {
    table: users,
    field: "userId",
    references: "clerkId",
  },
  video: {
    table: videos,
    field: "videoId",
    references: "id",
  },
  parent: {
    table: comments,
    field: "parentId",
    references: "id",
  },
};

// Define relationships for subscriptions
export const subscriptionsRelations = {
  subscriber: {
    table: users,
    field: "subscriberId",
    references: "clerkId",
  },
  creator: {
    table: users,
    field: "creatorId",
    references: "clerkId",
  },
};

// Define relationships for video likes
export const videoLikesRelations = {
  user: {
    table: users,
    field: "userId",
    references: "clerkId",
  },
  video: {
    table: videos,
    field: "videoId",
    references: "id",
  },
};

// Define relationships for video dislikes
export const videoDislikesRelations = {
  user: {
    table: users,
    field: "userId",
    references: "clerkId",
  },
  video: {
    table: videos,
    field: "videoId",
    references: "id",
  },
};

// Define relationships for notifications
export const notificationsRelations = {
  recipient: {
    table: users,
    field: "recipientId",
    references: "clerkId",
  },
  actor: {
    table: users,
    field: "actorId",
    references: "clerkId",
  },
  video: {
    table: videos,
    field: "videoId",
    references: "id",
  },
  comment: {
    table: comments,
    field: "commentId",
    references: "id",
  },
};

// Define relationships for watch later
export const watchLaterRelations = {
  user: {
    table: users,
    field: "userId",
    references: "clerkId",
  },
  video: {
    table: videos,
    field: "videoId",
    references: "id",
  },
};

// Define relationships for video history
export const videoHistoryRelations = {
  user: {
    table: users,
    field: "userId",
    references: "clerkId",
  },
  video: {
    table: videos,
    field: "videoId",
    references: "id",
  },
};
