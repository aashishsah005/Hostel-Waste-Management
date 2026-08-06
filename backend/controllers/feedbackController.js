const Feedback = require('../models/Feedback');

const createFeedback = async (req, res, next) => {
  try {
    const { mealType, tasteRating, cleanlinessRating, serviceRating, comment } = req.body;
    const feedback = await Feedback.create({
      user: req.user._id,
      mealType,
      tasteRating,
      cleanlinessRating,
      serviceRating,
      comment,
    });
    res.status(201).json(feedback);
  } catch (err) {
    next(err);
  }
};

const listFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find().populate('user', 'name role').sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

module.exports = { createFeedback, listFeedback };
