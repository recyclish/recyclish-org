import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.PORKBUN_API_KEY;
const SECRET_KEY = process.env.PORKBUN_SECRET_KEY;
const DOMAIN = process.env.PORKBUN_DOMAIN || 'recyclish.pet';
const CLOUDFLARE_PAGES_URL = 'recyclish-org.pages.dev';

const PORKBUN_API_URL = 'https://api.porkbun.com/api/json/v3';

async function updateDNS() {
    console.log(`🚀 Updating DNS for ${DOMAIN} to point to ${CLOUDFLARE_PAGES_URL}...`);

    if (!API_KEY || !SECRET_KEY) {
        console.error('Error: PORKBUN_API_KEY or PORKBUN_SECRET_KEY is missing in .env');
        process.exit(1);
    }

    try {
        // 1. Fetch current DNS records to find IDs to delete/update
        const dnsResponse = await axios.post(`${PORKBUN_API_URL}/dns/retrieve/${DOMAIN}`, {
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
        });

        if (dnsResponse.data.status !== 'SUCCESS') {
            throw new Error(`Failed to retrieve DNS records: ${dnsResponse.data.message}`);
        }

        const records = dnsResponse.data.records;

        // 2. Identify records to remove (ALIAS at root and wildcard CNAME)
        const recordsToDelete = records.filter((r: any) =>
            (r.type === 'ALIAS' && r.name === DOMAIN) ||
            (r.type === 'CNAME' && r.name === `*.${DOMAIN}`) ||
            (r.type === 'CNAME' && r.name === `www.${DOMAIN}`)
        );

        for (const record of recordsToDelete) {
            console.log(`🗑️ Deleting ${record.type} record [${record.name}]...`);
            await axios.post(`${PORKBUN_API_URL}/dns/delete/${DOMAIN}/${record.id}`, {
                apikey: API_KEY,
                secretapikey: SECRET_KEY,
            });
        }

        // 3. Create new records
        // Root ALIAS record
        console.log(`➕ Creating ALIAS record for ${DOMAIN} -> ${CLOUDFLARE_PAGES_URL}...`);
        await axios.post(`${PORKBUN_API_URL}/dns/create/${DOMAIN}`, {
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
            name: '',
            type: 'ALIAS',
            content: CLOUDFLARE_PAGES_URL,
            ttl: '600'
        });

        // www CNAME record
        console.log(`➕ Creating CNAME record for www.${DOMAIN} -> ${CLOUDFLARE_PAGES_URL}...`);
        await axios.post(`${PORKBUN_API_URL}/dns/create/${DOMAIN}`, {
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
            name: 'www',
            type: 'CNAME',
            content: CLOUDFLARE_PAGES_URL,
            ttl: '600'
        });

        console.log('\n✨ DNS Update Complete! It may take a few minutes for changes to propagate.');
        console.log(`👉 Visit: http://${DOMAIN}`);

    } catch (error: any) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

updateDNS();
