const Vacation = require('../models/Vacation');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { getMealCutoffInfo } = require('../utils/mealCutoff');
const notifyManagers = require('../utils/notifyManagers');

// Helper to iterate date range YYYY-MM-DD
const getDateRangeArray = (startStr, endStr) => {
  const dates = [];
  let curr = new Date(startStr.slice(0, 10));
  const end = new Date(endStr.slice(0, 10));
  while (curr <= end) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

/**
 * POST /api/vacations
 * Creates a vacation pause for multiple days.
 */
const createVacation = async (req, res, next) => {
  try {
    const { startDate, endDate, mealTypes } = req.body;

    if (!startDate || !endDate || !mealTypes || !Array.isArray(mealTypes) || mealTypes.length === 0) {
      return res.status(400).json({ message: 'startDate, endDate, and at least one mealType are required.' });
    }

    const validMealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
    const invalidMeal = mealTypes.find((m) => !validMealTypes.includes(m));
    if (invalidMeal) {
      return res.status(400).json({ message: `Invalid meal type: ${invalidMeal}` });
    }

    const startObj = new Date(startDate.slice(0, 10));
    const endObj = new Date(endDate.slice(0, 10));

    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date format.' });
    }

    if (startObj > endObj) {
      return res.status(400).json({ message: 'startDate cannot be after endDate.' });
    }

    // Check IST current date
    const now = new Date();
    const istNowMs = now.getTime() + (5.5 * 3600 * 1000);
    const istNowStr = new Date(istNowMs).toISOString().slice(0, 10);
    const todayObj = new Date(istNowStr);

    if (startObj < todayObj) {
      return res.status(400).json({ message: 'Vacation startDate cannot be in the past.' });
    }

    // Check 60-day limit
    const diffDays = Math.ceil((endObj - startObj) / (1000 * 3600 * 24)) + 1;
    if (diffDays > 60) {
      return res.status(400).json({ message: 'Vacation duration cannot exceed 60 calendar days.' });
    }

    const dateList = getDateRangeArray(startDate, endDate);
    const validBulkSkips = [];
    const excludedMeals = [];

    // Evaluate cutoff for every date & mealType pair
    for (const dateStr of dateList) {
      for (const mealType of mealTypes) {
        const cutoffInfo = getMealCutoffInfo(dateStr, mealType);
        if (cutoffInfo.isPastCutoff) {
          excludedMeals.push({
            date: dateStr,
            mealType,
            reason: 'Skip cutoff has passed',
          });
        } else {
          validBulkSkips.push({ date: dateStr, mealType });
        }
      }
    }

    if (validBulkSkips.length === 0) {
      return res.status(400).json({
        message: 'No valid future meals could be skipped because all selected meals are past cutoff.',
        excludedMeals,
      });
    }

    // Execute bulk write on Booking collection
    const bulkOps = validBulkSkips.map(({ date, mealType }) => ({
      updateOne: {
        filter: { student: req.user._id, date: new Date(date), mealType },
        update: { $set: { status: 'skipped', skipSource: 'vacation' } },
        upsert: true,
      },
    }));

    await Booking.bulkWrite(bulkOps);

    // Create Vacation document
    const vacation = await Vacation.create({
      student: req.user._id,
      startDate: startObj,
      endDate: endObj,
      mealTypes,
      totalMealsSkipped: validBulkSkips.length,
      status: 'active',
    });

    // Create System Notification for Student
    let notificationMsg = `Your meals are paused from ${startDate.slice(0, 10)} to ${endDate.slice(0, 10)}. ${validBulkSkips.length} meals skipped.`;
    if (excludedMeals.length > 0) {
      notificationMsg += ` (${excludedMeals.length} meal(s) excluded as cutoffs passed).`;
    }

    try {
      await Notification.create({
        user: req.user._id,
        title: '🏠 Vacation Mode Activated',
        message: notificationMsg,
        type: 'system',
        date: startObj,
      });
    } catch (err) {
      if (err.code !== 11000) {
        console.error('Error creating student system notification:', err);
      }
    }

    // Notify Mess Managers asynchronously (1 summary notification)
    let managerMsg = `${req.user.name} paused ${validBulkSkips.length} meals from ${startDate.slice(0, 10)} to ${endDate.slice(0, 10)} (${mealTypes.join(', ')}).`;
    if (excludedMeals.length > 0) {
      managerMsg += ` (${excludedMeals.length} meal(s) excluded as cutoffs passed).`;
    }

    notifyManagers({
      title: '🏠 Vacation Meal Pause',
      message: managerMsg,
      type: 'manager_vacation_alert',
      date: startObj,
      senderStudent: req.user._id,
    });

    res.status(201).json({
      message: `Vacation activated successfully! ${validBulkSkips.length} meals paused.`,
      vacation,
      totalMealsSkipped: validBulkSkips.length,
      excludedMeals,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/vacations/mine
 * Returns user's vacations sorted newest first.
 */
const getMyVacations = async (req, res, next) => {
  try {
    const vacations = await Vacation.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(vacations);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/vacations/:id/cancel
 * Cancels active vacation and resumes future expected meals.
 */
const cancelVacation = async (req, res, next) => {
  try {
    const vacation = await Vacation.findOne({ _id: req.params.id, student: req.user._id });
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation record not found' });
    }

    if (vacation.status === 'cancelled') {
      return res.status(400).json({ message: 'Vacation is already cancelled' });
    }

    const startStr = vacation.startDate.toISOString().slice(0, 10);
    const endStr = vacation.endDate.toISOString().slice(0, 10);
    const dateList = getDateRangeArray(startStr, endStr);

    let restoredCount = 0;

    for (const dateStr of dateList) {
      for (const mealType of vacation.mealTypes) {
        const cutoffInfo = getMealCutoffInfo(dateStr, mealType);
        // Only restore future meals whose cutoff has not passed
        if (!cutoffInfo.isPastCutoff) {
          const result = await Booking.deleteOne({
            student: req.user._id,
            date: new Date(dateStr),
            mealType,
            status: 'skipped',
            skipSource: 'vacation',
          });
          if (result.deletedCount > 0) {
            restoredCount++;
          }
        }
      }
    }

    vacation.status = 'cancelled';
    await vacation.save();

    // Notify Mess Managers asynchronously (1 summary notification)
    notifyManagers({
      title: '↩ Vacation Cancelled',
      message: `${req.user.name} cancelled vacation mode (${startStr} to ${endStr}). ${restoredCount} future meal(s) resumed.`,
      type: 'manager_vacation_alert',
      date: new Date(),
      senderStudent: req.user._id,
    });

    res.json({
      message: `Vacation cancelled successfully. ${restoredCount} future meal(s) resumed to expected status.`,
      vacation,
      restoredCount,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createVacation, getMyVacations, cancelVacation };
