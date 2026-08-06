const express = require('express');
const { createBooking, getMyBookings, cancelBooking, getBookingCounts } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('student', 'visitor'), createBooking);
router.get('/mine', protect, authorize('student', 'visitor'), getMyBookings);
router.patch('/:id/cancel', protect, authorize('student', 'visitor'), cancelBooking);
router.get('/counts', protect, authorize('admin', 'mess_manager'), getBookingCounts);

module.exports = router;
