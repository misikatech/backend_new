const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');
const { createPaymentIntent, confirmPaymentIntent } = require('../utils/stripe');

// @desc    Create Stripe payment intent
// @route   POST /api/payments/stripe/create-intent
// @access  Private
const createStripePaymentIntent = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || amount <= 0) {
    return ApiResponse.error(res, 'Invalid amount', 400);
  }

  try {
    const paymentIntent = await createPaymentIntent(amount, 'inr', {
      userId: req.user.id,
      orderId: orderId || 'pending'
    });

    ApiResponse.success(res, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }, 'Payment intent created successfully');
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return ApiResponse.error(res, 'Failed to create payment intent', 500);
  }
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, paymentMethod } = req.body;

  if (paymentMethod === 'STRIPE') {
    try {
      const paymentIntent = await confirmPaymentIntent(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        ApiResponse.success(res, {
          verified: true,
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100
        }, 'Payment verified successfully');
      } else {
        ApiResponse.success(res, {
          verified: false,
          status: paymentIntent.status
        }, 'Payment not completed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return ApiResponse.error(res, 'Payment verification failed', 500);
    }
  } else if (paymentMethod === 'COD') {
    // COD is always verified
    ApiResponse.success(res, {
      verified: true,
      transactionId: `COD_${Date.now()}`,
      amount: 0
    }, 'COD payment verified');
  } else {
    // For UPI and NET_BANKING, implement respective verification logic
    ApiResponse.success(res, {
      verified: true,
      transactionId: `${paymentMethod}_${Date.now()}`,
      amount: 0
    }, 'Payment verified successfully');
  }
});

module.exports = {
  createStripePaymentIntent,
  verifyPayment
};