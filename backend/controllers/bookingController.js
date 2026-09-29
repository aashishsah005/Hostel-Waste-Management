const crypto = require('crypto');
const Booking = require('../models/Booking');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { getMealCutoffInfo } = require('../utils/mealCutoff');
const notifyManagers = require('../utils/notifyManagers');

const createBooking = async (req, res, next) => {
  try {
    const { date, mealType, tokenCode, phone, purpose } = req.body;
    const booking = await Booking.create({
      student: req.user._id,
      date,
      mealType,
      tokenCode,
      phone,
      purpose,
    });
    res.status(201).json(booking);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already booked this meal for this date' });
    }
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ student: req.user._id }).sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, student: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/bookings/skip
 * Allows an active student to skip a meal prior to the 3-hour cutoff.
 */
const skipMeal = async (req, res, next) => {
  try {
    const { date, mealType } = req.body;
    if (!date || !mealType) {
      return res.status(400).json({ message: 'date and mealType are required' });
    }

    if (!['Breakfast', 'Lunch', 'Snacks', 'Dinner'].includes(mealType)) {
      return res.status(400).json({ message: 'Invalid meal type' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ message: 'Inactive student account cannot skip meals' });
    }

    // Validate 3-hour cutoff
    const cutoffInfo = getMealCutoffInfo(date, mealType);
    if (cutoffInfo.isPastCutoff) {
      return res.status(400).json({
        message: `Meal skip deadline has passed for ${mealType} on ${date}. Cutoff was ${cutoffInfo.formattedCutoff} IST.`,
      });
    }

    // Normalize date for database storage (UTC midnight)
    const targetDate = new Date(date.slice(0, 10));

    // Check for existing booking
    let booking = await Booking.findOne({
      student: req.user._id,
      date: targetDate,
      mealType,
    });

    let isNewSkip = false;

    if (booking) {
      if (booking.status === 'skipped') {
        return res.status(200).json({ message: 'Meal already skipped', booking });
      }
      if (booking.status === 'consumed') {
        return res.status(400).json({ message: 'Consumed meals cannot be skipped.' });
      }
      booking.status = 'skipped';
      await booking.save();
      isNewSkip = true;
    } else {
      // Create new skip record
      booking = await Booking.create({
        student: req.user._id,
        date: targetDate,
        mealType,
        status: 'skipped',
      });
      isNewSkip = true;
    }

    // Notify Mess Managers asynchronously (never blocks response)
    if (isNewSkip) {
      const dateDisplay = targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      notifyManagers({
        title: '🚫 Meal Skipped',
        message: `${req.user.name} skipped ${mealType} on ${dateDisplay} (${cutoffInfo.mealTiming}).`,
        type: 'manager_skip_alert',
        mealType,
        date: targetDate,
        senderStudent: req.user._id,
      });
    }

    res.status(booking ? 200 : 201).json({ message: `${mealType} skipped successfully.`, booking });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ message: 'Meal already skipped' });
    }
    next(err);
  }
};

/**
 * PATCH /api/bookings/unskip
 * Allows a student to undo a meal skip prior to the 3-hour cutoff.
 */
