CREATE TABLE "facility_reports" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "facility_reports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
--> statement-breakpoint
CREATE TABLE "facility_reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "facility_reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "facility_submissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "facility_submissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text,
	"phone" text,
	"email" text,
	"website" text,
	"category" text NOT NULL,
	"materials_accepted" text,
	"additional_notes" text,
	"submitter_name" text,
	"submitter_email" text,
	"status" text DEFAULT 'pending',
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "newsletter_subscribers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"zip_code" text NOT NULL,
	"age" text,
	"gender" text,
	"sex" text,
	"additional_info" text,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "review_helpful_votes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "review_helpful_votes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"review_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shelter_corrections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shelter_id" uuid,
	"suggested_shelter_name" text,
	"correction_type" text,
	"details" text NOT NULL,
	"submitter_name" text,
	"submitter_email" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "shelter_corrections_correction_type_check" CHECK (correction_type = ANY (ARRAY['info_update'::text, 'new_shelter'::text, 'closure_report'::text, 'general'::text])),
	CONSTRAINT "shelter_corrections_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'applied'::text, 'rejected'::text]))
);
--> statement-breakpoint
CREATE TABLE "shelters" (
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
	"location" "geography",
	"phone" text,
	"email" text,
	"website" text,
	"hours_of_operation" jsonb,
	"is_no_kill" boolean DEFAULT true,
	"shelter_type" text,
	"species_served" text[] DEFAULT '{}',
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
	CONSTRAINT "shelters_shelter_type_check" CHECK (shelter_type = ANY (ARRAY['shelter'::text, 'rescue'::text, 'sanctuary'::text, 'foster_network'::text, 'community_resource'::text]))
);
--> statement-breakpoint
CREATE TABLE "spatial_ref_sys" (
	"srid" integer NOT NULL,
	"auth_name" varchar(256),
	"auth_srid" integer,
	"srtext" varchar(2048),
	"proj4text" varchar(2048),
	CONSTRAINT "spatial_ref_sys_srid_check" CHECK ((srid > 0) AND (srid <= 998999))
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_favorites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
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
--> statement-breakpoint
ALTER TABLE "facility_reviews" ADD CONSTRAINT "facility_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_facility_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."facility_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelter_corrections" ADD CONSTRAINT "shelter_corrections_shelter_id_fkey" FOREIGN KEY ("shelter_id") REFERENCES "public"."shelters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_corrections_status" ON "shelter_corrections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_shelters_active" ON "shelters" USING btree ("active") WHERE active = true;--> statement-breakpoint
CREATE INDEX "idx_shelters_city" ON "shelters" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "idx_shelters_location" ON "shelters" USING gist ("location");--> statement-breakpoint
CREATE INDEX "idx_shelters_slug" ON "shelters" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_shelters_species" ON "shelters" USING gin ("species_served");--> statement-breakpoint
CREATE INDEX "idx_shelters_state" ON "shelters" USING btree ("state");