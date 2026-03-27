-- ============================================================
-- recyclish-directory: Recycling-focused database setup
-- Run this on the new Supabase project (ejtigzzdeblbwdpodgih)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "users" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "open_id" varchar(255) NOT NULL,
  "name" text,
  "email" text,
  "login_method" varchar(50),
  "role" varchar(20) DEFAULT 'user' NOT NULL,
  "last_signed_in" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);

-- ============================================================
-- SHELTERS TABLE (recycling facilities)
-- shelter_type CHECK constraint updated for recycling categories
-- species_served repurposed as accepted_materials
-- is_no_kill repurposed as is_free (free drop-off)
-- ============================================================
CREATE TABLE IF NOT EXISTS "shelters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "address_line1" text NOT NULL,
  "address_line2" text,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "zip" text NOT NULL,
  "latitude" double precision,
  "longitude" double precision,
  "location" geography(Point, 4326),
  "phone" text,
  "email" text,
  "website" text,
  "hours_of_operation" jsonb,
  "is_no_kill" boolean DEFAULT true,  -- repurposed: true = free drop-off
  "shelter_type" text,                -- recycling facility category
  "species_served" text[] DEFAULT '{}', -- repurposed: accepted materials
  "services" text[] DEFAULT '{}',
  "social_media" jsonb DEFAULT '{}'::jsonb,
  "logo_url" text,
  "photo_urls" text[] DEFAULT '{}',
  "verified" boolean DEFAULT false,
  "verified_at" timestamp with time zone,
  "active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "shelters_slug_key" UNIQUE("slug"),
  CONSTRAINT "shelters_shelter_type_check" CHECK (
    shelter_type IS NULL OR shelter_type = ANY (ARRAY[
      'Drop-off Center'::text,
      'Curbside Pickup'::text,
      'Retail Take-Back'::text,
      'Hazardous Waste'::text,
      'E-Waste'::text,
      'Composting'::text,
      'Scrap Metal'::text,
      'Transfer Station'::text,
      'Material Recovery Facility'::text,
      'Municipal Recycling'::text,
      'Community Resource'::text,
      'Other'::text
    ])
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_shelters_active" ON "shelters" USING btree ("active") WHERE active = true;
CREATE INDEX IF NOT EXISTS "idx_shelters_city" ON "shelters" USING btree ("city", "state");
CREATE INDEX IF NOT EXISTS "idx_shelters_location" ON "shelters" USING gist ("location");
CREATE INDEX IF NOT EXISTS "idx_shelters_slug" ON "shelters" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "idx_shelters_species" ON "shelters" USING gin ("species_served");
CREATE INDEX IF NOT EXISTS "idx_shelters_state" ON "shelters" USING btree ("state");

-- ============================================================
-- FACILITY SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "facility_submissions" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "name" text NOT NULL,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "zip" text NOT NULL,
  "phone" text,
  "email" text,
  "website" text,
  "facility_type" text,
  "accepted_materials" text,
  "hours" text,
  "description" text,
  "submitter_name" text,
  "submitter_email" text NOT NULL,
  "status" text DEFAULT 'pending',
  "admin_notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- ============================================================
-- USER FAVORITES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "user_favorites" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "facility_id" text NOT NULL,
  "facility_name" text NOT NULL,
  "facility_address" text NOT NULL,
  "facility_category" text,
  "facility_phone" text,
  "facility_website" text,
  "facility_feedstock" text,
  "facility_latitude" text,
  "facility_longitude" text,
  "created_at" timestamp with time zone DEFAULT now()
);

-- ============================================================
-- FACILITY REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "facility_reviews" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "user_name" text NOT NULL,
  "facility_id" text NOT NULL,
  "facility_name" text NOT NULL,
  "facility_address" text NOT NULL,
  "rating" integer NOT NULL,
  "title" text,
  "content" text,
  "service_rating" integer,
  "cleanliness_rating" integer,
  "convenience_rating" integer,
  "helpful_count" integer DEFAULT 0,
  "status" text DEFAULT 'pending',
  "admin_notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- ============================================================
-- REVIEW HELPFUL VOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "review_helpful_votes" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "review_id" integer NOT NULL REFERENCES "facility_reviews"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now()
);

-- ============================================================
-- FACILITY REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "facility_reports" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "facility_id" text NOT NULL,
  "facility_name" text NOT NULL,
  "facility_address" text NOT NULL,
  "issue_type" text NOT NULL,
  "description" text,
  "reporter_name" text,
  "reporter_email" text,
  "status" text DEFAULT 'pending',
  "admin_notes" text,
  "created_at" timestamp with time zone DEFAULT now()
);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "email" text NOT NULL UNIQUE,
  "zip_code" text NOT NULL,
  "age" text,
  "gender" text,
  "sex" text,
  "additional_info" text,
  "is_active" integer DEFAULT 1,
  "created_at" timestamp with time zone DEFAULT now()
);

-- ============================================================
-- SHELTER CORRECTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "shelter_corrections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "shelter_id" uuid REFERENCES "shelters"("id") ON DELETE CASCADE,
  "suggested_shelter_name" text,
  "correction_type" text,
  "details" text NOT NULL,
  "submitter_name" text,
  "submitter_email" text,
  "status" text DEFAULT 'pending',
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "shelter_corrections_correction_type_check" CHECK (
    correction_type = ANY (ARRAY['info_update'::text, 'new_shelter'::text, 'closure_report'::text, 'general'::text])
  ),
  CONSTRAINT "shelter_corrections_status_check" CHECK (
    status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'applied'::text, 'rejected'::text])
  )
);

CREATE INDEX IF NOT EXISTS "idx_corrections_status" ON "shelter_corrections" USING btree ("status");
