import * as notion from './notion.js';

/**
 * Sigmoid function for Logistic Regression
 */
function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
}

/**
 * Simple Logistic Regression Training using Notion Data and JS Aggregation
 */
async function trainModel() {
    console.log('Starting ML Training with Notion Data...');

    try {
        // 1. Fetch data from Notion
        const allActions = await notion.getActions();

        // 2. Aggregate actions per user and product (Manual aggregation for Notion)
        const aggregationMap = {};
        allActions.forEach(action => {
            const key = `${action.userId}_${action.productId}`;
            if (!aggregationMap[key]) {
                aggregationMap[key] = { userId: action.userId, productId: action.productId, view_count: 0, click_count: 0, buy_count: 0 };
            }
            if (action.actionType === 'view') aggregationMap[key].view_count++;
            if (action.actionType === 'click') aggregationMap[key].click_count++;
            if (action.actionType === 'buy') aggregationMap[key].buy_count++;
        });

        const trainingData = Object.values(aggregationMap).map(row => ({
            ...row,
            label: (row.buy_count > 0 || row.click_count >= 3 || row.view_count >= 5) ? 1 : 0
        }));

        if (trainingData.length === 0) {
            await notion.addTrainingLog('SKIPPED', 'No training data available in Notion.');
            return { success: false, message: 'No data' };
        }

        // 3. Initialize weights from Notion
        const weightsList = await notion.getModelWeights();
        let model = weightsList[0] || { bias: 0, w_view: 0.1, w_click: 0.5, w_buy: 1.0 };
        let { bias, w_view, w_click, w_buy } = model;

        const learningRate = 0.01;
        const epochs = 100;

        // 4. SGD Training (Same logic as before)
        for (let i = 0; i < epochs; i++) {
            trainingData.forEach(row => {
                const z = bias + w_view * row.view_count + w_click * row.click_count + w_buy * row.buy_count;
                const prediction = sigmoid(z);
                const error = row.label - prediction;

                bias += learningRate * error;
                w_view = Math.max(0.1, w_view + learningRate * error * row.view_count);
                w_click = Math.max(0.5, w_click + learningRate * error * row.click_count);
                w_buy = Math.max(1.0, w_buy + learningRate * error * row.buy_count);
            });
        }

        // 5. Calculate Accuracy
        let correctPredictions = 0;
        trainingData.forEach(row => {
            const z = bias + w_view * row.view_count + w_click * row.click_count + w_buy * row.buy_count;
            const prediction = sigmoid(z) >= 0.5 ? 1 : 0;
            if (prediction === row.label) correctPredictions++;
        });
        const accuracy = (correctPredictions / trainingData.length) * 100;

        // 6. Save result to Notion
        await notion.updateWeights(bias, w_view, w_click, w_buy, accuracy);
        await notion.addTrainingLog('SUCCESS', `Learned (Notion). Accuracy: ${accuracy.toFixed(1)}%, weights: v=${w_view.toFixed(2)}, c=${w_click.toFixed(2)}`);

        return { success: true, accuracy, weights: { bias, w_view, w_click, w_buy } };
    } catch (error) {
        console.error('Training Error (Notion):', error);
        await notion.addTrainingLog('ERROR', `Notion Training Failed: ${error.message}`);
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

export { trainModel, predict };
