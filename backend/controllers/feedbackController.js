const Feedback = require('../models/Feedback');

const createFeedback = async (req, res, next) => {
  try {
    const { mealType, tasteRating, cleanlinessRating, serviceRating, comment } = req.body;
    
    if (!mealType) {
      return res.status(400).json({ message: 'Meal type is required' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      mealType,
      tasteRating: Number(tasteRating) || 5,
      cleanlinessRating: Number(cleanlinessRating) || 5,
      serviceRating: Number(serviceRating) || 5,
      comment: (comment || '').trim(),
    });

    const populated = await Feedback.findById(feedback._id).populate('user', 'name role hostelBlock roomNumber');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate('user', 'name role hostelBlock roomNumber')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

const listFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'name email role hostelBlock roomNumber phone')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};

module.exports = { createFeedback, getMyFeedback, listFeedback };
