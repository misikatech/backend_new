const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts
} = require('../controllers/product.controller');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', searchProducts);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', getFeaturedProducts);

// @route   GET /api/products/category/:categorySlug
// @desc    Get products by category
// @access  Public
router.get('/category/:categorySlug', getProductsByCategory);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', getProduct);

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', protect, admin, createProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product (soft delete)
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
