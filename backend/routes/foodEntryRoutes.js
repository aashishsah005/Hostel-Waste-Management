const express = require('express');
const { createFoodEntry, listFoodEntries, updateFoodEntry, predictDemand } = require('../controllers/foodEntryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin', 'mess_manager'));
router.post('/', createFoodEntry);
router.get('/', listFoodEntries);
router.patch('/:id', updateFoodEntry);
router.get('/predict', predictDemand);

module.exports = router;
