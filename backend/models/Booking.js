const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], required: true },
    status: { type: String, enum: ['booked', 'cancelled', 'consumed', 'no_show'], default: 'booked' },
    tokenCode: { type: String },
    phone: { type: String },
    purpose: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ student: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);

