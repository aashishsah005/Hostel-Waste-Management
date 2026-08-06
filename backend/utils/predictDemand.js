/**
 * Lightweight demand-prediction utility.
 *
 * The project's original concept called for a Python / Scikit-learn service.
 * Since this build targets the MERN stack, prediction is implemented here in
 * JavaScript using a weighted moving average over recent historical entries
 * for the same meal type, with a simple adjustment for booking trend.
 *
 * This keeps the whole stack in Node/Express while still giving the mess
 * manager a genuinely useful, data-driven number. If you want true ML
 * (e.g. Random Forest / Linear Regression as described in your proposal),
 * this function is the seam where a Python microservice (FastAPI + scikit-learn)
 * could be called via HTTP instead — the rest of the app would not need to change.
 */

function predictFromHistory(history, upcomingBookings) {
  if (!history || history.length === 0) {
    return {
      predictedConsumption: upcomingBookings || 0,
      predictedWasteKg: 0,
      confidence: 'low',
      method: 'no-history-fallback',
    };
  }

  const recent = history.slice(-7); // last 7 matching entries
  const weights = recent.map((_, i) => i + 1); // more recent = higher weight
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const weightedConsumption = recent.reduce(
    (sum, entry, i) => sum + entry.mealsConsumed * weights[i],
    0
  ) / weightSum;

  const avgWastePerMeal = recent.reduce((sum, entry) => {
    const wastePerConsumed = entry.mealsPrepared > 0 ? entry.foodWastedKg / entry.mealsPrepared : 0;
    return sum + wastePerConsumed;
  }, 0) / recent.length;

  // Blend historical average with current booking signal (60/40)
  const bookingSignal = upcomingBookings || weightedConsumption;
  const predictedConsumption = Math.round(weightedConsumption * 0.6 + bookingSignal * 0.4);
  const predictedWasteKg = Math.round(avgWastePerMeal * predictedConsumption * 100) / 100;

  return {
    predictedConsumption,
    predictedWasteKg,
    recommendedPreparation: Math.round(predictedConsumption * 1.05), // small 5% buffer
    confidence: recent.length >= 5 ? 'high' : recent.length >= 3 ? 'medium' : 'low',
    method: 'weighted-moving-average',
    sampleSize: recent.length,
  };
}

module.exports = { predictFromHistory };
