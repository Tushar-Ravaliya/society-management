CREATE TYPE "public"."announcement_audience" AS ENUM('all', 'residents', 'committee');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"audience" "announcement_audience" DEFAULT 'all' NOT NULL,
	"published_by_id" uuid NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_published_by_id_users_id_fk" FOREIGN KEY ("published_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;