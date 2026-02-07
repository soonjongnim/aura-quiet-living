import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';

console.log('[Init] Server index.js loading...');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health Check API - No DB dependency
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        env: process.env.NODE_ENV,
        node: process.version,
        timestamp: new Date().toISOString()
    });
});

// Database and ML imports (Static for now, but used carefully)
let db;
let ml;

async function initDb() {
    if (db) return db;
    try {
        console.log('[Init] Importing database...');
        const dbModule = await import('./db.js');
        db = dbModule.default;
        console.log('[Init] Importing ML module...');
        ml = await import('./ml.js');
        console.log('[Init] Database and ML modules loaded.');
        return db;
    } catch (err) {
        console.error('[Error] Failed to initialize database:', err);
        throw err;
    }
}


// Login API
app.post('/api/login', async (req, res) => {
    try {
        const db = await initDb();
        const { username, password } = req.body;
        const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);

        if (user) {
            res.json({ success: true, user: { id: user.id, username: user.username } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Products API
app.get('/api/products', async (req, res) => {
    try {
        const db = await initDb();
        const products = db.prepare('SELECT * FROM products').all();
        // Parse features JSON string back into array
        const formattedProducts = products.map(p => ({
            ...p,
            features: JSON.parse(p.features)
        }));
        res.json(formattedProducts);
    } catch (error) {
        console.error('Products Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
});

// Recommendation API
app.get('/api/recommend', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    try {
        const db = await initDb();
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
app.get('/api/admin/status', async (req, res) => {
    try {
        const db = await initDb();
        const weights = db.prepare('SELECT * FROM model_weights WHERE id = 1').get();
        const logs = db.prepare('SELECT * FROM training_logs ORDER BY timestamp DESC LIMIT 10').all();
        res.json({ weights, logs });
    } catch (error) {
        console.error('Admin Status Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Admin API - Trigger Training
app.post('/api/admin/train', async (req, res) => {
    try {
        await initDb();
        const result = await ml.trainModel();
        res.json(result);
    } catch (error) {
        console.error('Training Error:', error);
        res.status(500).json({ success: false, error: 'Training failed' });
    }
});



// Action Tracking API
app.post('/api/track', async (req, res) => {
    const { userId, actionType, productId } = req.body;

    if (!userId || !actionType || !productId) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const db = await initDb();
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

// Catch-all for /api
app.use('/api/*', (req, res) => {
    console.log(`[404] API Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'API endpoint not found', url: req.url });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

export default app;
