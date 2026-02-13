import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import * as notion from './notion.js';
import * as ml from './ml.js';

console.log('[Init] Server index.js starting load...');

const app = express();
const PORT = 3001;

console.log('[Init] Setting up middleware...');
app.use(cors());
console.log('[Init] CORS added.');
app.use(express.json());
console.log('[Init] JSON parser added.');

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

console.log('[Init] Logger added.');

// Health Check API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: 'notion',
        env: process.env.NODE_ENV,
        node: process.version,
        timestamp: new Date().toISOString()
    });
});

console.log('[Init] Health endpoint added.');

// Login API
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await notion.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            res.json({ success: true, user: { id: user.id || user.username, username: user.username } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error (Notion)' });
    }
});

// Products API
app.get('/api/products', async (req, res) => {
    console.log('[API] GET /api/products called');
    try {
        const products = await notion.getProducts();
        console.log(`[API] Fetched ${products.length} products from Notion`);
        const formattedProducts = products.map((p, idx) => {
            try {
                return {
                    ...p,
                    features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features
                };
            } catch (e) {
                console.warn(`[API] JSON parse failed for product at index ${idx}:`, p.name);
                return { ...p, features: [] };
            }
        });
        console.log('[API] Successfully formatted products');
        res.json(formattedProducts);
    } catch (error) {
        console.error('Products Error Detailed:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch products from Notion', details: error.message });
    }
});

// Recommendation API
app.get('/api/recommend', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    try {
        const weightsList = await notion.getModelWeights();
        const weights = weightsList[0] || { bias: 0, w_view: 0.1, w_click: 0.5, w_buy: 1.0 };

        const products = await notion.getProducts();
        const allActions = await notion.getActions();

        const recommendations = products.map(p => {
            const userActions = allActions.filter(a => a.userId.toString() === userId.toString() && a.productId.toString() === p.id.toString());
            const counts = {
                view_count: userActions.filter(a => a.actionType === 'view').length,
                click_count: userActions.filter(a => a.actionType === 'click').length,
                buy_count: userActions.filter(a => a.actionType === 'buy').length
            };

            const probability = ml.predict(counts, weights);
            return {
                id: p.id,
                name: p.name,
                probability: Math.round(probability * 100),
                actions: counts
            };
        }).sort((a, b) => b.probability - a.probability);

        res.json({ success: true, userId, recommendations });
    } catch (error) {
        console.error('Recommend Error:', error);
        res.status(500).json({ success: false, error: 'Failed to get recommendations from Notion' });
    }
});

// Admin API - Status
app.get('/api/admin/status', async (req, res) => {
    try {
        const weightsList = await notion.getModelWeights();
        const logs = await notion.getTrainingLogs();
        res.json({
            weights: weightsList[0],
            logs: logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
        });
    } catch (error) {
        console.error('Admin Status Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Admin API - Train
app.post('/api/admin/train', async (req, res) => {
    try {
        const result = await ml.trainModel();
        res.json(result);
    } catch (error) {
        console.error('Training Error:', error);
        res.status(500).json({ success: false, error: 'Training failed' });
    }
});

// Order API
app.post('/api/order', async (req, res) => {
    try {
        const { name, phone, product, quantity } = req.body;
        await notion.addOrder(name, phone, product, quantity);
        res.json({ success: true });
    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

// Track API
app.post('/api/track', async (req, res) => {
    try {
        const { userId, actionType, productId } = req.body;
        await notion.trackAction(userId, actionType, productId);
        res.json({ success: true });
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ success: false, error: 'Notion tracking error' });
    }
});

console.log('[Init] All routes added.');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} (Notion Mode)`);
});

export default app;
