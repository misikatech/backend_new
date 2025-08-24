const express = require('express');
const { protect } = require('../middlewares/auth');
const ApiResponse = require('../utils/ApiResponse');

const router = express.Router();

// Test endpoint without auth
router.get('/ping', (req, res) => {
  ApiResponse.success(res, { message: 'pong' }, 'Test endpoint working');
});

// Test endpoint with auth
router.get('/protected', protect, (req, res) => {
  ApiResponse.success(res, { user: req.user }, 'Protected endpoint working');
});

module.exports = router;