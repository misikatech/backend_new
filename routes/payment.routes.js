const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  createStripePaymentIntent,
  verifyPayment
} = require('../controllers/payment.controller');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

router.post('/stripe/create-intent', createStripePaymentIntent);
router.post('/verify', verifyPayment);

module.exports = router;
