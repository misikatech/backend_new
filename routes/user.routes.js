const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  getProfile,
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getOrders
} = require('../controllers/user.controller');

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Orders
router.get('/orders', getOrders);

module.exports = router;
