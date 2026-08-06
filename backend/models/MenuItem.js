const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], required: true },
    items: [{ type: String, required: true }],
    price: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuItemSchema.index({ dayOfWeek: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
