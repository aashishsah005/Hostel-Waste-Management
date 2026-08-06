const Booking = require('../models/Booking');

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

// For mess manager: count of bookings for a given date, grouped by meal type
const getBookingCounts = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param is required (YYYY-MM-DD)' });
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const counts = await Booking.aggregate([
      { $match: { date: { $gte: start, $lte: end }, status: 'booked' } },
      { $group: { _id: '$mealType', count: { $sum: 1 } } },
    ]);
    res.json(counts);
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking, getBookingCounts };
