import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const NOTION_API_KEY = process.env.NOTION_API_KEY;

console.log('API Key:', NOTION_API_KEY);

async function searchDatabases() {
    console.log('\n=== Searching all accessible databases ===\n');

    try {
        const response = await fetch("https://api.notion.com/v1/search", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                filter: {
                    value: 'database',
                    property: 'object'
                }
            }),
        });

        console.log('Status:', response.status);

        if (!response.ok) {
            const text = await response.text();
            console.error('Error:', text);
            return;
        }

        const data = await response.json();
        console.log('Found databases:', data.results.length);
        console.log('---');

        data.results.forEach((db) => {
            const title = db.title?.[0]?.plain_text || 'Untitled';
            console.log(`Name: ${title}`);
            console.log(`ID: ${db.id}`);
            console.log(`Properties: ${Object.keys(db.properties).join(', ')}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

searchDatabases();
