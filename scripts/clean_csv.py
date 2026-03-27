#!/usr/bin/env python3.11
"""
Clean master_recycling_directory.csv:
  1. Fix concatenated category names (PlasticRecycling -> Plastic Recycling, etc.)
  2. Normalize the single 'Electronics Recycling' -> 'Electronics Recyclers' for consistency
  3. Remove non-recycling facilities (Animal Services)
  4. Remove rows with empty/malformed Name or Address
  5. Remove duplicate entries (same Name + Address, case-insensitive)
  6. Remove duplicate addresses where both rows are identical except for minor whitespace
  7. Fix the two empty-category rows if they can be inferred, else drop them
  8. Write cleaned CSV to client/public/data/master_recycling_directory.csv
"""

import csv
import re
import os

INPUT  = os.path.join(os.path.dirname(__file__), '../client/public/data/master_recycling_directory.csv')
OUTPUT = INPUT  # overwrite in-place

# Category normalization map
CATEGORY_FIXES = {
    'PlasticRecycling Facilities':   'Plastic Recycling Facilities',
    'GlassRecycling Facilities':     'Glass Recycling Facilities',
    'GlassSecondary Processors':     'Glass Secondary Processors',
    'PaperRecycling Facilities':     'Paper Recycling Facilities',
    'TextilesRecycling Facilities':  'Textiles Recycling Facilities',
    'WoodRecycling Facilities':      'Wood Recycling Facilities',
    'WoodSecondary Processors':      'Wood Secondary Processors',
    'Electronics Recycling':         'Electronics Recyclers',   # normalise singular variant
}

def fix_category(cat: str) -> str:
    cat = cat.strip()
    return CATEGORY_FIXES.get(cat, cat)

def is_non_recycling(row: dict) -> bool:
    """Return True if the row should be excluded."""
    name = row.get('Name', '').strip().lower()
    cat  = row.get('Category', '').strip().lower()
    ftype = row.get('Facility_Type', '').strip().lower()
    # Exclude Animal Services entries
    if 'animal services' in name or 'animal services' in cat or 'animal services' in ftype:
        return True
    return False

def is_malformed(row: dict) -> bool:
    """Return True if the row is missing essential data."""
    name = row.get('Name', '').strip()
    addr = row.get('Address', '').strip()
    # Drop rows with no name or address that look like partial data
    if not name or not addr:
        return True
    # Drop rows where name looks like a unit/suite number without a real name
    if re.match(r'^(unit|suite|building|bldg|ste|apt|floor)\s*\d', name, re.I) and len(name) < 15:
        return True
    return False

def normalize_key(row: dict) -> tuple:
    name = re.sub(r'\s+', ' ', row.get('Name', '').strip().lower())
    addr = re.sub(r'\s+', ' ', row.get('Address', '').strip().lower())
    return (name, addr)

def main():
    rows = []
    with open(INPUT, 'r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            rows.append(row)

    original_count = len(rows)
    print(f"Original rows: {original_count}")

    # Step 1: Fix categories
    for row in rows:
        row['Category'] = fix_category(row.get('Category', ''))

    # Step 2: Remove non-recycling entries
    rows = [r for r in rows if not is_non_recycling(r)]
    print(f"After removing non-recycling: {len(rows)} (removed {original_count - len(rows)})")

    # Step 3: Remove malformed rows
    before = len(rows)
    rows = [r for r in rows if not is_malformed(r)]
    print(f"After removing malformed rows: {len(rows)} (removed {before - len(rows)})")

    # Step 4: Remove duplicates (keep first occurrence)
    seen = {}
    deduped = []
    dup_count = 0
    for row in rows:
        key = normalize_key(row)
        if key not in seen:
            seen[key] = True
            deduped.append(row)
        else:
            dup_count += 1
    rows = deduped
    print(f"After deduplication: {len(rows)} (removed {dup_count} duplicates)")

    # Step 5: Write cleaned CSV
    with open(OUTPUT, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nCleaned CSV written to {OUTPUT}")
    print(f"Final row count: {len(rows)}")

    # Print category summary
    import collections
    cats = collections.Counter(r['Category'] for r in rows)
    print(f"\n=== FINAL CATEGORIES ({len(cats)} unique) ===")
    for cat, cnt in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {cnt:4d}  {cat!r}")

if __name__ == '__main__':
    main()
