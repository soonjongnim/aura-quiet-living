
// HTTP test for Notion Order API via Vercel Dev
// Run with: node test_order_http.js

const API_URL = 'http://127.0.0.1:3001/api/order';

async function test() {
    console.log(`Testing Order API at ${API_URL}...`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'HTTP Test User',
                phone: '010-9999-8888',
                product: 'Test Product via HTTP',
                quantity: 2
            })
        });

        const text = await response.text();
        console.log('Response status:', response.status);
        console.log('Response body:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON response');
            return;
        }

        if (data.success) {
            console.log('SUCCESS: Order created via HTTP!');
        } else {
            console.error('FAILURE: Order creation failed.');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

test();
