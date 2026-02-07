import express from 'express';
import cors from 'cors';
import db from './db.js';
import * as ml from './ml.js';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


// Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);

    if (user) {
        res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Products API
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    // Parse features JSON string back into array
    const formattedProducts = products.map(p => ({
        ...p,
        features: JSON.parse(p.features)
    }));
    res.json(formattedProducts);
});

// Recommendation API
app.get('/api/recommend', (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    try {
        const weights = db.prepare('SELECT * FROM model_weights WHERE id = 1').get();
        const products = db.prepare('SELECT * FROM products').all();
        const userActions = db.prepare(`
            SELECT 
                productId,
                SUM(CASE WHEN actionType = 'view' THEN 1 ELSE 0 END) as view_count,
                SUM(CASE WHEN actionType = 'click' THEN 1 ELSE 0 END) as click_count,
                SUM(CASE WHEN actionType = 'buy' THEN 1 ELSE 0 END) as buy_count
            FROM actions
            WHERE userId = ?
            GROUP BY productId
        `).all(userId);

        const recommendations = products.map(p => {
            const actions = userActions.find(a => a.productId === p.id) || { view_count: 0, click_count: 0, buy_count: 0 };
            const probability = ml.predict(actions, weights);
            return {
                id: p.id,
                name: p.name,
                probability: Math.round(probability * 100),
                actions // Include debug info locally
            };
        }).sort((a, b) => b.probability - a.probability);

        console.log(`[Recommend] User: ${userId}, Top: ${recommendations[0].name} (${recommendations[0].probability}%)`);
        res.json({ success: true, userId, recommendations });
    } catch (error) {
        console.error('Recommend Error:', error);
        res.status(500).json({ success: false, error: 'Failed to get recommendations' });
    }
});

// Admin API - Get ML Status
app.get('/api/admin/status', (req, res) => {
    const weights = db.prepare('SELECT * FROM model_weights WHERE id = 1').get();
    const logs = db.prepare('SELECT * FROM training_logs ORDER BY timestamp DESC LIMIT 10').all();
    res.json({ weights, logs });
});

// Admin API - Trigger Training
app.post('/api/admin/train', async (req, res) => {
    const result = await ml.trainModel();
    res.json(result);
});



// Action Tracking API
app.post('/api/track', (req, res) => {
    const { userId, actionType, productId } = req.body;

    if (!userId || !actionType || !productId) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const now = new Date().toLocaleString('sv', { timeZone: 'Asia/Seoul' });
        const stmt = db.prepare("INSERT INTO actions (userId, actionType, productId, timestamp) VALUES (?, ?, ?, ?)");
        stmt.run(userId, actionType, productId, now);
        console.log(`[Track] User: ${userId}, Action: ${actionType}, Product: ${productId} at ${now}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

export default app;
