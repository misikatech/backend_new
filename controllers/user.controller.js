const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      created_at: true
    }
  });

  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  ApiResponse.success(res, user, 'Profile retrieved successfully');
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatar } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      firstName,
      lastName,
      phone,
      avatar
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      created_at: true
    }
  });

  ApiResponse.success(res, updatedUser, 'Profile updated successfully');
});

// @desc    Get user wishlist
// @route   GET /api/user/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            images: true,
            stock: true,
            isActive: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    ApiResponse.success(res, { items: wishlistItems }, 'Wishlist retrieved successfully');
  } catch (error) {
    console.error('Get wishlist error:', error);
    ApiResponse.error(res, 'Failed to retrieve wishlist', 500);
  }
});

// @desc    Add to wishlist
// @route   POST /api/user/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true }
    });

    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    if (!product.isActive) {
      return ApiResponse.error(res, 'Product is not available', 400);
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId
      }
    });

    if (existingItem) {
      return ApiResponse.error(res, 'Product already in wishlist', 400);
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            images: true
          }
        }
      }
    });

    ApiResponse.success(res, wishlistItem, 'Product added to wishlist successfully');
  } catch (error) {
    console.error('Add to wishlist error:', error);
    ApiResponse.error(res, 'Failed to add product to wishlist', 500);
  }
});

// @desc    Remove from wishlist
// @route   DELETE /api/user/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const deletedItem = await prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productId
      }
    });

    if (deletedItem.count === 0) {
      return ApiResponse.error(res, 'Product not found in wishlist', 404);
    }

    ApiResponse.success(res, { productId }, 'Product removed from wishlist successfully');
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    ApiResponse.error(res, 'Failed to remove product from wishlist', 500);
  }
});

// @desc    Get user orders
// @route   GET /api/user/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        address: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    ApiResponse.success(res, { orders }, 'Orders retrieved successfully');
  } catch (error) {
    console.error('Get orders error:', error);
    ApiResponse.error(res, 'Failed to retrieve orders', 500);
  }
});

module.exports = {
  getProfile,
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getOrders
};
