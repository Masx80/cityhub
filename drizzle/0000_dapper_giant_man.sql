CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"user_id" text NOT NULL,
	"video_id" text NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_edited" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"recipient_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"video_id" uuid,
	"comment_id" uuid,
	"read" boolean DEFAULT false NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_subscriber_id_creator_id_unique" UNIQUE("subscriber_id","creator_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"channel_name" text,
	"channel_description" text,
	"channel_location" text,
	"channel_banner_url" text,
	"channel_avatar_url" text,
	"channel_created_at" timestamp,
	"channel_handle" text,
	"has_completed_onboarding" boolean DEFAULT false,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "video_dislikes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"video_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_dislikes_user_id_video_id_unique" UNIQUE("user_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "video_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"video_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_likes_user_id_video_id_unique" UNIQUE("user_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" text NOT NULL,
	"user_id" text NOT NULL,
	"category_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"tags" text[],
	"status" text DEFAULT 'PROCESSING' NOT NULL,
	"is_ready" boolean DEFAULT false NOT NULL,
	"view_count" text DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "videos_video_id_unique" UNIQUE("video_id")
);
--> statement-breakpoint
CREATE TABLE "watch_later" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"video_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "watch_later_user_id_video_id_unique" UNIQUE("user_id","video_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "comment_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comment_video_id_idx" ON "comments" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "comment_parent_id_idx" ON "comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "video_comments_date_idx" ON "comments" USING btree ("video_id","created_at");--> statement-breakpoint
CREATE INDEX "user_comments_date_idx" ON "comments" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "threaded_comments_idx" ON "comments" USING btree ("video_id","parent_id","created_at");--> statement-breakpoint
CREATE INDEX "notification_recipient_idx" ON "notifications" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "notification_actor_idx" ON "notifications" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "notification_video_idx" ON "notifications" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "subscriber_id_idx" ON "subscriptions" USING btree ("subscriber_id");--> statement-breakpoint
CREATE INDEX "creator_id_idx" ON "subscriptions" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "creator_recent_subs_idx" ON "subscriptions" USING btree ("creator_id","created_at");--> statement-breakpoint
CREATE INDEX "subscriber_recent_subs_idx" ON "subscriptions" USING btree ("subscriber_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "channel_handle_idx" ON "users" USING btree ("channel_handle");--> statement-breakpoint
CREATE INDEX "channel_name_idx" ON "users" USING btree ("channel_name");--> statement-breakpoint
CREATE INDEX "completed_onboarding_idx" ON "users" USING btree ("has_completed_onboarding","channel_created_at");--> statement-breakpoint
CREATE INDEX "dislike_user_id_idx" ON "video_dislikes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dislike_video_id_idx" ON "video_dislikes" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "like_user_id_idx" ON "video_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "like_video_id_idx" ON "video_likes" USING btree ("video_id");--> statement-breakpoint
CREATE UNIQUE INDEX "video_id_idx" ON "videos" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "videos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "category_id_idx" ON "videos" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "video_status_ready_idx" ON "videos" USING btree ("status","is_ready");--> statement-breakpoint
CREATE INDEX "video_category_status_idx" ON "videos" USING btree ("category_id","status","is_ready");--> statement-breakpoint
CREATE INDEX "video_title_idx" ON "videos" USING btree ("title");--> statement-breakpoint
CREATE INDEX "video_description_idx" ON "videos" USING btree ("description");--> statement-breakpoint
CREATE INDEX "user_videos_idx" ON "videos" USING btree ("user_id","status","is_ready");--> statement-breakpoint
CREATE INDEX "video_created_at_idx" ON "videos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "watch_later_user_id_idx" ON "watch_later" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "watch_later_video_id_idx" ON "watch_later" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "watch_later_created_at_idx" ON "watch_later" USING btree ("created_at");