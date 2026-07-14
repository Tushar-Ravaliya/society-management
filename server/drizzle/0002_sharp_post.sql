CREATE TABLE "committee_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"designation" varchar(100) NOT NULL,
	"portfolio" varchar(255) NOT NULL,
	"term_start" timestamp NOT NULL,
	"term_end" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;