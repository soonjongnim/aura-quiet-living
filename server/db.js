import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'shop.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    tagline TEXT,
    description TEXT,
    longDescription TEXT,
    price INTEGER,
    category TEXT,
    imageUrl TEXT,
    features TEXT
  );

  CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    actionType TEXT,
    productId TEXT,
    timestamp DATETIME DEFAULT (datetime('now', '+9 hours')),
    FOREIGN KEY (productId) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS model_weights (
    id INTEGER PRIMARY KEY,
    bias REAL DEFAULT 0,
    w_view REAL DEFAULT 0.1,
    w_click REAL DEFAULT 0.3,
    w_buy REAL DEFAULT 0.6,
    accuracy REAL DEFAULT 0,
    updated_at DATETIME DEFAULT (datetime('now', '+9 hours'))
  );

  CREATE TABLE IF NOT EXISTS training_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT (datetime('now', '+9 hours'))
  );

  -- Initialize weights if not exists
  INSERT OR IGNORE INTO model_weights (id, bias, w_view, w_click, w_buy) VALUES (1, -1.0, 0.5, 1.5, 3.0);
`);



// Insert product data if not exists
const products = [
  {
    id: 'p1',
    name: 'Aura Harmony',
    tagline: 'Listen naturally.',
    description: 'Audio that feels like the open air. Constructed with warm acoustic fabric and recycled sandstone composite.',
    longDescription: 'Experience sound as it was meant to be heard—unconfined and organic. The Aura Harmony headphones feature our proprietary open-air driver technology, encased in a breathable acoustic fabric that adapts to your temperature. The headband is crafted from a recycled sandstone composite, offering a unique, cool-to-the-touch texture that grounds you in the present moment.',
    price: 429,
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
    features: JSON.stringify(['Organic Noise Cancellation', '50h Battery', 'Natural Soundstage'])
  },
  {
    id: 'p2',
    name: 'Aura Epoch',
    tagline: 'Moments, not minutes.',
    description: 'A timepiece designed for wellness. Ceramic casing with a strap made from sustainable vegan leather.',
    longDescription: 'Time is not a sequence of numbers, but a flow of moments. The Aura Epoch rethinks the smartwatch interface, using a calm E-Ink hybrid display that mimics paper. It tracks stress through skin temperature and heart rate variability, gently vibrating to remind you to breathe. The ceramic casing is hypoallergenic and smooth, polished by hand for 48 hours.',
    price: 349,
    category: 'Wearable',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000',
    features: JSON.stringify(['Stress Monitoring', 'E-Ink Hybrid Display', '7-Day Battery'])
  },
  {
    id: 'p3',
    name: 'Aura Canvas',
    tagline: 'Capture the warmth.',
    description: 'A display that mimics the properties of paper. Soft on the eyes, vivid in color, and textured to the touch.',
    longDescription: 'Screens shouldn\'t feel like looking into a lightbulb. Aura Canvas uses a matte, nano-etched OLED panel that scatters ambient light, creating a display that looks and feels like high-quality magazine paper. Perfect for reading, sketching, or displaying art, it brings a tactile warmth to your digital life.',
    price: 1099,
    category: 'Mobile',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000',
    features: JSON.stringify(['Paper-like OLED', 'Portrait Lens', 'Sandstone Texture'])
  },
  {
    id: 'p4',
    name: 'Aura Essence',
    tagline: 'Return to nature.',
    description: 'An air purifier that doubles as a sculpture. Whisper quiet, diffusing subtle natural scents while cleaning your space.',
    longDescription: 'Clean air is the foundation of a clear mind. Aura Essence uses a moss-based bio-filter combined with HEPA technology to scrub pollutants from your home. It gently diffuses natural essential oils—cedar, bergamot, and rain—orchestrated to match the time of day.',
    price: 599,
    category: 'Home',
    imageUrl: 'https://images.pexels.com/photos/8092420/pexels-photo-8092420.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    features: JSON.stringify(['Bio-HEPA Filter', 'Aromatherapy', 'Silent Night Mode'])
  },
  {
    id: 'p5',
    name: 'Aura Beam',
    tagline: 'Light that breathes.',
    description: 'Smart circadian lighting that follows the sun. Casts a warm, candle-like glow in the evenings.',
    longDescription: 'Artificial light disrupts our natural rhythms. Aura Beam syncs with your local sunrise and sunset, providing cool, energizing light during the day and transitioning to a warm, amber glow free of blue light in the evening. Controls are touchless; a simple wave of the hand adjusts brightness.',
    price: 249,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=1000',
    features: JSON.stringify(['Circadian Rhythm Sync', 'Warm Dimming', 'Touchless Control'])
  },
  {
    id: 'p6',
    name: 'Aura Scribe',
    tagline: 'Thought in motion.',
    description: 'A digital stylus with the friction of graphite. Charges wirelessly when magnetically attached to Aura Canvas.',
    longDescription: 'The connection between hand and brain is sacred. Aura Scribe features a custom elastomer tip that replicates the microscopic friction of graphite on paper. Weighted perfectly for balance, it disappears in your hand, leaving only your thoughts.',
    price: 129,
    category: 'Mobile',
    imageUrl: 'https://images.pexels.com/photos/2647376/pexels-photo-2647376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    features: JSON.stringify(['Zero Latency', 'Textured Tip', 'Wireless Charging'])
  }
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, tagline, description, longDescription, price, category, imageUrl, features)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

products.forEach(p => {
  insertProduct.run(p.id, p.name, p.tagline, p.description, p.longDescription, p.price, p.category, p.imageUrl, p.features);
});

// Insert test user if not exists
const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)');
insertUser.run('test', '1234');


export default db;
