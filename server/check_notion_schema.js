import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_DATABASE_ID;

async function checkSchema() {
    try {
        const response = await notion.databases.retrieve({ database_id: dbId });
        console.log('DB Title:', response.title[0]?.plain_text || 'Untitled');
        console.log('Properties:', Object.keys(response.properties));

        // Check for required fields from screenshot
        const required = ['성함', '전화번호', '구매 물품', '개수'];
        const missing = required.filter(field => !response.properties[field]);

        if (missing.length > 0) {
            console.log('Missing properties:', missing);
        } else {
            console.log('All required properties found!');
        }
    } catch (error) {
        console.error('Error:', error.body || error);
    }
}

checkSchema();
