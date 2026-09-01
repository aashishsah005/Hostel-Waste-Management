const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'meal_reminder',
        'skip_confirmed',
        'system',
        'manager_skip_alert',
        'manager_vacation_alert',
        'manager_payment_alert',
      ],
      default: 'meal_reminder',
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
    },
    date: { type: Date, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, date: 1, mealType: 1, type: 1, senderStudent: 1 }, { unique: true });

module.exports = mongoose.model('Notification', notificationSchema);
