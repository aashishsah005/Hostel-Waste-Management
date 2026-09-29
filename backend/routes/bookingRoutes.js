const express = require('express');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  skipMeal,
  unskipMeal,
  bookVisitorMeal,
  getBookingCounts,
} = require('../controllers/bookingController');
const { protect, optionalProtect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('student', 'visitor'), createBooking);
router.get('/mine', protect, authorize('student', 'visitor'), getMyBookings);
router.patch('/:id/cancel', protect, authorize('student', 'visitor'), cancelBooking);
router.post('/skip', protect, authorize('student'), skipMeal);
router.patch('/unskip', protect, authorize('student'), unskipMeal);
router.post('/visitor-pay', optionalProtect, bookVisitorMeal);
router.get('/counts', protect, authorize('admin', 'mess_manager'), getBookingCounts);

module.exports = router;
