#!/usr/bin/env python3
"""
Add drop-off acceptance, fee, and payment fields to the recycling facilities CSV.
Pre-populates values based on facility type and category.
"""

import csv
import random

# Define rules for each facility type
FACILITY_RULES = {
    # Retail drop-offs - consumer friendly, free
    'Retail Drop-off': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Pharmacy take-back - free for medications/sharps
    'Pharmacy Take-Back': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Hospital collection - free sharps disposal
    'Hospital Collection': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Health department - free public service
    'Health Department': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Municipal collection - usually free for residents
    'Municipal Collection': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': 'Free for residents',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Electronics recyclers - varies, some charge fees
    'Electronics Recycler': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Varies',
        'fee_details': 'Some items may have fees (CRTs, large appliances)',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # MRFs - mostly commercial, limited public access
    'MRF': {
        'accepts_dropoff': 'By Appointment',
        'fee_structure': 'Varies',
        'fee_details': 'Contact facility for rates',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Glass facilities - commercial focused
    'Glass Recycling Facility': {
        'accepts_dropoff': 'By Appointment',
        'fee_structure': 'Varies',
        'fee_details': 'Contact facility for rates',
        'offers_payment': 'No',
        'payment_details': ''
    },
    'Glass Secondary Processors': {
        'accepts_dropoff': 'No',
        'fee_structure': 'N/A',
        'fee_details': 'Commercial accounts only',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Paper facilities - commercial focused
    'Paper Recycling Facility': {
        'accepts_dropoff': 'By Appointment',
        'fee_structure': 'Varies',
        'fee_details': 'Contact facility for rates',
        'offers_payment': 'Yes',
        'payment_details': 'May pay for large quantities of clean paper/cardboard'
    },
    # Plastic facilities - commercial focused
    'Plastic Recycling Facility': {
        'accepts_dropoff': 'By Appointment',
        'fee_structure': 'Varies',
        'fee_details': 'Contact facility for rates',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Wood facilities - commercial focused
    'Wood Recycling Facility': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Fee',
        'fee_details': 'Fees vary by volume and wood type',
        'offers_payment': 'No',
        'payment_details': ''
    },
    'Wood Secondary Processors': {
        'accepts_dropoff': 'No',
        'fee_structure': 'N/A',
        'fee_details': 'Commercial accounts only',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Textiles - usually free drop-off
    'Textiles Recycling Facility': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
    # Sharps collection
    'Sharps Collection Site': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
}

# Category-based rules (fallback if facility type not matched)
CATEGORY_RULES = {
    'Sharps Disposal': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
    'Retail Take-Back Program': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
    'Metals Recycling': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'Yes',
        'payment_details': 'Pays for scrap metal (aluminum, copper, steel, brass)'
    },
    'Clothing Recycling': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
    'General Recycling': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'No',
        'payment_details': ''
    },
    'Cardboard Recycling': {
        'accepts_dropoff': 'Yes',
        'fee_structure': 'Free',
        'fee_details': '',
        'offers_payment': 'Yes',
        'payment_details': 'May pay for large quantities of clean cardboard'
    },
}

# Default values if no match
DEFAULT_RULES = {
    'accepts_dropoff': 'By Appointment',
    'fee_structure': 'Varies',
    'fee_details': 'Contact facility for details',
    'offers_payment': 'No',
    'payment_details': ''
}

def get_facility_info(facility_type, category):
    """Get drop-off/fee/payment info based on facility type and category."""
    # First try facility type
    if facility_type in FACILITY_RULES:
        return FACILITY_RULES[facility_type].copy()
    
    # Then try category
    if category in CATEGORY_RULES:
        return CATEGORY_RULES[category].copy()
    
    # Check if facility type contains keywords for metals (often pay)
    facility_lower = facility_type.lower()
    if any(metal in facility_lower for metal in ['ferrous', 'non-ferrous', 'aluminum', 'copper', 'steel', 'metal']):
        return {
            'accepts_dropoff': 'Yes',
            'fee_structure': 'Free',
            'fee_details': '',
            'offers_payment': 'Yes',
            'payment_details': 'Pays for scrap metal based on current market rates'
        }
    
    # Default
    return DEFAULT_RULES.copy()

def main():
    input_file = 'client/public/data/master_recycling_directory.csv'
    output_file = 'client/public/data/master_recycling_directory_new.csv'
    
    with open(input_file, 'r', newline='', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames + ['Accepts_Dropoff', 'Fee_Structure', 'Fee_Details', 'Offers_Payment', 'Payment_Details']
        
        rows = []
        for row in reader:
            facility_type = row.get('Facility_Type', '').strip()
            category = row.get('Category', '').strip()
            
            info = get_facility_info(facility_type, category)
            
            row['Accepts_Dropoff'] = info['accepts_dropoff']
            row['Fee_Structure'] = info['fee_structure']
            row['Fee_Details'] = info['fee_details']
            row['Offers_Payment'] = info['offers_payment']
            row['Payment_Details'] = info['payment_details']
            
            rows.append(row)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    # Print summary
    dropoff_counts = {}
    fee_counts = {}
    payment_counts = {}
    
    for row in rows:
        d = row['Accepts_Dropoff']
        f = row['Fee_Structure']
        p = row['Offers_Payment']
        dropoff_counts[d] = dropoff_counts.get(d, 0) + 1
        fee_counts[f] = fee_counts.get(f, 0) + 1
        payment_counts[p] = payment_counts.get(p, 0) + 1
    
    print(f"Processed {len(rows)} facilities")
    print(f"\nAccepts Drop-off:")
    for k, v in sorted(dropoff_counts.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    print(f"\nFee Structure:")
    for k, v in sorted(fee_counts.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    print(f"\nOffers Payment:")
    for k, v in sorted(payment_counts.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")

if __name__ == '__main__':
    main()
