#!/usr/bin/env python3
"""
Script to merge retail take-back locations into the master recycling directory.
"""

import csv
from pathlib import Path

def main():
    master_file = Path("/home/ubuntu/recycling-directory/client/public/data/master_recycling_directory.csv")
    retail_file = Path("/home/ubuntu/recycling-directory/data/retail_takeback_locations.csv")
    output_file = master_file  # Overwrite the master file
    
    # Read existing master data
    existing_entries = []
    with open(master_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        master_fieldnames = reader.fieldnames
        for row in reader:
            existing_entries.append(row)
    
    print(f"Existing entries: {len(existing_entries)}")
    
    # Read retail take-back locations
    retail_entries = []
    with open(retail_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Map retail fields to master format
            entry = {
                "Name": row["Name"],
                "Address": row["Address"],
                "State": row["State"],
                "County": "",
                "Phone": row["Phone"],
                "Email": row["Email"],
                "Website": row["Website"],
                "Category": row["Category"],
                "Facility_Type": "Retail Drop-off",
                "Feedstock": row["Materials_Accepted"],
                "Latitude": row["Latitude"],
                "Longitude": row["Longitude"],
                "NAICS_Code": ""
            }
            retail_entries.append(entry)
    
    print(f"Retail entries to add: {len(retail_entries)}")
    
    # Combine entries
    all_entries = existing_entries + retail_entries
    
    # Write combined data
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=master_fieldnames)
        writer.writeheader()
        writer.writerows(all_entries)
    
    print(f"Total entries in updated master file: {len(all_entries)}")
    print(f"Output saved to: {output_file}")
    
    # Count by category
    categories = {}
    for entry in all_entries:
        cat = entry.get("Category", "Unknown")
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\nEntries by category:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")


if __name__ == "__main__":
    main()
