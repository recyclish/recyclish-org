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

const PORKBUN_API_URL = 'https://api.porkbun.com/api/json/v3';

async function setupUrlForward() {
    console.log(`🔧 Setting up URL Forward for ${DOMAIN} to redirect to https://www.recyclish.pet...`);

    if (!API_KEY || !SECRET_KEY) {
        console.error('Error: PORKBUN_API_KEY or PORKBUN_SECRET_KEY is missing in .env');
        process.exit(1);
    }

    try {
        // 1. Delete the existing ALIAS record at the root (if it exists) to prevent conflicts with the URL Forward
        console.log('🔍 Checking for existing root ALIAS record...');
        const dnsResponse = await axios.post(`${PORKBUN_API_URL}/dns/retrieve/${DOMAIN}`, {
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
        });

        if (dnsResponse.data.status === 'SUCCESS') {
            const rootAlias = dnsResponse.data.records.find((r: any) => r.type === 'ALIAS' && r.name === DOMAIN);
            if (rootAlias) {
                console.log(`🗑️ Deleting existing root ALIAS record (ID: ${rootAlias.id})...`);
                await axios.post(`${PORKBUN_API_URL}/dns/delete/${DOMAIN}/${rootAlias.id}`, {
                    apikey: API_KEY,
                    secretapikey: SECRET_KEY,
                });
            }
        }

        // 2. Add the URL Forward
        const response = await axios.post(`${PORKBUN_API_URL}/domain/addUrlForward/${DOMAIN}`, {
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
            subdomain: '', // root domain
            location: 'https://www.recyclish.pet',
            type: 'permanent',
            includePath: 'yes',
            wildcard: 'no',
        });

        if (response.data.status === 'SUCCESS') {
            console.log('✅ Success! Porkbun is now handling the redirect from the root to www.');
            console.log('🔒 Porkbun will also automatically handle the SSL certificate for this redirect.');
            console.log('\n✨ Done. Both recyclish.pet and www.recyclish.pet should be functional shortly!');
        } else {
            console.error('❌ Failed to add URL Forward:', response.data.message);
        }
    } catch (error: any) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

setupUrlForward();
