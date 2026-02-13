import { queryDataSource } from './server/notion.js';

async function scan() {
    try {
        const result = await queryDataSource();
        console.log(`Scan started. Total items: ${result.results?.length || 0}`);

        result.results?.forEach((item, i) => {
            const props = Object.keys(item.properties || {});
            console.log(`[${i}] ID: ${item.id} | Props: ${props.join(', ')}`);

            // Check for specific markers
            if (props.includes('price')) console.log('  -> Likely a PRODUCT');
            if (props.includes('username')) console.log('  -> Likely a USER');
            if (props.includes('actionType')) console.log('  -> Likely an ACTION');
            if (props.includes('bias')) console.log('  -> Likely MODEL_WEIGHTS');
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

scan();
