# National Recycling Directory - Maintenance Guide

This guide explains how to maintain and update the National Recycling Directory without any coding knowledge.

---

## Overview

The National Recycling Directory is a static website that displays recycling facility data from a CSV (spreadsheet) file. To update the directory, you simply need to edit the CSV file.

**Data File Location:** `/client/public/data/master_recycling_directory.csv`

---

## Understanding the Data Structure

The CSV file contains the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Name | Facility name | "Green Earth Recycling" |
| Address | Full street address | "123 Main St, Los Angeles, CA, 90001" |
| State | Full state name | "California" |
| County | County name | "Los Angeles" |
| Phone | Contact phone number | "(555) 123-4567" |
| Email | Contact email | "info@example.com" |
| Website | Facility website URL | "https://example.com" |
| Category | Type of recycling facility | "Electronics Recyclers" |
| Facility_Type | Specific facility classification | "Electronics Recycler" |
| Feedstock | Materials accepted | "Electronics" |
| Latitude | GPS latitude coordinate | 34.0522 |
| Longitude | GPS longitude coordinate | -118.2437 |
| NAICS_Code | Industry classification code | "562920" |

---

## How to Update the Data

### Option 1: Edit with Google Sheets (Recommended)

1. **Download the CSV file** from the project
2. **Upload to Google Sheets:**
   - Go to [Google Sheets](https://sheets.google.com)
   - Click "File" → "Import" → "Upload"
   - Select the CSV file
   - Choose "Replace current sheet"
3. **Make your edits:**
   - Add new rows for new facilities
   - Edit existing information
   - Delete rows for closed facilities
4. **Export as CSV:**
   - Click "File" → "Download" → "Comma-separated values (.csv)"
5. **Replace the file** in the project at `/client/public/data/master_recycling_directory.csv`

### Option 2: Edit with Microsoft Excel

1. Open the CSV file in Excel
2. Make your changes
3. Save as CSV (not .xlsx)
4. Replace the file in the project

### Option 3: Edit with a Text Editor

For small changes, you can edit the CSV directly:
- Each line is one facility
- Values are separated by commas
- Text with commas should be wrapped in quotes

---

## Adding New Facilities

When adding a new facility, ensure you include:

1. **Name** (required) - The official facility name
2. **Address** (required) - Full address including city, state, and ZIP
3. **State** (required) - Full state name (e.g., "California" not "CA")
4. **Category** (required) - Must match one of these exactly:
   - Electronics Recyclers
   - Material Recovery Facilities (MRFs)
   - PlasticRecycling Facilities
   - GlassRecycling Facilities
   - GlassSecondary Processors
   - PaperRecycling Facilities
   - TextilesRecycling Facilities
   - WoodRecycling Facilities
   - WoodSecondary Processors

Optional but recommended:
- Phone number
- Email address
- Website URL
- GPS coordinates (Latitude/Longitude)

---

## Category Definitions

| Category | What They Accept |
|----------|-----------------|
| Electronics Recyclers | Computers, phones, TVs, appliances |
| Material Recovery Facilities (MRFs) | Mixed recyclables, sorted materials |
| PlasticRecycling Facilities | Plastic containers, bottles, packaging |
| GlassRecycling Facilities | Glass bottles, jars, containers |
| PaperRecycling Facilities | Paper, cardboard, newspapers |
| TextilesRecycling Facilities | Clothing, fabrics, textiles |
| WoodRecycling Facilities | Wood pallets, lumber, wood waste |

---

## Data Sources for Updates

To find new facilities to add, check these sources:

1. **EPA Recycling Infrastructure Map**
   - https://www.epa.gov/circulareconomy/recycling-infrastructure-and-market-opportunities-map

2. **Earth911 Search**
   - https://search.earth911.com/

3. **State Environmental Agencies**
   - Each state has an environmental department with recycling facility lists

4. **Local Government Websites**
   - City and county websites often list local recycling options

---

## Troubleshooting

### Facility not showing up after update?
- Check that the State column has the full state name
- Verify the Category matches exactly (including capitalization)
- Ensure there are no extra spaces in the data

### Search not finding a facility?
- The search looks at Name, Address, and State fields
- Make sure the facility information is spelled correctly

### Website showing old data?
- Clear your browser cache (Ctrl+Shift+Delete)
- Wait a few minutes for the server to refresh

---

## Getting Help

For technical assistance with the website, you can:
1. Open a new task in Manus to request changes
2. Contact Recyclish LLC support

---

## Data Attribution

The original data in this directory comes from the **U.S. Environmental Protection Agency (EPA) Recycling Infrastructure dataset**. When adding new facilities, please verify information is accurate and up-to-date.

---

*Last Updated: February 2026*
*Maintained by Recyclish LLC*
