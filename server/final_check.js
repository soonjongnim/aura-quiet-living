const db = require('./db');
const ml = require('./ml');

const userId = 'test';
const weights = db.prepare('SELECT * FROM model_weights WHERE id = 1').get();
const products = db.prepare('SELECT id, name FROM products').all();

const userActions = db.prepare(`
    SELECT 
        productId,
        SUM(CASE WHEN actionType = 'view' THEN 1 ELSE 0 END) as vc,
        SUM(CASE WHEN actionType = 'click' THEN 1 ELSE 0 END) as cc,
        SUM(CASE WHEN actionType = 'buy' THEN 1 ELSE 0 END) as bc
    FROM actions
    WHERE userId = ?
    GROUP BY productId
`).all(userId);

console.log('--- User Actions Found ---');
userActions.forEach(a => {
    console.log(`Product: ${a.productId}, Clicks: ${a.cc}`);
});

const recommendations = products.map(p => {
    const a = userActions.find(au => au.productId === p.id) || { vc: 0, cc: 0, bc: 0 };
    const prob = ml.predict({ view_count: a.vc, click_count: a.cc, buy_count: a.bc }, weights);
    return { id: p.id, prob, clicks: a.cc };
}).sort((a, b) => b.prob - a.prob);

console.log('\n--- Top 5 ---');
recommendations.slice(0, 5).forEach(r => {
    console.log(`ID: ${r.id}, Prob: ${r.prob.toFixed(4)}, Clicks: ${r.clicks}`);
});

db.close();
