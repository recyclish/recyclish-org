#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const CSV_PATH = path.join(projectRoot, 'client/public/data/master_recycling_directory.csv');

const content = fs.readFileSync(CSV_PATH, 'utf-8');
const records = parse(content, { 
  columns: true, 
  skip_empty_lines: true, 
  relax_quotes: true, 
  relax_column_count: true 
});

let count = 0;
for (let i = 0; i < records.length; i++) {
  const r = records[i];
  const lat = (r.Latitude || '').trim();
  const lng = (r.Longitude || '').trim();
  
  if (lat === '' || lng === '' || lat === '0' || lng === '0') {
    count++;
    console.log(`--- Facility ${count} (Row ${i+2}) ---`);
    console.log('Name:', r.Name);
    console.log('Address:', r.Address);
    console.log('City:', r.City);
    console.log('State:', r.State);
    console.log('ZIP:', r.ZIP);
    console.log('Category:', r.Category);
    console.log('Phone:', r.Phone);
    console.log('Website:', r.Website);
    console.log('Latitude:', r.Latitude);
    console.log('Longitude:', r.Longitude);
    console.log('');
  }
}
console.log('Total missing:', count);
