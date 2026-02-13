// Manual test for Notion Order API
import { addOrder } from './server/notion.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env.local');

console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function test() {
    console.log('Testing addOrder...');
    try {
        await addOrder('Test User', '010-1234-5678', 'Aura Harmony', 1);
        console.log('Successfully added order!');
    } catch (error) {
        console.error('Failed to add order:', error);
    }
}

test();
