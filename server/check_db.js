const db = require('./db');

try {
    const weights = db.prepare('SELECT * FROM model_weights').all();
    console.log('--- Model Weights ---');
    console.table(weights);

    const actions = db.prepare('SELECT * FROM actions ORDER BY timestamp DESC LIMIT 10').all();
    console.log('--- Last 10 Actions ---');
    console.table(actions);

    const actionCount = db.prepare('SELECT COUNT(*) as count FROM actions').get();
    console.log('Total Actions:', actionCount.count);

    const users = db.prepare('SELECT id, username FROM users').all();
    console.log('--- Users ---');
    console.table(users);
} catch (err) {
    console.error('Error checking DB:', err);
}
db.close();
