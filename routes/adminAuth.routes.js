const express = require('express');
const { protect, admin } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile
} = require('../controllers/adminAuth.controller');
const {
  adminRegisterSchema,
  adminLoginSchema,
  adminUpdateProfileSchema
} = require('../validators/adminAuth.validator');

const router = express.Router();

// Public routes
router.post('/register', validate(adminRegisterSchema), registerAdmin);
router.post('/login', validate(adminLoginSchema), loginAdmin);

// Protected admin routes
router.get('/profile', protect, admin, getAdminProfile);
router.put('/profile', protect, admin, validate(adminUpdateProfileSchema), updateAdminProfile);

module.exports = router;