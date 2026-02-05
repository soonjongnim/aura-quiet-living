const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'shop.db'));

const categories = ['Audio', 'Wearable', 'Mobile', 'Home'];
const adjectives = ['고급', '프리미엄', '미니멀', '혁신적인', '스마트', '우아한', '진보된', '현대적인', '클래식', '자연스러운'];
const basicNames = {
    'Audio': ['스피커', '헤드폰', '이어버드', '사운드바'],
    'Wearable': ['워치', '밴드', '트래커', '글래스'],
    'Mobile': ['폰', '태블릿', '액세서리', '충전기'],
    'Home': ['램프', '가구', '오브제', '공기청정기']
};

const products = [];

for (let i = 100; i < 200; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const base = basicNames[category][Math.floor(Math.random() * basicNames[category].length)];
    const name = `Aura ${adj} ${base} ${i}`;
    const price = (Math.floor(Math.random() * 90) + 10) * 10000;

    products.push({
        id: `prod-${i}`,
        name: name,
        tagline: `${adj} 디자인과 최첨단 기술의 만남`,
        description: `${name}은(는) 일상에 풍요로움을 더하는 ${category} 기기입니다. 세심한 디테일과 뛰어난 성능을 경험해 보세요.`,
        longDescription: `${name}은(는) 디자인과 기능의 완벽한 조화를 목표로 제작되었습니다. 제작 과정에서부터 사용자의 편의성을 최우선으로 고려하였으며, 오랜 시간 사용해도 변치 않는 가치를 선사합니다. 특히 이번 모델은 기존 제품보다 더 향상된 성능과 효율성을 자랑합니다.`,
        price: price,
        category: category,
        imageUrl: `https://picsum.photos/seed/${i}/800/800`, // Using Placeholder for now, can be updated
        features: JSON.stringify([
            "고해상도 디자인",
            "장시간 배터리 수명",
            "친환경 소재 사용",
            "사용자 맞춤 설정"
        ])
    });
}

const insert = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, tagline, description, longDescription, price, category, imageUrl, features)
  VALUES (@id, @name, @tagline, @description, @longDescription, @price, @category, @imageUrl, @features)
`);

const insertMany = db.transaction((prods) => {
    for (const prod of prods) insert.run(prod);
});

insertMany(products);
console.log('100 products inserted.');
db.close();
