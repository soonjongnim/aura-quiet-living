import { queryDataSource } from './server/notion.js';

async function test() {
    console.log('Testing Notion Data Source API...');
    try {
        const result = await queryDataSource();
        console.log('Success! Data Source Result:');
        console.log(JSON.stringify(result, null, 2));

        if (result.results) {
            console.log(`Found ${result.results.length} items.`);
        }
    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

test();
