import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Facility submissions table for user-submitted recycling locations.
 * Submissions are reviewed before being added to the main directory.
 */
export const facilitySubmissions = mysqlTable("facility_submissions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Facility information
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  zipCode: varchar("zipCode", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  category: varchar("category", { length: 100 }).notNull(),
  materialsAccepted: text("materialsAccepted"),
  additionalNotes: text("additionalNotes"),
  
  // Submitter information
  submitterName: varchar("submitterName", { length: 255 }),
  submitterEmail: varchar("submitterEmail", { length: 320 }),
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FacilitySubmission = typeof facilitySubmissions.$inferSelect;
export type InsertFacilitySubmission = typeof facilitySubmissions.$inferInsert;

/**
 * User favorites table for saving recycling facilities.
 * Uses a composite key of userId and facilityId to store favorites.
 * facilityId is a string identifier based on facility name and address hash.
 */
export const userFavorites = mysqlTable("user_favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Facility identifier (hash of name + address for CSV-based facilities)
  facilityId: varchar("facilityId", { length: 64 }).notNull(),
  
  // Store facility details for quick access without CSV lookup
  facilityName: varchar("facilityName", { length: 255 }).notNull(),
  facilityAddress: varchar("facilityAddress", { length: 500 }).notNull(),
  facilityCategory: varchar("facilityCategory", { length: 100 }),
  facilityPhone: varchar("facilityPhone", { length: 50 }),
  facilityWebsite: varchar("facilityWebsite", { length: 500 }),
  facilityFeedstock: text("facilityFeedstock"),
  facilityLatitude: varchar("facilityLatitude", { length: 20 }),
  facilityLongitude: varchar("facilityLongitude", { length: 20 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

/**
 * Facility reports table for users to flag incorrect or outdated information.
 * Reports are reviewed by admins to maintain data accuracy.
 */
export const facilityReports = mysqlTable("facility_reports", {
  id: int("id").autoincrement().primaryKey(),
  
  // Facility identifier (hash of name + address)
  facilityId: varchar("facilityId", { length: 64 }).notNull(),
  facilityName: varchar("facilityName", { length: 255 }).notNull(),
  facilityAddress: varchar("facilityAddress", { length: 500 }).notNull(),
  
  // Report details
  issueType: mysqlEnum("issueType", [
    "permanently_closed",
    "temporarily_closed",
    "wrong_address",
    "wrong_phone",
    "wrong_hours",
    "wrong_materials",
    "duplicate_listing",
    "other"
  ]).notNull(),
  description: text("description"),
  
  // Reporter information (optional)
  reporterName: varchar("reporterName", { length: 255 }),
  reporterEmail: varchar("reporterEmail", { length: 320 }),
  
  // Status tracking
  status: mysqlEnum("status", ["pending", "reviewed", "resolved", "dismissed"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FacilityReport = typeof facilityReports.$inferSelect;
export type InsertFacilityReport = typeof facilityReports.$inferInsert;
