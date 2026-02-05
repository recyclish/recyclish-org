#!/usr/bin/env node
/**
 * Geocode facilities with missing coordinates using Google Geocoding API.
 * Run with: node scripts/geocode-facilities.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
 * Parse CSV content into array of objects
 */
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }
  
  return { headers, rows };
}

/**
 * Parse a single CSV line handling quoted fields
 */
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

/**
 * Convert rows back to CSV string
 */
function toCSV(headers, rows) {
  const escapeField = (field) => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
  };
  
  const lines = [headers.map(escapeField).join(',')];
  
  for (const row of rows) {
    const values = headers.map(h => escapeField(row[h] || ''));
    lines.push(values.join(','));
  }
  
  return lines.join('\n') + '\n';
}

/**
 * Geocode an address using Google Geocoding API
 */
async function geocodeAddress(address, state) {
  const fullAddress = `${address}, ${state}, USA`.replace(/"/g, '').trim();
  
  const url = new URL(`${FORGE_API_URL}/v1/maps/proxy/maps/api/geocode/json`);
  url.searchParams.append('key', FORGE_API_KEY);
  url.searchParams.append('address', fullAddress);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error(`  HTTP error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error(`  Geocoding failed: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`  Error: ${error.message}`);
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
  console.log('Reading CSV file...');
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const { headers, rows } = parseCSV(content);
  
  console.log(`Total facilities: ${rows.length}`);
  
  // Find facilities with missing coordinates
  const missingCoords = [];
  for (let i = 0; i < rows.length; i++) {
    const lat = rows[i].Latitude?.trim() || '';
    const lng = rows[i].Longitude?.trim() || '';
    
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
    const row = rows[idx];
    const name = row.Name || 'Unknown';
    const address = row.Address || '';
    const state = row.State || '';
    
    console.log(`\n[${j + 1}/${missingCoords.length}] Geocoding: ${name}`);
    console.log(`  Address: ${address}, ${state}`);
    
    if (!address || !state) {
      console.log('  Skipping: No address or state');
      failedCount++;
      continue;
    }
    
    const coords = await geocodeAddress(address, state);
    
    if (coords) {
      rows[idx].Latitude = String(coords.lat);
      rows[idx].Longitude = String(coords.lng);
      geocodedCount++;
      console.log(`  Success: ${coords.lat}, ${coords.lng}`);
    } else {
      failedCount++;
    }
    
    // Rate limiting
    await sleep(200);
  }
  
  console.log(`\n\nGeocoding complete!`);
  console.log(`  Successfully geocoded: ${geocodedCount}`);
  console.log(`  Failed: ${failedCount}`);
  
  // Write updated CSV
  console.log(`\nWriting updated CSV...`);
  const csvContent = toCSV(headers, rows);
  fs.writeFileSync(CSV_PATH, csvContent, 'utf-8');
  
  console.log('Done!');
}

main().catch(console.error);
