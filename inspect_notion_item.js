import { queryDataSource } from './server/notion.js';

async function inspect() {
    try {
        const result = await queryDataSource();
        if (result.results && result.results[0]) {
            console.log('Inspecting first item property keys:');
            console.log(Object.keys(result.results[0].properties));
            console.log('\nFull properties of first item:');
            console.log(JSON.stringify(result.results[0].properties, null, 2));
        } else {
            console.log('No items found.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspect();
