const express = require('express');
const { getDashboardStats, getProductStats } = require('../controllers/stats.controller');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// All stats routes require admin authentication
router.use(protect, admin);

// @route   GET /api/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', getDashboardStats);

// @route   GET /api/stats/products
// @desc    Get product statistics
// @access  Private/Admin
router.get('/products', getProductStats);

module.exports = router;
