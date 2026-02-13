import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';

console.log('[Debug] Minimal server loading...');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', debug: true });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT} (DEBUG MODE)`);
    });
}

export default app;
