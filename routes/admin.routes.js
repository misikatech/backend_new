const express = require('express');
const { 
  getDashboardStats,
  getUsers,
  getOrders,
  getVendors,
  getInventory,
  updateOrderStatus,
  toggleUserStatus
} = require('../controllers/admin.controller');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/status', toggleUserStatus);

// Order Management
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Vendor Management
router.get('/vendors', getVendors);

// Inventory Management
router.get('/inventory', getInventory);

module.exports = router;
