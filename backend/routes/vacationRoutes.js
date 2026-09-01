const express = require('express');
const { createVacation, getMyVacations, cancelVacation } = require('../controllers/vacationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('student'), createVacation);
router.get('/mine', protect, authorize('student'), getMyVacations);
router.patch('/:id/cancel', protect, authorize('student'), cancelVacation);

module.exports = router;
