const db = require('./db');

console.log('--- Current Weights ---');
const w = db.prepare('SELECT * FROM model_weights WHERE id = 1').get();
console.log(`Bias: ${w.bias}`);
console.log(`W_View: ${w.w_view}`);
console.log(`W_Click: ${w.w_click}`);
console.log(`W_Buy: ${w.w_buy}`);

console.log('\n--- Probabilities Check ---');
const ml = require('./ml');
function test(v, c, b) {
    const p = ml.predict({ view_count: v, click_count: c, buy_count: b }, w);
    console.log(`V:${v}, C:${c}, B:${b} => Prob: ${p.toFixed(6)}`);
}

test(0, 0, 0);
test(1, 0, 0);
test(0, 5, 0);
test(0, 10, 0);
test(0, 0, 1);

db.close();
