import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../drizzle/schema';
import { sql } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables manually if not using a library
// Load environment variables manually
function loadEnv() {
    const envPaths = [
        path.join(projectRoot, '.env'),
        path.join(projectRoot, 'drizzle', '.env')
    ];

    envPaths.forEach(envPath => {
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            envContent.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith('#')) return;

                const eqIdx = trimmedLine.indexOf('=');
                if (eqIdx === -1) return;

                const key = trimmedLine.slice(0, eqIdx).trim();
                let value = trimmedLine.slice(eqIdx + 1).trim();

                // Remove surrounding quotes
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                process.env[key] = value;
            });
        }
    });
}

loadEnv();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Helper to create a URL-friendly slug
function createSlug(name: string, city: string, state: string) {
    return `${name}-${city}-${state}`
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// State normalizer
const STATES: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts',
    'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana',
    'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico',
    'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

function normalizeState(s: string) {
    const up = s.trim().toUpperCase();
    return STATES[up] || s.trim();
}

async function curateBatch(data: any[]) {
    console.log(`Processing batch of ${data.length} records...`);
    let count = 0;

    for (const row of data) {
        const state = normalizeState(row.state || '');
        // Petfinder CSV fields: address1,address2,city,country,email,id,latitude,longitude,name,phone,state,zip
        const name = row.name || 'Unknown Shelter';
        const city = row.city || '';
        const slug = createSlug(name, city, state);

        try {
            await db.insert(schema.shelters).values({
                name: name,
                slug: slug,
                description: row.description || '',
                addressLine1: row.address1 || '',
                addressLine2: row.address2 || '',
                city: city,
                state: state,
                zip: row.zip || '',
                phone: row.phone,
                email: row.email,
                website: row.website || '',
                shelterType: 'rescue',
                isNoKill: true,
                speciesServed: ['dogs', 'cats'],
                active: true,
                verified: false,
                latitude: row.latitude ? parseFloat(row.latitude) : null,
                longitude: row.longitude ? parseFloat(row.longitude) : null,
                // We'll hydrate the geography point after insert or via a trigger
            }).onConflictDoUpdate({
                target: schema.shelters.slug,
                set: {
                    updatedAt: new Date().toISOString(),
                }
            });
            count++;
            if (count % 500 === 0) {
                console.log(`  Processed ${count}/${data.length}...`);
            }
        } catch (err) {
            console.error(`Failed to curate: ${name}`, err);
        }
    }
    console.log(`Successfully curated ${count} records.`);
}

async function main() {
    console.log('--- Recyclish Curator 1.0 (Petfinder edition) ---');
    const filePath = path.join(projectRoot, 'data/petfinder_shelters.csv');

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log('Reading and parsing CSV...');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Found ${records.length} records in CSV.`);

    // Clean data: Petfinder sometimes has US/CA/MX, filter for US
    const usRecords = records.filter((r: any) => r.country === 'US');
    console.log(`Filtering for US records: ${usRecords.length} remain.`);

    await curateBatch(usRecords);

    console.log('Curation complete! Mobi has a full house. 🐾');
    process.exit(0);
}

main();
