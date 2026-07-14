CREATE TYPE "public"."service_request_status" AS ENUM('pending', 'approved', 'rejected', 'completed');--> statement-breakpoint
CREATE TYPE "public"."service_request_type" AS ENUM('noc', 'clubhouse_booking', 'renovation_permission', 'parking_allocation', 'other');--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"request_type" "service_request_type" NOT NULL,
	"status" "service_request_status" DEFAULT 'pending' NOT NULL,
	"preferred_date" timestamp,
	"raised_by_id" uuid NOT NULL,
	"admin_remarks" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_raised_by_id_users_id_fk" FOREIGN KEY ("raised_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;