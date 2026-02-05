const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function verify() {
    const userId = 'test';
    const productId = 'p5'; // Aura Beam

    console.log('--- Initial Recommendation for Aura Beam ---');
    let res = await fetch(`http://localhost:3001/api/recommend?userId=${userId}`);
    let data = await res.json();
    let p5 = data.recommendations.find(r => r.id === productId);
    console.log(`P5 Rank: ${data.recommendations.indexOf(p5) + 1}, Prob: ${p5.probability}%`);

    console.log('--- Adding 5 clicks to P5 ---');
    for (let i = 0; i < 5; i++) {
        await fetch('http://localhost:3001/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, actionType: 'click', productId })
        });
    }

    console.log('--- Verifying Update ---');
    res = await fetch(`http://localhost:3001/api/recommend?userId=${userId}`);
    data = await res.json();
    p5 = data.recommendations.find(r => r.id === productId);
    console.log(`P5 Rank: ${data.recommendations.indexOf(p5) + 1}, Prob: ${p5.probability}%`);
    console.log('Top 3:', data.recommendations.slice(0, 3).map(r => `${r.name} (${r.probability}%)`).join(', '));
}

verify();
