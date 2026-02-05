#!/usr/bin/env node
/**
 * Geocode facilities with missing coordinates - V2 with improved CSV parsing.
 * Run with: node scripts/geocode-facilities-v2.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

const CSV_PATH = path.join(projectRoot, 'client/public/data/master_recycling_directory.csv');

// Get API credentials from environment
const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, '') || '';
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY || '';

if (!FORGE_API_URL || !FORGE_API_KEY) {
  console.error('Error: BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY must be set');
  process.exit(1);
}

/**
 * Geocode an address using Google Geocoding API
 */
async function geocodeAddress(address, state) {
  // Clean up the address - remove extra quotes and whitespace
  let cleanAddress = address.replace(/^["']+|["']+$/g, '').trim();
  let cleanState = state.replace(/^["']+|["']+$/g, '').trim();
  
  // If address ends with state abbreviation or name, don't duplicate
  const statePattern = new RegExp(`\\b${cleanState}\\b`, 'i');
  let fullAddress;
  if (statePattern.test(cleanAddress)) {
    fullAddress = `${cleanAddress}, USA`;
  } else {
    fullAddress = `${cleanAddress}, ${cleanState}, USA`;
  }
  
  const url = new URL(`${FORGE_API_URL}/v1/maps/proxy/maps/api/geocode/json`);
  url.searchParams.append('key', FORGE_API_KEY);
  url.searchParams.append('address', fullAddress);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Reading CSV file with proper parsing...');
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  
  // Use csv-parse for proper CSV handling
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  });
  
  console.log(`Total facilities: ${records.length}`);
  
  // Find facilities with missing coordinates
  const missingCoords = [];
  for (let i = 0; i < records.length; i++) {
    const lat = (records[i].Latitude || '').trim();
    const lng = (records[i].Longitude || '').trim();
    
    if (!lat || !lng || lat === '0' || lng === '0' || lat === 'NULL' || lng === 'NULL') {
      missingCoords.push(i);
    }
  }
  
  console.log(`Facilities with missing coordinates: ${missingCoords.length}`);
  
  if (missingCoords.length === 0) {
    console.log('No facilities need geocoding!');
    return;
  }
  
  let geocodedCount = 0;
  let failedCount = 0;
  
  for (let j = 0; j < missingCoords.length; j++) {
    const idx = missingCoords[j];
    const row = records[idx];
    const name = row.Name || 'Unknown';
    const address = row.Address || '';
    const state = row.State || '';
    
    console.log(`\n[${j + 1}/${missingCoords.length}] ${name}`);
    
    if (!address || !state) {
      console.log('  Skipping: No address or state');
      failedCount++;
      continue;
    }
    
    const coords = await geocodeAddress(address, state);
    
    if (coords) {
      records[idx].Latitude = String(coords.lat);
      records[idx].Longitude = String(coords.lng);
      geocodedCount++;
      console.log(`  ✓ ${coords.lat}, ${coords.lng}`);
    } else {
      failedCount++;
      console.log(`  ✗ Failed`);
    }
    
    // Rate limiting
    await sleep(150);
  }
  
  console.log(`\n\nGeocoding complete!`);
  console.log(`  Successfully geocoded: ${geocodedCount}`);
  console.log(`  Failed: ${failedCount}`);
  
  // Write updated CSV using csv-stringify
  console.log(`\nWriting updated CSV...`);
  
  // Get headers from first record
  const headers = Object.keys(records[0]);
  
  // Build CSV manually to preserve format
  const lines = [headers.join(',')];
  for (const record of records) {
    const values = headers.map(h => {
      const val = record[h] || '';
      // Quote if contains comma, quote, or newline
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    lines.push(values.join(','));
  }
  
  fs.writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf-8');
  
  console.log('Done!');
}

main().catch(console.error);
