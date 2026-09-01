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

const Booking = require('../models/Booking');
const Vacation = require('../models/Vacation');

const getAdminOverview = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const [y, m, d] = todayStr.split('-').map(Number);
    const startMs = Date.UTC(y, m - 1, d, 0, 0, 0) - (5.5 * 3600 * 1000);
    const endMs = startMs + (24 * 3600 * 1000) - 1;
    const start = new Date(startMs);
    const end = new Date(endMs);

    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      activeManagers,
      activeVacations,
      todaySkipsObj,
      todayVisitorObj,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'student', isActive: false }),
      User.countDocuments({ role: 'mess_manager', isActive: true }),
      Vacation.countDocuments({ status: 'active' }),
      Booking.countDocuments({ date: { $gte: start, $lte: end }, status: 'skipped', isVisitorPass: { $ne: true } }),
      Booking.aggregate([
        { $match: { date: { $gte: start, $lte: end }, isVisitorPass: true, paymentStatus: 'paid', status: 'booked' } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$paymentAmount' } } },
      ]),
    ]);

    const todayVisitorPasses = todayVisitorObj[0]?.count || 0;
    const todayVisitorRevenue = todayVisitorObj[0]?.revenue || 0;

    res.json({
      totalStudents,
      activeStudents,
      inactiveStudents,
      activeManagers,
      activeVacations,
      todaySkips: todaySkipsObj || 0,
      todayVisitorPasses,
      todayVisitorRevenue,
    });
  } catch (err) {
    next(err);
  }
};

const getAdminVacations = async (req, res, next) => {
  try {
    const vacations = await Vacation.find()
      .populate('student', 'name email phone hostelBlock roomNumber')
      .sort({ createdAt: -1 });
    res.json(vacations);
  } catch (err) {
    next(err);
  }
};

const getAdminVisitorPayments = async (req, res, next) => {
  try {
    const payments = await Booking.find({
      isVisitorPass: true,
      paymentStatus: 'paid',
      status: 'booked',
    })
      .populate('student', 'name email phone hostelBlock roomNumber')
      .sort({ paidAt: -1, createdAt: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  createStaffUser,
  updateUserStatus,
  deleteUser,
  getAdminOverview,
  getAdminVacations,
  getAdminVisitorPayments,
};
