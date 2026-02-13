import { queryDataSource } from './server/notion.js';

async function listObjects() {
    try {
        const result = await queryDataSource();
        console.log(`Total results: ${result.results?.length || 0}`);

        result.results?.forEach((item, i) => {
            const id = item.id;
            const objectType = item.object;
            let title = 'Untitled';

            if (item.properties) {
                // Try to find a title-like property
                const titleProp = item.properties.title || item.properties.Name || item.properties.Name;
                if (titleProp && titleProp.title && titleProp.title[0]) {
                    title = titleProp.title[0].plain_text;
                } else if (item.properties.Name && item.properties.Name.rich_text && item.properties.Name.rich_text[0]) {
                    title = item.properties.Name.rich_text[0].plain_text;
                } else if (item.child_database && item.child_database.title) {
                    title = item.child_database.title;
                } else if (item.properties.username && item.properties.username.title && item.properties.username.title[0]) {
                    // Check for user table specifically
                    title = `User: ${item.properties.username.title[0].plain_text}`;
                } else if (item.properties.name && item.properties.name.title && item.properties.name.title[0]) {
                    // Check for product table specifically
                    title = `Product: ${item.properties.name.title[0].plain_text}`;
                }
            }

            console.log(`[${i}] ID: ${id} | Object: ${objectType} | Title: ${title}`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listObjects();
