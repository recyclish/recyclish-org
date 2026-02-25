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

async function verifyConnection() {
    console.log(`Checking Porkbun API connection for domain: ${DOMAIN}...`);

    if (!API_KEY || !SECRET_KEY) {
        console.error('Error: PORKBUN_API_KEY or PORKBUN_SECRET_KEY is missing in .env');
        process.exit(1);
    }

    try {
        // Ping verification
        const pingResponse = await axios.post(`${PORKBUN_API_URL}/ping`, {
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
        });

        if (pingResponse.data.status === 'SUCCESS') {
            console.log('✅ Porkbun API Connection: SUCCESS');
            console.log(`IP Address detected by Porkbun: ${pingResponse.data.yourIp}`);

            // Fetch DNS records
            console.log(`\nFetching current DNS records for ${DOMAIN}...`);
            const dnsResponse = await axios.post(`${PORKBUN_API_URL}/dns/retrieve/${DOMAIN}`, {
                apikey: API_KEY,
                secretapikey: SECRET_KEY,
            });

            if (dnsResponse.data.status === 'SUCCESS') {
                console.log(`✅ Retrieved ${dnsResponse.data.records.length} records:`);
                dnsResponse.data.records.forEach((record: any) => {
                    console.log(`- [${record.type}] ${record.name}: ${record.content} (TTL: ${record.ttl}, ID: ${record.id})`);
                });
            } else {
                console.error('❌ Failed to retrieve DNS records:', dnsResponse.data.message);
            }
        } else {
            console.error('❌ Porkbun API Connection Failed:', pingResponse.data.message);
        }
    } catch (error: any) {
        if (error.response) {
            console.error('❌ API Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

verifyConnection();
