const express = require('express');
const { getNotifications, markNotificationRead } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('student', 'mess_manager', 'admin'), getNotifications);
router.patch('/:id/read', protect, authorize('student', 'mess_manager', 'admin'), markNotificationRead);

module.exports = router;
