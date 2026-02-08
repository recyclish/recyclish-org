/**
 * Migration script: Import recycling facility CSV data into the live database.
 * 
 * Imports from three CSV sources:
 * 1. master_recycling_directory.csv (~2,692 records)
 * 2. sharps_disposal_locations.csv (~109 records)
 * 3. retail_takeback_locations.csv (~60 records)
 * 
 * Usage: node scripts/migrate-csv-to-db.mjs
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load env
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found. Set it in .env or environment.');
  process.exit(1);
}

// Use mysql2 directly for bulk inserts
const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse a CSV file into array of objects
function parseCSVFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    return obj;
  });
}

// Normalize state names from abbreviations to full names
const STATE_ABBREV = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
  'PR': 'Puerto Rico', 'GU': 'Guam', 'VI': 'U.S. Virgin Islands',
};

function normalizeState(state) {
  if (!state) return '';
  const trimmed = state.trim();
  return STATE_ABBREV[trimmed] || trimmed;
}

function truncate(str, maxLen) {
  if (!str) return str;
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

async function main() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Check if facilities table already has data
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM facilities');
    if (existing[0].count > 0) {
      console.log(`WARNING: facilities table already has ${existing[0].count} records.`);
      console.log('Clearing existing data before re-import...');
      await connection.execute('DELETE FROM facilities');
      await connection.execute('ALTER TABLE facilities AUTO_INCREMENT = 1');
    }

    // 1. Import master recycling directory
    const masterPath = path.join(projectRoot, 'client/public/data/master_recycling_directory.csv');
    console.log(`\nParsing master CSV: ${masterPath}`);
    const masterRecords = parseCSVFile(masterPath);
    console.log(`  Found ${masterRecords.length} records`);

    const masterRows = masterRecords.map(r => [
      truncate(r.Name, 255) || 'Unknown',
      truncate(r.Address, 500) || '',
      truncate(r.State, 100) || '',
      truncate(r.County, 100) || null,
      truncate(r.Phone, 100) || null,
      truncate(r.Email, 320) || null,
      truncate(r.Website, 500) || null,
      truncate(r.Category, 150) || 'General',
      truncate(r.Facility_Type, 150) || null,
      r.Feedstock || null,
      truncate(r.NAICS_Code, 20) || null,
      r.Latitude ? truncate(String(r.Latitude), 30) : null,
      r.Longitude ? truncate(String(r.Longitude), 30) : null,
      truncate(r.Hours, 500) || null,
      truncate(r.Accepts_Dropoff, 50) || null,
      truncate(r.Fee_Structure, 50) || null,
      r.Fee_Details || null,
      truncate(r.Offers_Payment, 50) || null,
      r.Payment_Details || null,
      'csv_import',
    ]);

    // 2. Import sharps disposal locations
    const sharpsPath = path.join(projectRoot, 'client/public/data/sharps_disposal_locations.csv');
    console.log(`\nParsing sharps CSV: ${sharpsPath}`);
    const sharpsRecords = parseCSVFile(sharpsPath);
    console.log(`  Found ${sharpsRecords.length} records`);

    const sharpsRows = sharpsRecords.map(r => [
      truncate(r.Name, 255) || 'Unknown',
      truncate(r.Address, 500) || '',
      truncate(r.State, 100) || '',
      truncate(r.County, 100) || null,
      truncate(r.Phone, 100) || null,
      truncate(r.Email, 320) || null,
      truncate(r.Website, 500) || null,
      truncate(r.Category || 'Sharps Disposal', 150),
      truncate(r.Facility_Type, 150) || null,
      r.Feedstock || null,
      truncate(r.NAICS_Code, 20) || null,
      r.Latitude ? truncate(String(r.Latitude), 30) : null,
      r.Longitude ? truncate(String(r.Longitude), 30) : null,
      null, // hours
      'Yes', // acceptsDropoff - sharps locations accept drop-offs
      'Free', // feeStructure - sharps disposal is typically free
      null, // feeDetails
      null, // offersPayment
      null, // paymentDetails
      'csv_import',
    ]);

    // 3. Import retail take-back locations
    const retailPath = path.join(projectRoot, 'data/retail_takeback_locations.csv');
    console.log(`\nParsing retail CSV: ${retailPath}`);
    const retailRecords = parseCSVFile(retailPath);
    console.log(`  Found ${retailRecords.length} records`);

    const retailRows = retailRecords.map(r => {
      // Retail CSV has different column names
      const fullAddress = r.Address || '';
      const state = normalizeState(r.State);
      return [
        truncate(r.Name, 255) || 'Unknown',
        truncate(fullAddress, 500) || '',
        truncate(state, 100) || '',
        null, // county
        truncate(r.Phone, 100) || null,
        truncate(r.Email, 320) || null,
        truncate(r.Website, 500) || null,
        truncate(r.Category || 'Retail Take-Back Program', 150),
        'Retail Take-Back', // facilityType
        r.Materials_Accepted || null, // feedstock
        null, // naicsCode
        r.Latitude ? truncate(String(r.Latitude), 30) : null,
        r.Longitude ? truncate(String(r.Longitude), 30) : null,
        null, // hours
        'Yes', // acceptsDropoff
        'Free', // feeStructure
        r.Notes || null, // feeDetails
        null, // offersPayment
        null, // paymentDetails
        'csv_import',
      ];
    });

    // Combine all rows
    const allRows = [...masterRows, ...sharpsRows, ...retailRows];
    console.log(`\nTotal records to insert: ${allRows.length}`);

    // Insert in batches of 100
    const BATCH_SIZE = 100;
    const insertSQL = `INSERT INTO facilities (
      name, address, state, county, phone, email, website,
      category, facilityType, feedstock, naicsCode,
      latitude, longitude,
      hours, acceptsDropoff, feeStructure, feeDetails, offersPayment, paymentDetails,
      source
    ) VALUES ?`;

    let inserted = 0;
    for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
      const batch = allRows.slice(i, i + BATCH_SIZE);
      await connection.query(insertSQL, [batch]);
      inserted += batch.length;
      process.stdout.write(`\r  Inserted ${inserted}/${allRows.length} records...`);
    }
    console.log('\n');

    // Verify
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM facilities');
    console.log(`Migration complete! ${countResult[0].count} facilities now in database.`);

    // Show breakdown by source
    const [breakdown] = await connection.execute(
      'SELECT category, COUNT(*) as count FROM facilities GROUP BY category ORDER BY count DESC LIMIT 20'
    );
    console.log('\nCategory breakdown:');
    for (const row of breakdown) {
      console.log(`  ${row.category}: ${row.count}`);
    }

  } finally {
    await connection.end();
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
