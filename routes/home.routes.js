const express = require('express');

const router = express.Router();

router.get('/banners', (req, res) => {
  res.json({ success: true, message: 'Home banners endpoint - to be implemented' });
});

router.get('/featured', (req, res) => {
  res.json({ success: true, message: 'Featured products endpoint - to be implemented' });
});

module.exports = router;
