const db = require('./db');
const ml = require('./ml');

const userId = 'test';
const weights = db.prepare('SELECT * FROM model_weights WHERE id = 1').get();
const products = db.prepare('SELECT id, name FROM products').all();

const userActions = db.prepare(`
    SELECT 
        productId,
        SUM(CASE WHEN actionType = 'view' THEN 1 ELSE 0 END) as v,
        SUM(CASE WHEN actionType = 'click' THEN 1 ELSE 0 END) as c,
        SUM(CASE WHEN actionType = 'buy' THEN 1 ELSE 0 END) as b
    FROM actions
    WHERE userId = ?
    GROUP BY productId
`).all(userId);

const recs = products.map(p => {
    const a = userActions.find(au => au.productId === p.id) || { v: 0, c: 0, b: 0 };
    const prob = ml.predict({ view_count: a.v, click_count: a.c, buy_count: a.b }, weights);
    return { id: p.id, name: p.name.substring(0, 10), prob: prob.toFixed(4), clicks: a.c };
}).sort((a, b) => b.prob - a.prob);

console.log('--- Top 10 Recommendations ---');
recs.slice(0, 10).forEach((r, i) => {
    console.log(`${i + 1}. ${r.id} | ${r.name} | Prob: ${r.prob} | Clicks: ${r.clicks}`);
});

console.log('\n--- Specific Product Checks (Search for p5) ---');
const p5 = recs.find(r => r.id === 'p5');
if (p5) console.log(`Found p5: Prob: ${p5.prob}, Clicks: ${p5.clicks}`);

db.close();
