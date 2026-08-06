const MenuItem = require('../models/MenuItem');

const getWeeklyMenu = async (req, res, next) => {
  try {
    const menu = await MenuItem.find({ isActive: true }).sort({ dayOfWeek: 1, mealType: 1 });
    res.json(menu);
  } catch (err) {
    next(err);
  }
};

const upsertMenuItem = async (req, res, next) => {
  try {
    const { dayOfWeek, mealType, items, price } = req.body;
    const menuItem = await MenuItem.findOneAndUpdate(
      { dayOfWeek, mealType },
      { items, price, isActive: true },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(menuItem);
  } catch (err) {
    next(err);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWeeklyMenu, upsertMenuItem, deleteMenuItem };
