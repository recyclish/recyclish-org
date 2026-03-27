#!/usr/bin/env python3.11
"""
Import cleaned recycling CSV data into the recyclish-directory Supabase database
using the Supabase REST API (HTTPS - no direct DB connection needed).
"""
import requests
import csv
import re
import uuid
import time

SUPABASE_URL = "https://ejtigzzdeblbwdpodgih.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdGlnenpkZWJsYndkcG9kZ2loIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU3MzEyOCwiZXhwIjoyMDkwMTQ5MTI4fQ.1S25EzX8XKCPEueYz_Ed-f_SP88Jwe5zGpPtivBX1VE"

INSERT_HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def slugify(text):
    """Create a URL-safe slug from text."""
    text = str(text).lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text[:80]

def parse_address(address, city, state, zip_code):
    """Parse address fields, handling combined address strings."""
    address = str(address or '').strip()
    city = str(city or '').strip()
    state = str(state or '').strip()
    zip_code = str(zip_code or '').strip()
    
    # If city is missing but address has comma-separated parts, try to parse
    if not city and ',' in address:
        parts = [p.strip() for p in address.split(',')]
        if len(parts) >= 3:
            address = parts[0]
            city = parts[1]
            state_zip = parts[2].strip().split()
            state = state_zip[0] if state_zip else state
            zip_code = state_zip[1] if len(state_zip) > 1 else zip_code
        elif len(parts) == 2:
            address = parts[0]
            city = parts[1]
    
    return address, city, state, zip_code

def import_csv():
    """Import the cleaned CSV data into the shelters table."""
    csv_path = "/home/ubuntu/recyclish-review/client/public/data/master_recycling_directory.csv"
    
    print(f"Reading CSV from {csv_path}...")
    
    rows = []
    seen_slugs = set()
    skipped = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        print(f"CSV columns: {headers}")
        
        for row in reader:
            # Try multiple possible column name variants
            name = (row.get('Name') or row.get('name') or row.get('Facility Name') or '').strip()
            if not name:
                skipped += 1
                continue
            
            raw_address = (row.get('Address') or row.get('address') or row.get('Street') or '').strip()
            raw_city = (row.get('City') or row.get('city') or '').strip()
            raw_state = (row.get('State') or row.get('state') or '').strip()
            raw_zip = (row.get('Zip') or row.get('zip') or row.get('ZipCode') or row.get('Postal Code') or '').strip()
            
            address, city, state, zip_code = parse_address(raw_address, raw_city, raw_state, raw_zip)
            
            if not city or not state:
                skipped += 1
                continue
            
            # Skip non-recycling entries
            category = (row.get('Category') or row.get('category') or row.get('Type') or '').strip()
            if 'animal' in category.lower() or 'shelter' in category.lower():
                skipped += 1
                continue
            
            # Generate unique slug
            base_slug = slugify(f"{name}-{city}-{state}")
            slug = base_slug
            counter = 1
            while slug in seen_slugs:
                slug = f"{base_slug}-{counter}"
                counter += 1
            seen_slugs.add(slug)
            
            # Parse coordinates
            lat_raw = row.get('Latitude') or row.get('latitude') or row.get('Lat') or ''
            lon_raw = row.get('Longitude') or row.get('longitude') or row.get('Lon') or ''
            
            try:
                lat = float(lat_raw) if lat_raw and str(lat_raw).strip() not in ('', '0', '0.0') else None
                lon = float(lon_raw) if lon_raw and str(lon_raw).strip() not in ('', '0', '0.0') else None
            except (ValueError, TypeError):
                lat = None
                lon = None
            
            feedstock = (row.get('Feedstock') or row.get('feedstock') or row.get('Materials') or row.get('Accepted Materials') or '').strip()
            phone = (row.get('Phone') or row.get('phone') or row.get('Phone Number') or '').strip()
            website = (row.get('Website') or row.get('website') or row.get('URL') or '').strip()
            
            # Parse materials into array
            materials = [m.strip() for m in feedstock.split(',') if m.strip()] if feedstock else []
            
            rows.append({
                "id": str(uuid.uuid4()),
                "name": name,
                "slug": slug,
                "address_line1": address if address else f"{city}, {state}",
                "city": city,
                "state": state,
                "zip": zip_code if zip_code else "00000",
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
    
    print(f"Prepared {len(rows)} rows for import. Skipped {skipped} invalid rows.")
    
    # Insert in batches of 200 via Supabase REST API
    batch_size = 200
    total_inserted = 0
    errors = 0
    
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/shelters",
            headers=INSERT_HEADERS,
            json=batch,
            timeout=60
        )
        if resp.status_code in (200, 201):
            total_inserted += len(batch)
            print(f"  Batch {i//batch_size + 1}: ✅ {len(batch)} rows ({total_inserted} total)")
        else:
            errors += 1
            print(f"  Batch {i//batch_size + 1}: ❌ {resp.status_code}: {resp.text[:300]}")
        time.sleep(0.3)
    
    print(f"\nImport complete: {total_inserted}/{len(rows)} rows inserted. {errors} batch errors.")
    return total_inserted

if __name__ == "__main__":
    print("=== recyclish-directory CSV Import ===\n")
    count = import_csv()
    print(f"\n✅ Done! {count} recycling facilities now in the database.")
