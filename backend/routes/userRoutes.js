const express = require('express');
const {
  listUsers,
  createStaffUser,
  updateUserStatus,
  deleteUser,
  getAdminOverview,
  getAdminVacations,
  getAdminVisitorPayments,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/', listUsers);
router.get('/admin-overview', getAdminOverview);
router.get('/admin-vacations', getAdminVacations);
router.get('/admin-visitor-payments', getAdminVisitorPayments);
router.post('/staff', createStaffUser);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
