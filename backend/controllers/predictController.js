const { getMealPrediction } = require('../utils/mlPredictBridge');

/**
 * POST /api/predict-food & GET /api/predict-food
 * ML Prediction endpoint for Food Requirement & Waste
 */
const predictFood = async (req, res, next) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const mealType = params.mealType || params.meal_type || 'Lunch';
    const dateStr = params.date || new Date().toISOString().slice(0, 10);

    const validMeals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
    if (!validMeals.includes(mealType)) {
      return res.status(400).json({ success: false, message: `Invalid mealType. Must be one of: ${validMeals.join(', ')}` });
    }

    const prediction = await getMealPrediction({
      dateStr,
      mealType,
      overrides: params,
    });

    res.json(prediction);
  } catch (err) {
    next(err);
  }
};

module.exports = { predictFood };
