CREATE TYPE "public"."bill_status" AS ENUM('unpaid', 'paid', 'partially_paid', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('online', 'cash', 'bank_transfer', 'cheque');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'verified', 'failed');--> statement-breakpoint
CREATE TABLE "maintenance_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"bill_number" varchar(100) NOT NULL,
	"billing_period" varchar(50) NOT NULL,
	"maintenance_amount" numeric(10, 2) NOT NULL,
	"water_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"electricity_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"penalty_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"other_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "bill_status" DEFAULT 'unpaid' NOT NULL,
	"due_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "maintenance_bills_bill_number_unique" UNIQUE("bill_number")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bill_id" uuid NOT NULL,
	"resident_id" uuid NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"transaction_reference" varchar(255) NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"verified_by_id" uuid,
	"verification_notes" varchar(255),
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_transaction_reference_unique" UNIQUE("transaction_reference")
);
--> statement-breakpoint
ALTER TABLE "maintenance_bills" ADD CONSTRAINT "maintenance_bills_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_maintenance_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."maintenance_bills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_resident_id_users_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_id_users_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;