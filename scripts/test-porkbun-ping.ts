import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.PORKBUN_API_KEY;
const SECRET_KEY = process.env.PORKBUN_SECRET_KEY;

async function testPing() {
    console.log('Testing Porkbun Ping...');
    try {
        const response = await axios.post('https://api.porkbun.com/api/json/v3/ping', {
            apikey: API_KEY,
            secretapikey: SECRET_KEY,
        });
        console.log('✅ Ping Success:', response.data);
    } catch (error: any) {
        console.error('❌ Ping Failed:', error.response?.status, error.response?.data || error.message);
    }
}

testPing();
