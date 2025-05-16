CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "video_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"video_id" uuid NOT NULL,
	"watched_at" timestamp DEFAULT now() NOT NULL,
	"progress" text DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_username_idx" ON "admin_users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "video_history_user_idx" ON "video_history" USING btree ("user_id","watched_at");--> statement-breakpoint
CREATE INDEX "video_history_video_idx" ON "video_history" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_history_time_idx" ON "video_history" USING btree ("watched_at");--> statement-breakpoint
CREATE INDEX "user_video_history_idx" ON "video_history" USING btree ("user_id","video_id");--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "view_count";