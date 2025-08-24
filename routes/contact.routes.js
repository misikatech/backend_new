const express = require('express');
const { submitContact, getContacts, markAsRead } = require('../controllers/contact.controller');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', submitContact);

// @route   GET /api/contact
// @desc    Get all contact submissions (Admin only)
// @access  Private/Admin
router.get('/', protect, admin, getContacts);

// @route   PUT /api/contact/:id/read
// @desc    Mark contact as read (Admin only)
// @access  Private/Admin
router.put('/:id/read', protect, admin, markAsRead);

module.exports = router;
