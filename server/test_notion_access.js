import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

console.log('API Key:', NOTION_API_KEY ? NOTION_API_KEY.substring(0, 10) + '...' : 'NOT SET');
console.log('Database ID:', NOTION_DATABASE_ID || 'NOT SET');

async function testAccess() {
    try {
        // Test 1: Retrieve the specific database
        console.log('\n--- Testing Database Access ---');
        const dbResponse = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${NOTION_API_KEY}`,
                "Notion-Version": "2022-06-28",
            },
        });

        if (!dbResponse.ok) {
            const errorText = await dbResponse.text();
            console.error('Database Access Error:', dbResponse.status, errorText);
        } else {
            const dbData = await dbResponse.json();
            console.log('Database Title:', dbData.title?.[0]?.plain_text || 'Untitled');
            console.log('Properties:', Object.keys(dbData.properties).join(', '));
        }

        // Test 2: Search all databases
        console.log('\n--- Searching All Databases ---');
        const searchResponse = await fetch("https://api.notion.com/v1/search", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NOTION_API_KEY}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
            },
            body: JSON.stringify({}),  // Empty search to get all
        });

        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            console.error('Search Error:', searchResponse.status, errorText);
        } else {
            const searchData = await searchResponse.json();
            console.log('Total items found:', searchData.results.length);

            searchData.results.forEach((item) => {
                if (item.object === 'database') {
                    const title = item.title?.[0]?.plain_text || 'Untitled';
                    console.log(`- [DB] ${title}: ${item.id}`);
                }
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testAccess();
