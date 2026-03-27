/**
 * import-recycling-data.mjs
 * Imports master_recycling_directory.csv into the new recyclish-directory Supabase DB.
 * Run: DATABASE_URL="postgres://..." node scripts/import-recycling-data.mjs
 */

import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../client/public/data/master_recycling_directory.csv');

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

// ── Category normalization ──────────────────────────────────────────────────
const CATEGORY_MAP = {
  'PlasticRecycling':           'Drop-off Center',
  'Plastic Recycling':          'Drop-off Center',
  'Electronics Recyclers':      'E-Waste',
  'Electronics Recycler':       'E-Waste',
  'E-Waste':                    'E-Waste',
  'HazardousWaste':             'Hazardous Waste',
  'Hazardous Waste':            'Hazardous Waste',
  'CompostingFacility':         'Composting',
  'Composting Facility':        'Composting',
  'Composting':                 'Composting',
  'ScrapMetal':                 'Scrap Metal',
  'Scrap Metal':                'Scrap Metal',
  'RetailTakeBack':             'Retail Take-Back',
  'Retail Take-Back':           'Retail Take-Back',
  'Retail TakeBack':            'Retail Take-Back',
  'CurbsidePickup':             'Curbside Pickup',
  'Curbside Pickup':            'Curbside Pickup',
  'TransferStation':            'Transfer Station',
  'Transfer Station':           'Transfer Station',
  'MaterialRecoveryFacility':   'Material Recovery Facility',
  'Material Recovery Facility': 'Material Recovery Facility',
  'MunicipalRecycling':         'Municipal Recycling',
  'Municipal Recycling':        'Municipal Recycling',
  'Drop-off Center':            'Drop-off Center',
  'DropOff':                    'Drop-off Center',
  'Drop Off':                   'Drop-off Center',
};

const VALID_TYPES = [
  'Drop-off Center', 'Curbside Pickup', 'Retail Take-Back', 'Hazardous Waste',
  'E-Waste', 'Composting', 'Scrap Metal', 'Transfer Station',
  'Material Recovery Facility', 'Municipal Recycling', 'Community Resource', 'Other'
];

function normalizeCategory(raw) {
  if (!raw) return 'Other';
  const mapped = CATEGORY_MAP[raw.trim()];
  if (mapped) return mapped;
  if (VALID_TYPES.includes(raw.trim())) return raw.trim();
  return 'Other';
}

// ── Address parsing ─────────────────────────────────────────────────────────
function parseAddress(fullAddress) {
  // Format: "4601 Riverview Blvd, St. Louis, MO, United States"
  // or:     "123 Main St, Springfield, IL 62701"
  if (!fullAddress) return { street: '', city: '', state: '', zip: '' };
  const parts = fullAddress.split(',').map(p => p.trim());
  const street = parts[0] || '';
  const city = parts[1] || '';
  // State part may contain zip: "MO 62701" or just "MO"
  const stateRaw = parts[2] || '';
  const stateMatch = stateRaw.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?/);
  const state = stateMatch ? stateMatch[1] : stateRaw.replace(/[^A-Za-z ]/g, '').trim();
  const zip = stateMatch && stateMatch[2] ? stateMatch[2] : '';
  return { street, city, state, zip };
}

// ── Slug generation ─────────────────────────────────────────────────────────
function slugify(name, address) {
  const base = `${name} ${address}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  const hash = crypto.createHash('md5').update(`${name}|${address}`).digest('hex').substring(0, 6);
  return `${base}-${hash}`;
}

// ── Main import ─────────────────────────────────────────────────────────────
async function main() {
  const pool = new pg.Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  console.log('Connecting to database...');
  const client = await pool.connect();
  console.log('Connected!');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  const slugsSeen = new Set();

  const rows = [];

  // Read CSV
  await new Promise((resolve, reject) => {
    createReadStream(CSV_PATH)
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
      .on('data', row => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Read ${rows.length} rows from CSV. Starting import...`);

  // Process in batches of 100
  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    for (const row of batch) {
      try {
        const name = (row['Name'] || '').trim();
        const fullAddress = (row['Address'] || '').trim();
        if (!name || !fullAddress) { skipped++; continue; }

        const { street, city, state, zip } = parseAddress(fullAddress);
        if (!street || !city || !state) { skipped++; continue; }

        const lat = parseFloat(row['Latitude']);
        const lon = parseFloat(row['Longitude']);
        const hasCoords = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;

        const facilityType = normalizeCategory(row['Category'] || row['Facility_Type'] || '');
        const feedstock = (row['Feedstock'] || '').trim();
        const acceptedMaterials = feedstock ? feedstock.split(/[,;]/).map(s => s.trim()).filter(Boolean) : [];

        let slug = slugify(name, fullAddress);
        // Ensure unique slug
        let attempt = 0;
        while (slugsSeen.has(slug)) {
          attempt++;
          slug = slugify(name, fullAddress) + `-${attempt}`;
        }
        slugsSeen.add(slug);

        const locationExpr = hasCoords
          ? `ST_SetSRID(ST_MakePoint($12, $11), 4326)`
          : null;

        const query = `
          INSERT INTO shelters (
            name, slug, address_line1, city, state, zip,
            phone, email, website, hours_of_operation,
            latitude, longitude, location,
            shelter_type, species_served,
            verified, active
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10,
            $11, $12, ${hasCoords ? `ST_SetSRID(ST_MakePoint($12, $11), 4326)` : 'NULL'},
            $13, $14,
            false, true
          )
          ON CONFLICT (slug) DO NOTHING
        `;

        const hoursRaw = (row['Hours'] || '').trim();
        const hoursJson = hoursRaw ? JSON.stringify({ raw: hoursRaw }) : null;

        await client.query(query, [
          name,                                    // $1
          slug,                                    // $2
          street,                                  // $3
          city,                                    // $4
          state,                                   // $5
          zip || '',                               // $6
          (row['Phone'] || '').trim() || null,     // $7
          (row['Email'] || '').trim() || null,     // $8
          (row['Website'] || '').trim() || null,   // $9
          hoursJson,                               // $10
          hasCoords ? lat : null,                  // $11
          hasCoords ? lon : null,                  // $12
          facilityType,                            // $13
          acceptedMaterials,                       // $14
        ]);
        inserted++;
      } catch (err) {
        errors++;
        if (errors <= 5) console.error(`Row error (${row['Name']}):`, err.message);
      }
    }
    process.stdout.write(`\rProgress: ${Math.min(i + BATCH, rows.length)}/${rows.length} rows processed...`);
  }

  client.release();
  await pool.end();

  console.log(`\n\n✅ Import complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Errors:   ${errors}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
