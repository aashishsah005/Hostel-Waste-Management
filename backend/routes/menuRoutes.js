const express = require('express');
const { getWeeklyMenu, upsertMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getWeeklyMenu);
router.post('/', protect, authorize('admin', 'mess_manager'), upsertMenuItem);
router.delete('/:id', protect, authorize('admin', 'mess_manager'), deleteMenuItem);

module.exports = router;
