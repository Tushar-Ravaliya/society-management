CREATE TYPE "public"."residency_type" AS ENUM('owner', 'tenant');--> statement-breakpoint
CREATE TYPE "public"."unit_status" AS ENUM('occupied', 'vacant');--> statement-breakpoint
CREATE TABLE "resident_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"unit_id" uuid NOT NULL,
	"residency_type" "residency_type" DEFAULT 'tenant' NOT NULL,
	"occupation" varchar(255),
	"emergency_contact" varchar(20),
	"vehicle_number" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block" varchar(50) NOT NULL,
	"flat_number" varchar(50) NOT NULL,
	"floor" integer NOT NULL,
	"bhk_type" varchar(10) NOT NULL,
	"status" "unit_status" DEFAULT 'vacant' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resident_profiles" ADD CONSTRAINT "resident_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resident_profiles" ADD CONSTRAINT "resident_profiles_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE restrict ON UPDATE no action;