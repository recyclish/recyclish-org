/**
 * Migration script: Import cleaned recycling facility CSV data into PostgreSQL.
 *
 * Maps CSV columns to the `shelters` table schema:
 *   - Address is parsed into addressLine1, city, zip
 *   - Category -> shelterType (after dropping the old animal-shelter CHECK constraint)
 *   - Feedstock -> speciesServed[] (repurposed field for materials)
 *   - Coordinates -> latitude, longitude, and PostGIS geography point
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/import-csv-to-postgres.mjs
 *   or: place DATABASE_URL in .env and run node scripts/import-csv-to-postgres.mjs
 *
 * The script is idempotent: it clears existing csv_import rows before re-inserting.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// ── Load .env if present ────────────────────────────────────────────────────
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[k] = v;
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Add it to .env or pass as env var.');
  process.exit(1);
}

// ── CSV parser ───────────────────────────────────────────────────────────────
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, ''); // strip BOM
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, idx) => { obj[h.trim()] = (values[idx] || '').trim(); });
    rows.push(obj);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) { result.push(cur); cur = ''; }
    else cur += c;
  }
  result.push(cur);
  return result;
}

// ── Address parser ───────────────────────────────────────────────────────────
// CSV address format: "Street[, Suite], City, StateAbbr[, Zip|Country]"
const STATE_ABBREV = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',
  CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',
  IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',
  ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',
  MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',
  NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',
  NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',
  PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',
  TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',
  WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia',
};

function parseAddress(rawAddress) {
  const parts = rawAddress.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return { addressLine1: rawAddress, city: '', zip: '' };

  // Find the state abbreviation part (2-letter uppercase)
  let stateIdx = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^[A-Z]{2}$/.test(parts[i]) && STATE_ABBREV[parts[i]]) {
      stateIdx = i;
      break;
    }
  }

  if (stateIdx === -1) {
    // Fallback: use last meaningful parts
    return {
      addressLine1: parts.slice(0, Math.max(1, parts.length - 2)).join(', '),
      city: parts[parts.length - 2] || '',
      zip: '',
    };
  }

  // City is the part just before the state
  const city = stateIdx > 0 ? parts[stateIdx - 1] : '';
  // Street is everything before the city
  const addressLine1 = parts.slice(0, Math.max(1, stateIdx - 1)).join(', ');
  // Zip is the part after state if it looks like a zip code
  let zip = '';
  if (stateIdx + 1 < parts.length) {
    const candidate = parts[stateIdx + 1];
    if (/^\d{5}(-\d{4})?$/.test(candidate)) zip = candidate;
  }

  return { addressLine1: addressLine1 || parts[0], city, zip };
}

// ── Slug generator ───────────────────────────────────────────────────────────
const slugsSeen = new Set();
function makeSlug(name, addressLine1) {
  let base = `${name} ${addressLine1}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
  let slug = base;
  let n = 2;
  while (slugsSeen.has(slug)) { slug = `${base}-${n++}`; }
  slugsSeen.add(slug);
  return slug;
}

// ── Category -> shelterType mapping ─────────────────────────────────────────
// We map CSV categories to a recycling-specific type vocabulary.
// The DB CHECK constraint will be dropped before import.
function mapCategory(category) {
  const c = (category || '').trim();
  if (!c) return 'community_resource';
  // Return a slug-safe version of the category for shelterType
  return c.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '').slice(0, 60);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const require = createRequire(import.meta.url);
  const { Client } = require('pg');

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('Connected to PostgreSQL.');

  try {
    // Step 1: Drop the old animal-shelter CHECK constraint on shelter_type
    console.log('\nStep 1: Updating shelter_type constraint for recycling categories...');
    await client.query(`
      ALTER TABLE shelters
        DROP CONSTRAINT IF EXISTS shelters_shelter_type_check
    `);
    console.log('  Constraint dropped (or did not exist).');

    // Step 2: Check existing data
    const { rows: countRows } = await client.query(`SELECT COUNT(*) as cnt FROM shelters`);
    const existingCount = parseInt(countRows[0].cnt, 10);
    console.log(`\nStep 2: Current shelters table has ${existingCount} rows.`);

    if (existingCount > 0) {
      // Only clear rows that were previously imported from CSV (description = 'csv_import')
      const { rowCount } = await client.query(`DELETE FROM shelters WHERE description = 'csv_import'`);
      console.log(`  Cleared ${rowCount} previously imported CSV rows.`);
    }

    // Step 3: Parse CSV
    const csvPath = path.join(projectRoot, 'client/public/data/master_recycling_directory.csv');
    console.log(`\nStep 3: Parsing CSV: ${csvPath}`);
    const records = parseCSV(csvPath);
    console.log(`  Found ${records.length} records.`);

    // Step 4: Insert in batches
    console.log('\nStep 4: Inserting records...');
    const BATCH = 50;
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < records.length; i += BATCH) {
      const batch = records.slice(i, i + BATCH);
      for (const r of batch) {
        const name = (r.Name || '').trim();
        if (!name) { skipped++; continue; }

        const { addressLine1, city, zip } = parseAddress(r.Address || '');
        const state = (r.State || '').trim();
        const lat = parseFloat(r.Latitude);
        const lng = parseFloat(r.Longitude);
        const hasCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

        const slug = makeSlug(name, addressLine1);
        const shelterType = mapCategory(r.Category);
        const feedstock = r.Feedstock ? r.Feedstock.split(/[,;|]/).map(s => s.trim()).filter(Boolean) : [];

        try {
          await client.query(`
            INSERT INTO shelters (
              name, slug, description,
              address_line1, city, state, zip,
              latitude, longitude, location,
              phone, email, website,
              hours_of_operation,
              shelter_type, species_served, services,
              is_no_kill, verified, active
            ) VALUES (
              $1, $2, $3,
              $4, $5, $6, $7,
              $8, $9,
              ${hasCoords ? `ST_MakePoint($10, $11)::geography` : 'NULL'},
              $12, $13, $14,
              $15,
              $16, $17, $18,
              false, false, true
            )
          `, [
            name.slice(0, 255),
            slug,
            'csv_import',
            (addressLine1 || r.Address || '').slice(0, 500),
            city.slice(0, 100),
            state.slice(0, 100),
            zip.slice(0, 20),
            hasCoords ? lat : null,
            hasCoords ? lng : null,
            ...(hasCoords ? [lng, lat] : []),
            (r.Phone || '').slice(0, 100) || null,
            (r.Email || '').slice(0, 320) || null,
            (r.Website || '').slice(0, 500) || null,
            r.Hours ? JSON.stringify(r.Hours) : null,
            shelterType.slice(0, 60),
            feedstock,
            r.Facility_Type ? [r.Facility_Type.slice(0, 150)] : [],
          ]);
          inserted++;
        } catch (err) {
          skipped++;
          if (process.env.VERBOSE) console.error(`  SKIP [${name}]: ${err.message}`);
        }
      }
      process.stdout.write(`\r  Progress: ${Math.min(i + BATCH, records.length)}/${records.length} processed, ${inserted} inserted, ${skipped} skipped...`);
    }
    console.log('');

    // Step 5: Verify
    const { rows: finalCount } = await client.query(`SELECT COUNT(*) as cnt FROM shelters WHERE active = true`);
    console.log(`\nMigration complete!`);
    console.log(`  Inserted: ${inserted}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Total active in DB: ${finalCount[0].cnt}`);

    // Category breakdown
    const { rows: cats } = await client.query(`
      SELECT shelter_type, COUNT(*) as cnt
      FROM shelters
      WHERE description = 'csv_import'
      GROUP BY shelter_type
      ORDER BY cnt DESC
      LIMIT 20
    `);
    console.log('\nCategory breakdown (imported):');
    for (const row of cats) {
      console.log(`  ${row.shelter_type}: ${row.cnt}`);
    }

  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

main().catch(err => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
