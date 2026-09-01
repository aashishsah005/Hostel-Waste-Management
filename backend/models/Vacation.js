const mongoose = require('mongoose');

const vacationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    mealTypes: [
      {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
        required: true,
      },
    ],
    totalMealsSkipped: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

vacationSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Vacation', vacationSchema);
