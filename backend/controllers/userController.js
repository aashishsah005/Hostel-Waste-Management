const User = require('../models/User');

const listUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const createStaffUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!['admin', 'mess_manager'].includes(role)) {
      return res.status(400).json({ message: 'This endpoint can only create admin or mess_manager accounts' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });
    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json(user.toSafeObject());
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, createStaffUser, updateUserStatus, deleteUser };
