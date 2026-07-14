import { pgTable, uuid, varchar, pgEnum, timestamp, boolean, integer } from "drizzle-orm/pg-core";

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
