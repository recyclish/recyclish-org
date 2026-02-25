import { pgTable, check, integer, varchar, index, unique, uuid, text, doublePrecision, jsonb, boolean, timestamp, foreignKey, customType } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Custom type for PostGIS geography
const geography = (name: string) =>
	customType<{ data: string }>({
		dataType() {
			return "geography";
		},
	})(name);

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	openId: varchar("open_id", { length: 255 }).notNull().unique(),
	name: text(),
	email: text(),
	loginMethod: varchar("login_method", { length: 50 }),
	role: varchar({ length: 20 }).notNull().default("user"),
	lastSignedIn: timestamp("last_signed_in", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const shelters = pgTable("shelters", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	addressLine1: text("address_line1").notNull(),
	addressLine2: text("address_line2"),
	city: text().notNull(),
	state: text().notNull(),
	zip: text().notNull(),
	latitude: doublePrecision(),
	longitude: doublePrecision(),
	location: geography("location"),
	phone: text(),
	email: text(),
	website: text(),
	hoursOfOperation: jsonb("hours_of_operation"),
	isNoKill: boolean("is_no_kill").default(true),
	shelterType: text("shelter_type"),
	speciesServed: text("species_served").array().default([]),
	services: text().array().default([]),
	socialMedia: jsonb("social_media").default({}),
	logoUrl: text("logo_url"),
	photoUrls: text("photo_urls").array().default([]),
	verified: boolean().default(false),
	verifiedAt: timestamp("verified_at", { withTimezone: true, mode: 'string' }),
	active: boolean().default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_shelters_active").using("btree", table.active).where(sql`active = true`),
	index("idx_shelters_city").using("btree", table.city, table.state),
	index("idx_shelters_location").using("gist", table.location),
	index("idx_shelters_slug").using("btree", table.slug),
	index("idx_shelters_species").using("gin", table.speciesServed),
	index("idx_shelters_state").using("btree", table.state),
	unique("shelters_slug_key").on(table.slug),
	check("shelters_shelter_type_check", sql`shelter_type = ANY (ARRAY['shelter'::text, 'rescue'::text, 'sanctuary'::text, 'foster_network'::text, 'community_resource'::text])`),
]);

export const facilitySubmissions = pgTable("facility_submissions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	address: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	zipCode: text("zip_code"),
	phone: text(),
	email: text(),
	website: text(),
	category: text().notNull(),
	materialsAccepted: text("materials_accepted"),
	additionalNotes: text("additional_notes"),
	submitterName: text("submitter_name"),
	submitterEmail: text("submitter_email"),
	status: text().default('pending'), // pending, approved, rejected
	reviewNotes: text("review_notes"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
	facilityId: text("facility_id").notNull(), // UUID or legacy ID
	facilityName: text("facility_name").notNull(),
	facilityAddress: text("facility_address").notNull(),
	facilityCategory: text("facility_category"),
	facilityPhone: text("facility_phone"),
	facilityWebsite: text("facility_website"),
	facilityFeedstock: text("facility_feedstock"),
	facilityLatitude: text("facility_latitude"),
	facilityLongitude: text("facility_longitude"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	email: text().notNull().unique(),
	zipCode: text("zip_code").notNull(),
	age: text(),
	gender: text(),
	sex: text(),
	additionalInfo: text("additional_info"),
	isActive: integer("is_active").default(1),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const facilityReports = pgTable("facility_reports", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	facilityId: text("facility_id").notNull(),
	facilityName: text("facility_name").notNull(),
	facilityAddress: text("facility_address").notNull(),
	issueType: text("issue_type").notNull(),
	description: text(),
	reporterName: text("reporter_name"),
	reporterEmail: text("reporter_email"),
	status: text().default('pending'), // pending, reviewed, resolved, dismissed
	adminNotes: text("admin_notes"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const facilityReviews = pgTable("facility_reviews", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
	userName: text("user_name").notNull(),
	facilityId: text("facility_id").notNull(),
	facilityName: text("facility_name").notNull(),
	facilityAddress: text("facility_address").notNull(),
	rating: integer().notNull(),
	title: text(),
	content: text(),
	serviceRating: integer("service_rating"),
	cleanlinessRating: integer("cleanliness_rating"),
	convenienceRating: integer("convenience_rating"),
	helpfulCount: integer("helpful_count").default(0),
	status: text().default('pending'), // pending, approved, rejected
	adminNotes: text("admin_notes"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const reviewHelpfulVotes = pgTable("review_helpful_votes", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
	reviewId: integer("review_id").notNull().references(() => facilityReviews.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const shelterCorrections = pgTable("shelter_corrections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	shelterId: uuid("shelter_id"),
	suggestedShelterName: text("suggested_shelter_name"),
	correctionType: text("correction_type"),
	details: text().notNull(),
	submitterName: text("submitter_name"),
	submitterEmail: text("submitter_email"),
	status: text().default('pending'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_corrections_status").using("btree", table.status),
	foreignKey({
		columns: [table.shelterId],
		foreignColumns: [shelters.id],
		name: "shelter_corrections_shelter_id_fkey"
	}).onDelete("cascade"),
	check("shelter_corrections_correction_type_check", sql`correction_type = ANY (ARRAY['info_update'::text, 'new_shelter'::text, 'closure_report'::text, 'general'::text])`),
	check("shelter_corrections_status_check", sql`status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'applied'::text, 'rejected'::text])`),
]);

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertFacility = typeof shelters.$inferInsert;
export type Facility = typeof shelters.$inferSelect;
export type InsertFacilitySubmission = typeof facilitySubmissions.$inferInsert;
export type Submission = typeof facilitySubmissions.$inferSelect;
export type InsertFacilityReport = typeof facilityReports.$inferInsert;
export type Report = typeof facilityReports.$inferSelect;
export type InsertFacilityReview = typeof facilityReviews.$inferInsert;
export type Review = typeof facilityReviews.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertReviewHelpfulVote = typeof reviewHelpfulVotes.$inferInsert;