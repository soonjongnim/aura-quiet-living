import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const PAGE_ID = '30129c05-d6e6-8011-b214-fa0b4d29d6e7';

async function test() {
    console.log('API Key:', NOTION_API_KEY?.substring(0, 15) + '...');
    console.log('Page ID:', PAGE_ID);

    // Test 1: Can we access the page?
    console.log('\n=== Test 1: Retrieve Page ===');
    try {
        const r1 = await fetch(`https://api.notion.com/v1/pages/${PAGE_ID}`, {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
            },
        });
        console.log('Status:', r1.status);
        const d1 = await r1.json();
        if (r1.ok) {
            console.log('Page URL:', d1.url);
            console.log('Page parent type:', d1.parent?.type);
        } else {
            console.log('Error:', d1.message);
        }
    } catch (e) { console.error(e); }

    // Test 2: Get block children
    console.log('\n=== Test 2: Block Children ===');
    try {
        const r2 = await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children?page_size=100`, {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
            },
        });
        console.log('Status:', r2.status);
        const d2 = await r2.json();
        if (r2.ok) {
            console.log('Total blocks:', d2.results.length);
            d2.results.forEach((block, i) => {
                console.log(`  [${i}] type: ${block.type}, id: ${block.id}`);
                if (block.type === 'child_database') {
                    console.log(`      -> DB title: ${block.child_database?.title}`);
                }
            });
        } else {
            console.log('Error:', d2.message);
        }
    } catch (e) { console.error(e); }

    // Test 3: Try to retrieve as database directly
    console.log('\n=== Test 3: Retrieve as Database ===');
    try {
        const r3 = await fetch(`https://api.notion.com/v1/databases/${PAGE_ID}`, {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
            },
        });
        console.log('Status:', r3.status);
        const d3 = await r3.json();
        if (r3.ok) {
            console.log('DB Title:', d3.title?.[0]?.plain_text);
            console.log('Properties:', Object.keys(d3.properties).join(', '));
        } else {
            console.log('Error:', d3.message);
        }
    } catch (e) { console.error(e); }

    // Test 4: Search ALL (no filter)
    console.log('\n=== Test 4: Search All ===');
    try {
        const r4 = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({}),
        });
        console.log('Status:', r4.status);
        const d4 = await r4.json();
        if (r4.ok) {
            console.log('Total results:', d4.results.length);
            d4.results.forEach((item, i) => {
                const title = item.object === 'database'
                    ? (item.title?.[0]?.plain_text || 'Untitled DB')
                    : (item.properties?.title?.title?.[0]?.plain_text || item.properties?.Name?.title?.[0]?.plain_text || 'Untitled Page');
                console.log(`  [${i}] ${item.object}: "${title}" id: ${item.id}`);
            });
        } else {
            console.log('Error:', d4.message);
        }
    } catch (e) { console.error(e); }
}

test();
