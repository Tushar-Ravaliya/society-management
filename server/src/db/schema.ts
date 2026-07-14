import { pgTable, uuid, varchar, pgEnum, timestamp, boolean, integer, text, numeric } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "committee", "resident"]);
export const userStatusEnum = pgEnum("user_status", ["pending", "active", "inactive"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  role: userRoleEnum("role").default("resident").notNull(),
  status: userStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const unitStatusEnum = pgEnum("unit_status", ["occupied", "vacant"]);
export const residencyTypeEnum = pgEnum("residency_type", ["owner", "tenant"]);

export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  block: varchar("block", { length: 50 }).notNull(),
  flatNumber: varchar("flat_number", { length: 50 }).notNull(),
  floor: integer("floor").notNull(),
  bhkType: varchar("bhk_type", { length: 10 }).notNull(),
  status: unitStatusEnum("status").default("vacant").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const residentProfiles = pgTable("resident_profiles", {
  id: uuid("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  unitId: uuid("unit_id").references(() => units.id, { onDelete: "restrict" }).notNull(),
  residencyType: residencyTypeEnum("residency_type").default("tenant").notNull(),
  occupation: varchar("occupation", { length: 255 }),
  emergencyContact: varchar("emergency_contact", { length: 20 }),
  vehicleNumber: varchar("vehicle_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const committeeMembers = pgTable("committee_members", {
  id: uuid("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  designation: varchar("designation", { length: 100 }).notNull(),
  portfolio: varchar("portfolio", { length: 255 }).notNull(),
  termStart: timestamp("term_start").notNull(),
  termEnd: timestamp("term_end").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const announcementAudienceEnum = pgEnum("announcement_audience", ["all", "residents", "committee"]);

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  audience: announcementAudienceEnum("audience").default("all").notNull(),
  publishedById: uuid("published_by_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const complaintStatusEnum = pgEnum("complaint_status", ["pending", "assigned", "resolved", "rejected"]);
export const complaintPriorityEnum = pgEnum("complaint_priority", ["low", "medium", "high"]);

export const complaints = pgTable("complaints", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: complaintStatusEnum("status").default("pending").notNull(),
  priority: complaintPriorityEnum("priority").default("medium").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  imageFileId: varchar("image_file_id", { length: 255 }),
  raisedById: uuid("raised_by_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  assignedToId: uuid("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
  resolutionDetails: text("resolution_details"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serviceRequestStatusEnum = pgEnum("service_request_status", ["pending", "approved", "rejected", "completed"]);
export const serviceRequestTypeEnum = pgEnum("service_request_type", ["noc", "clubhouse_booking", "renovation_permission", "parking_allocation", "other"]);

export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requestType: serviceRequestTypeEnum("request_type").notNull(),
  status: serviceRequestStatusEnum("status").default("pending").notNull(),
  preferredDate: timestamp("preferred_date"),
  raisedById: uuid("raised_by_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  adminRemarks: text("admin_remarks"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const billStatusEnum = pgEnum("bill_status", ["unpaid", "paid", "partially_paid", "overdue"]);

export const maintenanceBills = pgTable("maintenance_bills", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitId: uuid("unit_id").references(() => units.id, { onDelete: "restrict" }).notNull(),
  billNumber: varchar("bill_number", { length: 100 }).notNull().unique(),
  billingPeriod: varchar("billing_period", { length: 50 }).notNull(),
  maintenanceAmount: numeric("maintenance_amount", { precision: 10, scale: 2 }).notNull(),
  waterAmount: numeric("water_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  electricityAmount: numeric("electricity_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  penaltyAmount: numeric("penalty_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  otherAmount: numeric("other_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: billStatusEnum("status").default("unpaid").notNull(),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentMethodEnum = pgEnum("payment_method", ["online", "cash", "bank_transfer", "cheque"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "verified", "failed"]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  billId: uuid("bill_id").references(() => maintenanceBills.id, { onDelete: "restrict" }).notNull(),
  residentId: uuid("resident_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  transactionReference: varchar("transaction_reference", { length: 255 }).notNull().unique(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  verifiedById: uuid("verified_by_id").references(() => users.id, { onDelete: "set null" }),
  verificationNotes: varchar("verification_notes", { length: 255 }),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
