const express = require('express');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
} = require('../controllers/auth.controller');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/logout', protect, logout);

module.exports = router;
