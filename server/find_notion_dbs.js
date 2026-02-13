import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const NOTION_API_KEY = process.env.NOTION_API_KEY;

async function listDatabases() {
    try {
        const response = await fetch("https://api.notion.com/v1/search", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NOTION_API_KEY}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
            },
            body: JSON.stringify({
                filter: {
                    value: "database",
                    property: "object"
                },
                sort: {
                    direction: "ascending",
                    timestamp: "last_edited_time"
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error:', response.status, errorText);
            return;
        }

        const data = await response.json();
        console.log('Found databases:', data.results.length);
        console.log('---');

        data.results.forEach((db) => {
            const title = db.title && db.title.length > 0 ? db.title[0].plain_text : 'Untitled';
            console.log(`Name: ${title}`);
            console.log(`ID: ${db.id}`);
            console.log(`Properties: ${Object.keys(db.properties).join(', ')}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

listDatabases();
