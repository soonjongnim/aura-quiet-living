import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

dotenv.config({ path: envPath });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_VERSION = "2025-09-03";

const DS_IDS = {
    users: process.env.NOTION_USERS_DS_ID,
    products: process.env.NOTION_PRODUCTS_DS_ID,
    actions: process.env.NOTION_ACTIONS_DS_ID,
    model_weights: process.env.NOTION_WEIGHTS_DS_ID,
    training_logs: process.env.NOTION_LOGS_DS_ID,
    sqlite_sequence: process.env.NOTION_SEQUENCE_DS_ID
};

/**
 * Generic query function for Notion Data Sources.
 */
export async function queryDataSource(dataSourceId, filter = {}) {
    if (!dataSourceId || !NOTION_API_KEY) {
        throw new Error(`Data Source ID (${dataSourceId}) or Notion API Key is missing`);
    }

    const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${NOTION_API_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": NOTION_VERSION,
        },
        body: JSON.stringify(filter),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notion API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
}

/**
 * Helper to parse Notion properties into a simple JS object.
 */
function parseProperties(properties) {
    const obj = {};
    for (const [key, val] of Object.entries(properties)) {
        switch (val.type) {
            case 'title':
                obj[key] = val.title[0]?.plain_text || '';
                break;
            case 'rich_text':
                obj[key] = val.rich_text[0]?.plain_text || '';
                break;
            case 'number':
                obj[key] = val.number;
                break;
            case 'select':
                obj[key] = val.select?.name || '';
                break;
            case 'multi_select':
                obj[key] = val.multi_select.map(s => s.name);
                break;
            case 'date':
                obj[key] = val.date?.start || '';
                break;
            case 'checkbox':
                obj[key] = val.checkbox;
                break;
            case 'phone_number':
                obj[key] = val.phone_number || '';
                break;
            default:
                obj[key] = val[val.type];
        }
    }
    return obj;
}

// --- Table Adapters ---

export async function getUsers() {
    const data = await queryDataSource(DS_IDS.users);
    return data.results.map(item => parseProperties(item.properties));
}

export async function getProducts() {
    const data = await queryDataSource(DS_IDS.products);
    return data.results.map(item => parseProperties(item.properties));
}

export async function getActions() {
    const data = await queryDataSource(DS_IDS.actions);
    return data.results.map(item => parseProperties(item.properties));
}

export async function getModelWeights() {
    const data = await queryDataSource(DS_IDS.model_weights);
    return data.results.map(item => parseProperties(item.properties));
}

export async function getTrainingLogs() {
    const data = await queryDataSource(DS_IDS.training_logs);
    return data.results.map(item => parseProperties(item.properties));
}

/**
 * Order submission (Writing to the Order Database)
 * Note: Data Sources might be read-only in some contexts, 
 * so we use the standard Pages API for orders as before.
 */
export async function addOrder(name, phone, product, quantity) {
    const dbId = process.env.NOTION_DATABASE_ID || '30129c05d6e68011b214fa0b4d29d6e7';
    const response = await fetch(`https://api.notion.com/v1/pages`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${NOTION_API_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": NOTION_VERSION,
        },
        body: JSON.stringify({
            parent: { data_source_id: dbId },
            properties: {
                '성함': { title: [{ text: { content: name } }] },
                '전화번호': { phone_number: phone },
                '구매 물품': { rich_text: [{ text: { content: product } }] },
                '개수': { number: parseInt(quantity, 10) },
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notion Create Page Error (${response.status}): ${errorText}`);
    }

    return await response.json();
}

/**
 * Track user actions (Click, View, Buy)
 */
export async function trackAction(userId, actionType, productId) {
    const now = new Date().toLocaleString('sv', { timeZone: 'Asia/Seoul' });
    const response = await fetch(`https://api.notion.com/v1/pages`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${NOTION_API_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": NOTION_VERSION,
        },
        body: JSON.stringify({
            parent: { data_source_id: DS_IDS.actions },
            properties: {
                'userId': { select: { name: userId.toString() } },
                'actionType': { select: { name: actionType } },
                'productId': { select: { name: productId.toString() } },
                'timestamp': { date: { start: now.replace(' ', 'T') + '+09:00' } },
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notion Track Action Error (${response.status}): ${errorText}`);
    }

    return await response.json();
}

/**
 * Update Model Weights
 */
export async function updateWeights(bias, w_view, w_click, w_buy, accuracy) {
    const now = new Date().toLocaleString('sv', { timeZone: 'Asia/Seoul' });

    const data = await queryDataSource(DS_IDS.model_weights);
    const weightPageId = data.results[0]?.id;

    if (!weightPageId) throw new Error('No model_weights page found to update');

    const response = await fetch(`https://api.notion.com/v1/pages/${weightPageId}`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${NOTION_API_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
            properties: {
                'bias': { number: bias },
                'w_view': { number: w_view },
                'w_click': { number: w_click },
                'w_buy': { number: w_buy },
                'accuracy': { number: accuracy },
                'updated_at': { date: { start: now.replace(' ', 'T') + '+09:00' } },
            },
        }),
    });

    return await response.json();
}

/**
 * Add Training Log
 */
export async function addTrainingLog(status, message) {
    const now = new Date().toLocaleString('sv', { timeZone: 'Asia/Seoul' });
    const response = await fetch(`https://api.notion.com/v1/pages`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${NOTION_API_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": NOTION_VERSION,
        },
        body: JSON.stringify({
            parent: { data_source_id: DS_IDS.training_logs },
            properties: {
                'Name': { title: [{ text: { content: status } }] },
                'message': { rich_text: [{ text: { content: message } }] },
                'timestamp': { date: { start: now.replace(' ', 'T') + '+09:00' } },
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notion addTrainingLog Error (${response.status}): ${errorText}`);
    }

    return await response.json();
}
