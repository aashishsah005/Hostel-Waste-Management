const mongoose = require('mongoose');

const foodEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], required: true },
    mealsBooked: { type: Number, required: true, default: 0 },
    mealsPrepared: { type: Number, required: true, default: 0 },
    mealsConsumed: { type: Number, required: true, default: 0 },
    wastedPlates: { type: Number, required: true, default: 0 },
    foodWastedKg: { type: Number, default: 0 },
    wasteReason: {
      type: String,
      enum: ['none', 'exam_period', 'holiday', 'unpopular_menu', 'weather', 'over_preparation', 'other'],
      default: 'none',
    },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
    targetPreparation: { type: Number, min: 0 },
    expectedDiners: { type: Number, min: 0 },
    aiRecommendedPrep: { type: Number, min: 0 },
  },
  { timestamps: true }
);

foodEntrySchema.index({ date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('FoodEntry', foodEntrySchema);
