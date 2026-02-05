const db = require('./db');

console.log('--- Model Weights ---');
const weights = db.prepare('SELECT * FROM model_weights WHERE id = 1').get();
console.log(JSON.stringify(weights, null, 2));

console.log('\n--- User 1 Actions ---');
const actions = db.prepare(`
    SELECT 
        productId,
        actionType,
        COUNT(*) as count
    FROM actions
    WHERE userId = '1'
    GROUP BY productId, actionType
`).all();
console.log(JSON.stringify(actions, null, 2));

console.log('\n--- Training Logs ---');
const logs = db.prepare('SELECT * FROM training_logs ORDER BY timestamp DESC LIMIT 3').all();
console.log(JSON.stringify(logs, null, 2));

db.close();
