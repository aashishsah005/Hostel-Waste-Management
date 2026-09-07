const express = require('express');
const { predictFood } = require('../controllers/predictController');

const router = express.Router();

router.post('/', predictFood);
router.get('/', predictFood);

module.exports = router;
