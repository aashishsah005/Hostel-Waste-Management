const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Reusable helper to send background notifications to all active mess managers.
 * Safe & non-blocking: Never throws errors to the caller so student skip/vacation operations always succeed.
 */
const notifyManagers = async ({ title, message, type, mealType, date, senderStudent }) => {
  try {
    const managers = await User.find({ role: 'mess_manager', isActive: true });
    if (!managers || managers.length === 0) return;

    for (const mgr of managers) {
      try {
        await Notification.create({
          user: mgr._id,
          title,
          message,
          type,
          mealType: mealType || undefined,
          date: date || new Date(),
          senderStudent: senderStudent || undefined,
          isRead: false,
        });
      } catch (err) {
        // Silently catch 11000 duplicate key error
        if (err.code !== 11000) {
          console.error('Error creating manager notification:', err);
        }
      }
    }
  } catch (err) {
    console.error('Failed to notify mess managers:', err);
  }
};

module.exports = notifyManagers;