const unskipMeal = async (req, res, next) => {
  try {
    const { date, mealType } = req.body;
    if (!date || !mealType) {
      return res.status(400).json({ message: 'date and mealType are required' });
    }

    // Validate 3-hour cutoff
    const cutoffInfo = getMealCutoffInfo(date, mealType);
    if (cutoffInfo.isPastCutoff) {
      return res.status(400).json({
        message: `Cannot undo skip after deadline (${cutoffInfo.formattedCutoff} IST).`,
      });
    }

    const targetDate = new Date(date.slice(0, 10));

    const booking = await Booking.findOne({
      student: req.user._id,
      date: targetDate,
      mealType,
    });

    if (!booking || booking.status !== 'skipped') {
      return res.status(400).json({ message: 'Meal is not currently skipped' });
    }

    booking.status = 'booked';
    await booking.save();

    // Notify Mess Managers asynchronously
    const dateDisplay = targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    notifyManagers({
      title: '↩ Meal Resumed',
      message: `${req.user.name} resumed ${mealType} on ${dateDisplay} (${cutoffInfo.mealTiming}).`,
      type: 'manager_skip_alert',
      mealType,
      date: targetDate,
      senderStudent: req.user._id,
    });

    res.json({ message: `Skip undone. You are expected for ${mealType}!`, booking });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/bookings/visitor-pay
 * Validates date, meal cutoff, menu pricing, executes dummy payment, creates Booking record with transaction ID & token, and notifies Mess Managers.
 */
const bookVisitorMeal = async (req, res, next) => {
  try {
    const { date, mealType, visitorName, phone, purpose } = req.body;
    const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

    if (!date || !mealType || !visitorName || !phone) {
      return res.status(400).json({ message: 'date, mealType, visitorName, and phone are required' });
    }

    const validMealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({ message: `Invalid mealType: ${mealType}` });
    }

    const targetDate = new Date(date.slice(0, 10));
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format (expected YYYY-MM-DD)' });
    }

    // Validate date is not in the past (IST date check)
    const now = new Date();
    const istNowMs = now.getTime() + (5.5 * 3600 * 1000);
    const istNowStr = new Date(istNowMs).toISOString().slice(0, 10);
    const todayObj = new Date(istNowStr);

    if (targetDate < todayObj) {
      return res.status(400).json({ message: 'Visitor booking date cannot be in the past.' });
    }

    // Validate 3-hour cutoff
    const cutoffInfo = getMealCutoffInfo(date, mealType);
    if (cutoffInfo.isPastCutoff) {
      return res.status(400).json({
        message: `Visitor booking closed for ${mealType} on ${date}. Cutoff was ${cutoffInfo.formattedCutoff} IST.`,
      });
    }

    // Determine Day of Week for selected date
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = DAYS[targetDate.getUTCDay()];

    // Authoritative pricing from active MenuItem
    const menuItem = await MenuItem.findOne({ dayOfWeek, mealType, isActive: true });
    const fallbackPrices = { Breakfast: 40, Lunch: 40, Snacks: 20, Dinner: 40 };
    const unitPrice = menuItem?.price || fallbackPrices[mealType] || 40;
    const paymentAmount = unitPrice * quantity;

    // Generate unique Transaction ID & Token Code
    const yyyymmdd = targetDate.toISOString().slice(0, 10).replace(/-/g, '');
    const randTxnSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const transactionId = req.body.razorpay_payment_id || req.body.transactionId || `pay_rzp_${yyyymmdd}_${randTxnSuffix}`;
    const paymentMethod = req.body.paymentMethod || 'Razorpay';

    const randTokenSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const tokenCode = `VIS-${randTokenSuffix}`;

    // Create Paid Visitor Booking Record with Single Unified Token for the group
    const booking = await Booking.create({
      student: req.user ? req.user._id : null,
      date: targetDate,
      mealType,
      status: 'booked',
      isVisitorPass: true,
      paymentStatus: 'paid',
      paymentAmount,
      quantity,
      visitorName,
      tokenCode,
      paymentMethod,
      transactionId,
      paidAt: new Date(),
      phone,
      purpose: purpose || `${quantity} Visitor Pass(es) for ${visitorName}`,
    });

    // Notify Mess Managers asynchronously
    const dateDisplay = targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    notifyManagers({
      title: '💳 Visitor Meal Payment',
      message: `${visitorName} purchased ${quantity} ${mealType} visitor pass(es) for ₹${paymentAmount} on ${dateDisplay}. Transaction: ${transactionId}.`,
      type: 'manager_payment_alert',
      mealType,
      date: targetDate,
      senderStudent: req.user._id,
    });

    res.status(201).json({
      message: `${quantity} Visitor meal pass(es) booked and paid successfully!`,
      booking: {
        _id: booking._id,
        date: date.slice(0, 10),
        mealType,
        visitorName,
        phone,
        quantity,
        purpose: booking.purpose,
        isVisitorPass: true,
        paymentStatus: 'paid',
        paymentAmount,
        unitPrice,
        paymentMethod: 'dummy',
        transactionId,
        paidAt: booking.paidAt,
        tokenCode,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A booking or transaction record already exists for this meal date.' });
    }
    next(err);
  }
};

// For mess manager: count of bookings & skips for a given date, grouped by meal type
const getBookingCounts = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param is required (YYYY-MM-DD)' });

    // IST date boundaries (UTC+5:30)
    const dateStr = date.slice(0, 10);
    const [year, month, day] = dateStr.split('-').map(Number);
    const startMs = Date.UTC(year, month - 1, day, 0, 0, 0) - (5.5 * 3600 * 1000);
    const endMs = startMs + (24 * 3600 * 1000) - 1;

    const start = new Date(startMs);
    const end = new Date(endMs);

    // Dynamic count of active student users
    const totalActiveStudents = await User.countDocuments({ role: 'student', isActive: true });

    const counts = await Booking.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$mealType',
          // Backward compatibility fields
          booked: { $sum: { $cond: [{ $eq: ['$status', 'booked'] }, 1, 0] } },
          skipped: { $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] } },
          count: { $sum: { $cond: [{ $eq: ['$status', 'booked'] }, 1, 0] } },

          // Authoritative accuracy fields
          studentSkipped: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'skipped'] },
                    { $ne: ['$isVisitorPass', true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          visitorPasses: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isVisitorPass', true] },
                    { $eq: ['$paymentStatus', 'paid'] },
                    { $eq: ['$status', 'booked'] },
                  ],
                },
                { $ifNull: ['$quantity', 1] },
                0,
              ],
            },
          },
          visitorRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isVisitorPass', true] },
                    { $eq: ['$paymentStatus', 'paid'] },
                    { $eq: ['$status', 'booked'] },
                  ],
                },
                { $ifNull: ['$paymentAmount', 0] },
                0,
              ],
            },
          },
        },
      },
    ]);

    // Ensure all 4 daily meals exist in final response
    const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
    const result = MEALS.map((m) => {
      const found = counts.find((c) => c._id === m);
      return {
        _id: m,
        booked: found?.booked || 0,
        skipped: found?.skipped || 0,
        count: found?.count || 0,

        totalActiveStudents,
        studentSkipped: found?.studentSkipped || 0,
        visitorPasses: found?.visitorPasses || 0,
        visitorRevenue: found?.visitorRevenue || 0,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  skipMeal,
  unskipMeal,
  bookVisitorMeal,
  getBookingCounts,
};
