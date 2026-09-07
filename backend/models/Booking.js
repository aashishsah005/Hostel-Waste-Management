const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'], required: true },
    status: { type: String, enum: ['booked', 'cancelled', 'consumed', 'no_show', 'skipped'], default: 'booked' },
    skipSource: { type: String, enum: ['manual', 'vacation'], default: 'manual' },
    tokenCode: { type: String },
    tokenCodes: [{ type: String }],
    quantity: { type: Number, default: 1 },
    visitorName: { type: String },
    phone: { type: String },
    purpose: { type: String },
    isVisitorPass: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'failed', 'refunded'], default: 'paid' },
    paymentAmount: { type: Number },
    paymentMethod: { type: String, default: 'dummy' },
    transactionId: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index(
  { student: 1, date: 1, mealType: 1 },
  { unique: true, partialFilterExpression: { isVisitorPass: { $ne: true } } }
);
bookingSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Booking', bookingSchema);
