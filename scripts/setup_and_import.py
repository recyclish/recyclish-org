#!/usr/bin/env python3.11
"""
Setup the recyclish-directory Supabase schema and import CSV data
using the Supabase Management API (SQL execution endpoint).
"""
import requests
import json
import csv
import re
import uuid
import time

SUPABASE_URL = "https://ejtigzzdeblbwdpodgih.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdGlnenpkZWJsYndkcG9kZ2loIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU3MzEyOCwiZXhwIjoyMDkwMTQ5MTI4fQ.1S25EzX8XKCPEueYz_Ed-f_SP88Jwe5zGpPtivBX1VE"
PROJECT_ID = "ejtigzzdeblbwdpodgih"

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def run_sql(sql):
    """Execute SQL via Supabase REST RPC or management API."""
    # Use the pg_dump/restore endpoint via rpc
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        headers=HEADERS,
        json={"query": sql},
        timeout=30
    )
    return resp

def create_tables():
    """Schema already created via SQL Editor - this is a no-op."""
    print("Schema already created via SQL Editor. Skipping.")
    return
    
    sql_statements = [
        # Users table
        """CREATE TABLE IF NOT EXISTS "users" (
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
        )""",
        
        # Shelters table (recycling facilities)
        """CREATE TABLE IF NOT EXISTS "shelters" (
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
          CONSTRAINT "shelters_slug_key" UNIQUE("slug")
        )""",
        
        # Indexes
        'CREATE INDEX IF NOT EXISTS "idx_shelters_active" ON "shelters" USING btree ("active") WHERE active = true',
        'CREATE INDEX IF NOT EXISTS "idx_shelters_city" ON "shelters" USING btree ("city", "state")',
        'CREATE INDEX IF NOT EXISTS "idx_shelters_slug" ON "shelters" USING btree ("slug")',
        'CREATE INDEX IF NOT EXISTS "idx_shelters_species" ON "shelters" USING gin ("species_served")',
        'CREATE INDEX IF NOT EXISTS "idx_shelters_state" ON "shelters" USING btree ("state")',
        
        # Facility submissions
        """CREATE TABLE IF NOT EXISTS "facility_submissions" (
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
        )""",
        
        # User favorites (with structured address)
        """CREATE TABLE IF NOT EXISTS "user_favorites" (
          "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "facility_id" text NOT NULL,
          "facility_name" text NOT NULL,
          "facility_address" text NOT NULL,
          "facility_city" text,
          "facility_state" text,
          "facility_zip" text,
          "facility_category" text,
          "facility_phone" text,
          "facility_website" text,
          "facility_feedstock" text,
          "facility_latitude" text,
          "facility_longitude" text,
          "created_at" timestamp with time zone DEFAULT now()
        )""",
        
        # Facility reviews
        """CREATE TABLE IF NOT EXISTS "facility_reviews" (
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
        )""",
        
        # Newsletter subscribers
        """CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
          "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          "email" text NOT NULL UNIQUE,
          "zip_code" text NOT NULL,
          "age" text,
          "gender" text,
          "sex" text,
          "additional_info" text,
          "is_active" integer DEFAULT 1,
          "created_at" timestamp with time zone DEFAULT now()
        )""",
    ]
    
    for i, sql in enumerate(sql_statements):
        resp = requests.post(
            mgmt_url,
            headers=mgmt_headers,
            json={"query": sql},
            timeout=30
        )
        status = "✅" if resp.status_code in (200, 201) else f"❌ {resp.status_code}: {resp.text[:100]}"
        print(f"  Statement {i+1}/{len(sql_statements)}: {status}")
    
    print("Schema setup complete.")

def slugify(text):
    """Create a URL-safe slug from text."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text[:80]

def import_csv():
    """Import the cleaned CSV data into the shelters table."""
    csv_path = "/home/ubuntu/recyclish-review/client/public/data/master_recycling_directory.csv"
    
    print(f"\nReading CSV from {csv_path}...")
    
    rows = []
    seen_slugs = set()
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = (row.get('Name') or row.get('name') or '').strip()
            if not name:
                continue
            
            address = (row.get('Address') or row.get('address') or '').strip()
            city = (row.get('City') or row.get('city') or '').strip()
            state = (row.get('State') or row.get('state') or '').strip()
            zip_code = (row.get('Zip') or row.get('zip') or row.get('ZipCode') or '').strip()
            
            # Parse address if city/state not separate
            if not city and ',' in address:
                parts = address.rsplit(',', 2)
                if len(parts) >= 3:
                    address = parts[0].strip()
                    city = parts[1].strip()
                    state_zip = parts[2].strip().split()
                    state = state_zip[0] if state_zip else ''
                    zip_code = state_zip[1] if len(state_zip) > 1 else ''
            
            if not city or not state:
                continue
            
            # Generate unique slug
            base_slug = slugify(f"{name}-{city}-{state}")
            slug = base_slug
            counter = 1
            while slug in seen_slugs:
                slug = f"{base_slug}-{counter}"
                counter += 1
            seen_slugs.add(slug)
            
            lat = row.get('Latitude') or row.get('latitude') or row.get('Lat') or None
            lon = row.get('Longitude') or row.get('longitude') or row.get('Lon') or None
            
            try:
                lat = float(lat) if lat and lat != '0' and lat != '0.0' else None
                lon = float(lon) if lon and lon != '0' and lon != '0.0' else None
            except (ValueError, TypeError):
                lat = None
                lon = None
            
            category = (row.get('Category') or row.get('category') or row.get('Type') or '').strip()
            feedstock = (row.get('Feedstock') or row.get('feedstock') or row.get('Materials') or '').strip()
            phone = (row.get('Phone') or row.get('phone') or '').strip()
            website = (row.get('Website') or row.get('website') or row.get('URL') or '').strip()
            
            materials = [m.strip() for m in feedstock.split(',') if m.strip()] if feedstock else []
            
            rows.append({
                "id": str(uuid.uuid4()),
                "name": name,
                "slug": slug,
                "address_line1": address or f"{city}, {state}",
                "city": city,
                "state": state,
                "zip": zip_code or "00000",
                "latitude": lat,
                "longitude": lon,
                "shelter_type": category if category else None,
                "species_served": materials,
                "phone": phone if phone else None,
                "website": website if website else None,
                "verified": False,
                "active": True,
                "is_no_kill": True,
            })
    
    print(f"Prepared {len(rows)} rows for import.")
    
    # Insert in batches of 500 via Supabase REST API
    batch_size = 500
    total_inserted = 0
    
    insert_headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/shelters",
            headers=insert_headers,
            json=batch,
            timeout=60
        )
        if resp.status_code in (200, 201):
            total_inserted += len(batch)
            print(f"  Batch {i//batch_size + 1}: ✅ Inserted {len(batch)} rows ({total_inserted} total)")
        else:
            print(f"  Batch {i//batch_size + 1}: ❌ {resp.status_code}: {resp.text[:200]}")
        time.sleep(0.5)
    
    print(f"\nImport complete: {total_inserted}/{len(rows)} rows inserted.")
    return total_inserted

if __name__ == "__main__":
    print("=== recyclish-directory Database Setup ===\n")
    create_tables()
    count = import_csv()
    print(f"\n✅ Done! {count} recycling facilities imported into recyclish-directory database.")
