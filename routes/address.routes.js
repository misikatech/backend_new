const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/address.controller');

// All address routes require authentication
router.use(protect);

// Get all addresses for user
router.get('/', getAddresses);

// Create new address
router.post('/', createAddress);

// Update address
router.put('/:id', updateAddress);

// Delete address
router.delete('/:id', deleteAddress);

// Set default address
router.post('/:id/default', setDefaultAddress);

module.exports = router;
