const express = require('express');
const { getWasteSummary, getFeedbackSummary, getPublicStats, getKitchenPerformance } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/public', getPublicStats);
router.get('/waste', protect, authorize('admin', 'mess_manager'), getWasteSummary);
router.get('/feedback', protect, authorize('admin', 'mess_manager'), getFeedbackSummary);
router.get('/performance', protect, authorize('admin', 'mess_manager'), getKitchenPerformance);

module.exports = router;

