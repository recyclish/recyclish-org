#!/usr/bin/env node
/**
 * Fix the 5 malformed facility entries and geocode them.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env') });

const CSV_PATH = path.join(projectRoot, 'client/public/data/master_recycling_directory.csv');

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, '') || '';
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY || '';

// Corrections for the 2 valid facilities
const corrections = {
  'O & M Electronic Inc.': {
    Address: '5451 W 110th St, Ste 4',
    City: 'Oak Lawn',
    State: 'Illinois',
    ZIP: '60453',
    Category: 'Electronics Recycling',
    Phone: '(708) 529-3631',
    Website: 'https://om-electronics.com'
  },
  'Veolia ES Technical Solutions, LLC (Building 5)': {
    Address: '405 N 75th Ave',
    City: 'Phoenix',
    State: 'Arizona',
    ZIP: '85043',
    Category: 'Hazardous Waste',
    Phone: '',
    Website: 'https://www.veolianorthamerica.com'
  }
};

// Names of malformed entries to remove (not real facilities)
const toRemove = [
  '(beside US Post Office)',
  'Open first Monday of each month',
  '8:00'  // Match the corrupted hours row
];

async function geocodeAddress(address, city, state, zip) {
  const fullAddress = `${address}, ${city}, ${state} ${zip}, USA`;
  
  const url = new URL(`${FORGE_API_URL}/v1/maps/proxy/maps/api/geocode/json`);
  url.searchParams.append('key', FORGE_API_KEY);
  url.searchParams.append('address', fullAddress);
  
  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.status === 'OK' && data.results?.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

async function main() {
  console.log('Reading CSV file...');
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(content, { 
    columns: true, 
    skip_empty_lines: true, 
    relax_quotes: true, 
    relax_column_count: true 
  });
  
  console.log(`Total facilities before: ${records.length}`);
  
  // Filter out malformed entries
  const filteredRecords = records.filter(r => {
    const name = r.Name || '';
    for (const badName of toRemove) {
      if (name.includes(badName)) {
        console.log(`Removing malformed entry: "${name.substring(0, 50)}..."`);
        return false;
      }
    }
    return true;
  });
  
  console.log(`Total facilities after removing malformed: ${filteredRecords.length}`);
  
  // Fix and geocode the 2 valid facilities
  for (let i = 0; i < filteredRecords.length; i++) {
    const r = filteredRecords[i];
    const correction = corrections[r.Name];
    
    if (correction) {
      console.log(`\nFixing: ${r.Name}`);
      
      // Apply corrections
      Object.assign(r, correction);
      
      // Geocode
      console.log(`  Geocoding: ${correction.Address}, ${correction.City}, ${correction.State}`);
      const coords = await geocodeAddress(
        correction.Address, 
        correction.City, 
        correction.State, 
        correction.ZIP
      );
      
      if (coords) {
        r.Latitude = String(coords.lat);
        r.Longitude = String(coords.lng);
        console.log(`  Success: ${coords.lat}, ${coords.lng}`);
      } else {
        console.log('  Failed to geocode');
      }
    }
  }
  
  // Write updated CSV
  console.log('\nWriting updated CSV...');
  const headers = Object.keys(records[0]);
  
  const lines = [headers.join(',')];
  for (const record of filteredRecords) {
    const values = headers.map(h => {
      const val = record[h] || '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    lines.push(values.join(','));
  }
  
  fs.writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf-8');
  
  console.log('Done!');
  console.log(`Final facility count: ${filteredRecords.length}`);
}

main().catch(console.error);
