import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = "2025-09-03";

async function findDataSources() {
    console.log('Searching for all accessible data sources...');
    try {
        const response = await fetch("https://api.notion.com/v1/search", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NOTION_API_KEY}`,
                "Content-Type": "application/json",
                "Notion-Version": NOTION_VERSION,
            },
            body: JSON.stringify({
                filter: {
                    value: "data_source",
                    property: "object"
                }
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error:', response.status, text);
            return;
        }

        const data = await response.json();
        console.log(`Found ${data.results.length} data sources:`);
        data.results.forEach((ds, i) => {
            console.log(`[${i}] ID: ${ds.id} | Name: ${ds.name || 'Untitled'}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findDataSources();
