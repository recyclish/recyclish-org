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

async function setupUrlForwardSimple() {
    console.log(`🔧 Forcing URL Forward for ${DOMAIN} to https://www.recyclish.pet...`);

    try {
        const response = await axios.post(`${PORKBUN_API_URL}/domain/addUrlForward/${DOMAIN}`, {
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
            subdomain: '',
            location: 'https://www.recyclish.pet',
            type: 'permanent',
            includePath: 'yes',
            wildcard: 'no',
        });

        console.log('API Response:', response.data);
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

setupUrlForwardSimple();
