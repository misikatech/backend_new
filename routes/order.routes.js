const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  initiateCheckout,
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder
} = require('../controllers/order.controller');

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.post('/checkout', initiateCheckout);
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
