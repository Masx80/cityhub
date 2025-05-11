import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { relations } from "drizzle-orm";
import { comments, users, videos, commentsRelations, videosRelations } from "./schema";

// Setup a connection pool for the database
const sql = neon(process.env.DATABASE_URL!);

// Configure relationships
const commentsRelationsConfig = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.clerkId],
  }),
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.videoId], // Use videoId instead of id
  }),
  replies: many(comments),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
}));

// Create a Drizzle ORM instance with the schema
export const db = drizzle(sql, { schema });
