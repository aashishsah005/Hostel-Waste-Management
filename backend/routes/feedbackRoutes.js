const express = require('express');
const { createFeedback, listFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('student', 'visitor'), createFeedback);
router.get('/', protect, authorize('admin', 'mess_manager'), listFeedback);

module.exports = router;
