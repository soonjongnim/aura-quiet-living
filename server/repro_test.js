const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function runTest() {
    const userId = 'repro_user';
    const productId = 'prod-150'; // A specific product from the 100 products

    console.log(`--- Test: Clicking ${productId} for ${userId} ---`);

    // 1. Check initial recommendations
    let res = await fetch(`http://localhost:3001/api/recommend?userId=${userId}`);
    let data = await res.json();
    console.log('Initial Top Rec:', data.recommendations[0]);

    // 2. Track 10 clicks
    for (let i = 0; i < 10; i++) {
        await fetch('http://localhost:3001/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, actionType: 'click', productId })
        });
    }
    console.log('Tracked 10 clicks.');

    // 3. Check recommendations again
    res = await fetch(`http://localhost:3001/api/recommend?userId=${userId}`);
    data = await res.json();
    console.log('Final Top Rec:', data.recommendations[0]);

    // Verify if it's our product
    if (data.recommendations[0].id === productId) {
        console.log('SUCCESS: Recommendation updated!');
    } else {
        console.log('FAILURE: Recommendation did not update!');
        console.log('Top 5:', data.recommendations.slice(0, 5));
    }
}

runTest();
