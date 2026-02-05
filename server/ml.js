const db = require('./db');

/**
 * Sigmoid function for Logistic Regression
 */
function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
}

/**
 * Simple Logistic Regression Training using Gradient Descent
 */
async function trainModel() {
    console.log('Starting ML Training...');

    try {
        // 1. Fetch data for training
        // We aggregate actions per user and product
        // For simplicity, we'll use all actions and treat 'buy' as the target label (1), 
        // and interactions without buy as 0 (though in a real shop, almost everything is 0).
        // Let's refine the training set: any user-product pair that has at least one action.
        const trainingData = db.prepare(`
      SELECT 
        userId, 
        productId,
        SUM(CASE WHEN actionType = 'view' THEN 1 ELSE 0 END) as view_count,
        SUM(CASE WHEN actionType = 'click' THEN 1 ELSE 0 END) as click_count,
        SUM(CASE WHEN actionType = 'buy' THEN 1 ELSE 0 END) as buy_count,
        CASE 
          WHEN SUM(CASE WHEN actionType = 'buy' THEN 1 ELSE 0 END) > 0 THEN 1 
          WHEN SUM(CASE WHEN actionType = 'click' THEN 1 ELSE 0 END) >= 3 THEN 1
          WHEN SUM(CASE WHEN actionType = 'view' THEN 1 ELSE 0 END) >= 5 THEN 1
          ELSE 0 
        END as label
      FROM actions
      GROUP BY userId, productId
    `).all();

        if (trainingData.length === 0) {
            db.prepare('INSERT INTO training_logs (status, message) VALUES (?, ?)').run('SKIPPED', 'No training data available.');
            return { success: false, message: 'No data' };
        }

        // 2. Initialize weights from DB
        let model = db.prepare('SELECT * FROM model_weights WHERE id = 1').get();
        let { bias, w_view, w_click, w_buy } = model;

        const learningRate = 0.01;
        const epochs = 100;

        // 3. SGD Training
        for (let i = 0; i < epochs; i++) {
            trainingData.forEach(row => {
                const view_count = Number(row.view_count) || 0;
                const click_count = Number(row.click_count) || 0;
                const buy_count = Number(row.buy_count) || 0;
                const label = Number(row.label) || 0;

                // Prediction
                const z = bias + w_view * view_count + w_click * click_count + w_buy * buy_count;
                const prediction = sigmoid(z);

                // Gradient
                const error = label - prediction;

                // Update
                bias += learningRate * error;
                w_view = Math.max(0.1, w_view + learningRate * error * view_count);
                w_click = Math.max(0.5, w_click + learningRate * error * click_count); // High floor for clicks
                w_buy = Math.max(1.0, w_buy + learningRate * error * buy_count);
            });
        }

        // 4. Calculate final accuracy
        let correctPredictions = 0;
        trainingData.forEach(row => {
            const z = bias + w_view * row.view_count + w_click * row.click_count + w_buy * row.buy_count;
            const prediction = sigmoid(z) >= 0.5 ? 1 : 0;
            if (prediction === (Number(row.label) || 0)) {
                correctPredictions++;
            }
        });
        const accuracy = (correctPredictions / trainingData.length) * 100;

        // 5. Save result
        const now = new Date().toLocaleString('sv', { timeZone: 'Asia/Seoul' });
        db.prepare(`
      UPDATE model_weights 
      SET bias = ?, w_view = ?, w_click = ?, w_buy = ?, accuracy = ?, updated_at = ?
      WHERE id = 1
    `).run(bias, w_view, w_click, w_buy, accuracy, now);

        db.prepare("INSERT INTO training_logs (status, message, timestamp) VALUES (?, ?, ?)").run('SUCCESS', `Learned. Accuracy: ${accuracy.toFixed(1)}%, weights: v=${w_view.toFixed(2)}, c=${w_click.toFixed(2)}`, now);

        return { success: true, accuracy, weights: { bias, w_view, w_click, w_buy } };
    } catch (error) {
        console.error('Training Error:', error);
        db.prepare("INSERT INTO training_logs (status, message, timestamp) VALUES (?, ?, ?)").run('ERROR', error.message, new Date().toLocaleString('sv', { timeZone: 'Asia/Seoul' }));
        return { success: false, error: error.message };
    }
}

/**
 * Predict "Honey Item" percentage for a user and product
 */
function predict(userActions, weights) {
    const bias = Number(weights.bias) || 0;
    const w_view = Number(weights.w_view) || 0;
    const w_click = Number(weights.w_click) || 0;
    const w_buy = Number(weights.w_buy) || 0;

    const vc = Number(userActions.view_count) || 0;
    const cc = Number(userActions.click_count) || 0;
    const bc = Number(userActions.buy_count) || 0;

    const z = bias + w_view * vc + w_click * cc + w_buy * bc;
    return sigmoid(z);
}

module.exports = { trainModel, predict };
