const db = require('better-sqlite3')('shop.db');
console.log('--- Time Check ---');
console.log('datetime("now"):', db.prepare("SELECT datetime('now') as t").get().t);
console.log('datetime("now", "localtime"):', db.prepare("SELECT datetime('now', 'localtime') as t").get().t);
console.log('datetime("now", "+9 hours"):', db.prepare("SELECT datetime('now', '+9 hours') as t").get().t);
db.close();
