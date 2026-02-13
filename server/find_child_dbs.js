import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const PAGE_ID = '30129c05d6e68011b214fa0b4d29d6e7';

async function findChildDatabases() {
    console.log('Searching for child databases in page:', PAGE_ID);

    try {
        const response = await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children?page_size=100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
            },
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error:', response.status, text);
            return;
        }

        const data = await response.json();
        console.log('Found', data.results.length, 'blocks');
        console.log('---');

        data.results.forEach((block) => {
            if (block.type === 'child_database') {
                const title = block.child_database?.title || 'Untitled';
                console.log(`Database: ${title}`);
                console.log(`ID: ${block.id}`);
                console.log('---');
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

findChildDatabases();
