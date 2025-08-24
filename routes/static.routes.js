const express = require('express');

const router = express.Router();

router.get('/about', (req, res) => {
  res.json({ success: true, message: 'About page endpoint - to be implemented' });
});

router.get('/services', (req, res) => {
  res.json({ success: true, message: 'Services page endpoint - to be implemented' });
});

router.get('/privacy', (req, res) => {
  res.json({ success: true, message: 'Privacy policy endpoint - to be implemented' });
});

router.get('/terms', (req, res) => {
  res.json({ success: true, message: 'Terms of service endpoint - to be implemented' });
});

module.exports = router;
