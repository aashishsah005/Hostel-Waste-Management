const FoodEntry = require('../models/FoodEntry');
const { predictFromHistory } = require('../utils/predictDemand');

const createFoodEntry = async (req, res, next) => {
  try {
    const {
      date,
      mealType,
      mealsBooked,
      mealsPrepared,
      mealsConsumed,
      foodWastedKg,
      wasteReason,
      notes,
      targetPreparation,
      expectedDiners,
      aiRecommendedPrep,
    } = req.body;

    const payload = {
      date,
      mealType,
      mealsBooked: Number(mealsBooked) || 0,
      mealsPrepared: Number(mealsPrepared) || 0,
      mealsConsumed: Number(mealsConsumed) || 0,
      foodWastedKg: Number(foodWastedKg) || 0,
      wasteReason: wasteReason || 'none',
      notes: notes || '',
      recordedBy: req.user._id,
    };

    if (targetPreparation !== undefined && targetPreparation !== null && targetPreparation !== '') {
      payload.targetPreparation = Math.max(0, Number(targetPreparation));
    }
    if (expectedDiners !== undefined && expectedDiners !== null && expectedDiners !== '') {
      payload.expectedDiners = Math.max(0, Number(expectedDiners));
    }
    if (aiRecommendedPrep !== undefined && aiRecommendedPrep !== null && aiRecommendedPrep !== '') {
      payload.aiRecommendedPrep = Math.max(0, Number(aiRecommendedPrep));
    }

    const entry = await FoodEntry.create(payload);
    res.status(201).json(entry);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A food entry already exists for this date and meal type' });
    }
    next(err);
  }
};

const listFoodEntries = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    if (req.query.mealType) filter.mealType = req.query.mealType;
    const entries = await FoodEntry.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
};

const updateFoodEntry = async (req, res, next) => {
  try {
    const entry = await FoodEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entry) return res.status(404).json({ message: 'Food entry not found' });
    res.json(entry);
  } catch (err) {
    next(err);
  }
};

// Predict demand for a given mealType using the last N entries of the same mealType
const predictDemand = async (req, res, next) => {
  try {
    const { mealType, upcomingBookings } = req.query;
    if (!mealType) return res.status(400).json({ message: 'mealType query param is required' });

    const history = await FoodEntry.find({ mealType }).sort({ date: 1 }).limit(30);
    const prediction = predictFromHistory(history, Number(upcomingBookings) || undefined);
    res.json({ mealType, ...prediction });
  } catch (err) {
    next(err);
  }
};

module.exports = { createFoodEntry, listFoodEntries, updateFoodEntry, predictDemand };
