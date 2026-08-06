const FoodEntry = require('../models/FoodEntry');
const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const User = require('../models/User');

const getWasteSummary = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    const entries = await FoodEntry.find(filter).sort({ date: 1 });

    const totalWasteKg = entries.reduce((sum, e) => sum + e.foodWastedKg, 0);
    const totalPrepared = entries.reduce((sum, e) => sum + e.mealsPrepared, 0);
    const totalConsumed = entries.reduce((sum, e) => sum + e.mealsConsumed, 0);
    const avgWastePerEntry = entries.length ? totalWasteKg / entries.length : 0;

    // Estimated cost saved / lost — a rough figure using an assumed per-kg cost.
    const COST_PER_KG = 60; // INR, adjustable assumption, documented for the report
    const estimatedCostLost = Math.round(totalWasteKg * COST_PER_KG);

    // Very simple formula-based carbon estimate (kg CO2e per kg food waste)
    const CO2E_PER_KG = 2.5;
    const estimatedCarbonKg = Math.round(totalWasteKg * CO2E_PER_KG * 100) / 100;

    const trend = entries.map((e) => ({
      date: e.date,
      mealType: e.mealType,
      foodWastedKg: e.foodWastedKg,
      mealsPrepared: e.mealsPrepared,
      mealsConsumed: e.mealsConsumed,
      wasteReason: e.wasteReason,
    }));

    const reasonBreakdown = entries.reduce((acc, e) => {
      acc[e.wasteReason] = (acc[e.wasteReason] || 0) + e.foodWastedKg;
      return acc;
    }, {});

    res.json({
      totalWasteKg: Math.round(totalWasteKg * 100) / 100,
      totalPrepared,
      totalConsumed,
      fulfilmentRate: totalPrepared ? Math.round((totalConsumed / totalPrepared) * 1000) / 10 : 0,
      avgWastePerEntry: Math.round(avgWastePerEntry * 100) / 100,
      estimatedCostLost,
      estimatedCarbonKg,
      reasonBreakdown,
      trend,
    });
  } catch (err) {
    next(err);
  }
};

const getFeedbackSummary = async (req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).limit(200);
    const count = feedback.length;
    const avg = (key) => (count ? Math.round((feedback.reduce((s, f) => s + f[key], 0) / count) * 10) / 10 : 0);

    // Lightweight "AI summary": frequency-based keyword extraction from comments,
    // no external LLM call required so it works fully offline.
    const stopWords = new Set(['the', 'and', 'was', 'were', 'a', 'an', 'is', 'it', 'to', 'of', 'in', 'for', 'this', 'that', 'i', 'we']);
    const freq = {};
    feedback.forEach((f) => {
      (f.comment || '')
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !stopWords.has(w))
        .forEach((w) => {
          freq[w] = (freq[w] || 0) + 1;
        });
    });
    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }));

    res.json({
      totalFeedback: count,
      avgTaste: avg('tasteRating'),
      avgCleanliness: avg('cleanlinessRating'),
      avgService: avg('serviceRating'),
      topKeywords,
      recent: feedback.slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
};

const getPublicStats = async (req, res, next) => {
  try {
    const [entries, totalBookings, totalStudents, feedbackCount] = await Promise.all([
      FoodEntry.find({}),
      Booking.countDocuments({ status: 'booked' }),
      User.countDocuments({ role: 'student' }),
      Feedback.countDocuments({}),
    ]);

    const totalWasteKg = entries.reduce((sum, e) => sum + e.foodWastedKg, 0);
    const totalPrepared = entries.reduce((sum, e) => sum + e.mealsPrepared, 0);
    const totalConsumed = entries.reduce((sum, e) => sum + e.mealsConsumed, 0);
    const savedPercent = totalPrepared ? Math.round((totalConsumed / totalPrepared) * 100) : 0;
    const estimatedCostLost = Math.round(totalWasteKg * 60);
    const estimatedCarbonKg = Math.round(totalWasteKg * 2.5 * 100) / 100;

    res.json({
      savedPercent,
      totalWasteKg: Math.round(totalWasteKg * 100) / 100,
      totalPrepared,
      totalConsumed,
      totalBookings,
      totalStudents,
      feedbackCount,
      estimatedCostLost,
      estimatedCarbonKg,
      costPerKg: 60,
      co2PerKg: 2.5,
    });
  } catch (err) {
    next(err);
  }
};



module.exports = { getWasteSummary, getFeedbackSummary, getPublicStats };

