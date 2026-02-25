import { pgTable, check, integer, varchar, index, unique, pgPolicy, uuid, text, doublePrecision, jsonb, boolean, timestamp, foreignKey, pgView } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const spatialRefSys = pgTable("spatial_ref_sys", {
	srid: integer().notNull(),
	authName: varchar("auth_name", { length: 256 }),
	authSrid: integer("auth_srid"),
	srtext: varchar({ length: 2048 }),
	proj4Text: varchar({ length: 2048 }),
}, (table) => [
	check("spatial_ref_sys_srid_check", sql`(srid > 0) AND (srid <= 998999)`),
]);

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
	// TODO: failed to parse database type 'geography'
	location: text("location"),
	phone: text(),
	email: text(),
	website: text(),
	hoursOfOperation: jsonb("hours_of_operation"),
	isNoKill: boolean("is_no_kill").default(true),
	shelterType: text("shelter_type"),
	speciesServed: text("species_served").array().default([""]),
	services: text().array().default([""]),
	socialMedia: jsonb("social_media").default({}),
	logoUrl: text("logo_url"),
	photoUrls: text("photo_urls").array().default([""]),
	verified: boolean().default(false),
	verifiedAt: timestamp("verified_at", { withTimezone: true, mode: 'string' }),
	active: boolean().default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_shelters_active").using("btree", table.active.asc().nullsLast().op("bool_ops")).where(sql`(active = true)`),
	index("idx_shelters_city").using("btree", table.city.asc().nullsLast().op("text_ops"), table.state.asc().nullsLast().op("text_ops")),
	index("idx_shelters_location").using("gist", table.location.asc().nullsLast().op("gist_geography_ops")),
	index("idx_shelters_slug").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("idx_shelters_species").using("gin", table.speciesServed.asc().nullsLast().op("array_ops")),
	index("idx_shelters_state").using("btree", table.state.asc().nullsLast().op("text_ops")),
	unique("shelters_slug_key").on(table.slug),
	pgPolicy("Public can view active shelters", { as: "permissive", for: "select", to: ["public"], using: sql`(active = true)` }),
	check("shelters_shelter_type_check", sql`shelter_type = ANY (ARRAY['shelter'::text, 'rescue'::text, 'sanctuary'::text, 'foster_network'::text, 'community_resource'::text])`),
]);

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
	index("idx_corrections_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.shelterId],
		foreignColumns: [shelters.id],
		name: "shelter_corrections_shelter_id_fkey"
	}).onDelete("cascade"),
	pgPolicy("Public can submit corrections", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true` }),
	check("shelter_corrections_correction_type_check", sql`correction_type = ANY (ARRAY['info_update'::text, 'new_shelter'::text, 'closure_report'::text, 'general'::text])`),
	check("shelter_corrections_status_check", sql`status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'applied'::text, 'rejected'::text])`),
]);
export const geographyColumns = pgView("geography_columns", {	// TODO: failed to parse database type 'name'
	fTableCatalog: text("f_table_catalog"),
	// TODO: failed to parse database type 'name'
	fTableSchema: text("f_table_schema"),
	// TODO: failed to parse database type 'name'
	fTableName: text("f_table_name"),
	// TODO: failed to parse database type 'name'
	fGeographyColumn: text("f_geography_column"),
	coordDimension: integer("coord_dimension"),
	srid: integer(),
	type: text(),
}).as(sql`SELECT current_database() AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geography_column, postgis_typmod_dims(a.atttypmod) AS coord_dimension, postgis_typmod_srid(a.atttypmod) AS srid, postgis_typmod_type(a.atttypmod) AS type FROM pg_class c, pg_attribute a, pg_type t, pg_namespace n WHERE t.typname = 'geography'::name AND a.attisdropped = false AND a.atttypid = t.oid AND a.attrelid = c.oid AND c.relnamespace = n.oid AND (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text)`);

export const geometryColumns = pgView("geometry_columns", {
	fTableCatalog: varchar("f_table_catalog", { length: 256 }),
	// TODO: failed to parse database type 'name'
	fTableSchema: text("f_table_schema"),
	// TODO: failed to parse database type 'name'
	fTableName: text("f_table_name"),
	// TODO: failed to parse database type 'name'
	fGeometryColumn: text("f_geometry_column"),
	coordDimension: integer("coord_dimension"),
	srid: integer(),
	type: varchar({ length: 30 }),
}).as(sql`SELECT current_database()::character varying(256) AS f_table_catalog, n.nspname AS f_table_schema, c.relname AS f_table_name, a.attname AS f_geometry_column, COALESCE(postgis_typmod_dims(a.atttypmod), sn.ndims, 2) AS coord_dimension, COALESCE(NULLIF(postgis_typmod_srid(a.atttypmod), 0), sr.srid, 0) AS srid, replace(replace(COALESCE(NULLIF(upper(postgis_typmod_type(a.atttypmod)), 'GEOMETRY'::text), st.type, 'GEOMETRY'::text), 'ZM'::text, ''::text), 'Z'::text, ''::text)::character varying(30) AS type FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid AND NOT a.attisdropped JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_type t ON a.atttypid = t.oid LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, replace(split_part(s.consrc, ''''::text, 2), ')'::text, ''::text) AS type FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~~* '%geometrytype(% = %'::text) st ON st.connamespace = n.oid AND st.conrelid = c.oid AND (a.attnum = ANY (st.conkey)) LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, replace(split_part(s.consrc, ' = '::text, 2), ')'::text, ''::text)::integer AS ndims FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~~* '%ndims(% = %'::text) sn ON sn.connamespace = n.oid AND sn.conrelid = c.oid AND (a.attnum = ANY (sn.conkey)) LEFT JOIN ( SELECT s.connamespace, s.conrelid, s.conkey, replace(replace(split_part(s.consrc, ' = '::text, 2), ')'::text, ''::text), '('::text, ''::text)::integer AS srid FROM ( SELECT pg_constraint.connamespace, pg_constraint.conrelid, pg_constraint.conkey, pg_get_constraintdef(pg_constraint.oid) AS consrc FROM pg_constraint) s WHERE s.consrc ~~* '%srid(% = %'::text) sr ON sr.connamespace = n.oid AND sr.conrelid = c.oid AND (a.attnum = ANY (sr.conkey)) WHERE (c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) AND NOT c.relname = 'raster_columns'::name AND t.typname = 'geometry'::name AND NOT pg_is_other_temp_schema(c.relnamespace) AND has_table_privilege(c.oid, 'SELECT'::text)`);

// Stubs for transition from Recycling to Animal Shelter Directory
export const facilities = shelters as any;
export const facilitySubmissions = shelterCorrections as any;
export const users = {} as any;
export const userFavorites = {} as any;
export const newsletterSubscribers = {} as any;
export const facilityReports = {} as any;
export const facilityReviews = {} as any;
export const reviewHelpfulVotes = {} as any;

export type InsertFacility = any;
export type Facility = any;
export type User = any;
export type InsertUser = any;
export type Submission = any;
export type InsertFacilitySubmission = any;
export type Report = any;
export type InsertFacilityReport = any;
export type Review = any;
export type InsertFacilityReview = any;
export type UserFavorite = any;
export type InsertUserFavorite = any;
export type NewsletterSubscriber = any;
export type InsertNewsletterSubscriber = any;
export type ReviewHelpfulVote = any;
export type InsertReviewHelpfulVote = any;