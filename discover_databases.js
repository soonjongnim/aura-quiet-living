import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env.local') });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const PAGE_ID = '30129c05-d6e6-8011-b214-fa0b4d29d6e7';

async function discover() {
    try {
        const response = await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children?page_size=100`, {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
            },
        });
        const data = await response.json();
        const dbs = data.results.filter(b => b.type === 'child_database');

        console.log(`Found ${dbs.length} databases:`);
        dbs.forEach(db => {
            console.log(`Name: ${db.child_database.title} | ID: ${db.id}`);
        });
    } catch (e) { console.error(e); }
}

discover();
