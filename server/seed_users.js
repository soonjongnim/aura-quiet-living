const db = require('./db');

const users = [];
for (let i = 1; i <= 10; i++) {
    users.push({
        username: `user${i}`,
        password: 'password123'
    });
}

const productIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
const actionTypes = ['view', 'click', 'buy'];

console.log('Seeding 10 users...');

const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)');
const insertAction = db.prepare('INSERT INTO actions (userId, actionType, productId) VALUES (?, ?, ?)');

users.forEach(user => {
    insertUser.run(user.username, user.password);
    console.log(`Added user: ${user.username}`);

    // Add 5-15 random actions for each user to make AI recommendations meaningful
    const actionCount = Math.floor(Math.random() * 11) + 5;
    for (let j = 0; j < actionCount; j++) {
        const randomProduct = productIds[Math.floor(Math.random() * productIds.length)];
        // Weight action types: view is most common, buy is rarest
        const rand = Math.random();
        let actionType;
        if (rand < 0.6) actionType = 'view';
        else if (rand < 0.9) actionType = 'click';
        else actionType = 'buy';

        insertAction.run(user.username, actionType, randomProduct);
    }
});

console.log('Seeding completed successfully.');
process.exit(0);
