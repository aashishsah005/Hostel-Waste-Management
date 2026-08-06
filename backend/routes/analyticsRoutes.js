const express = require('express');
const { getWasteSummary, getFeedbackSummary, getPublicStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/public', getPublicStats);
router.get('/waste', protect, authorize('admin', 'mess_manager'), getWasteSummary);
router.get('/feedback', protect, authorize('admin', 'mess_manager'), getFeedbackSummary);

module.exports = router;

