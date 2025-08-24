const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
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
            isActive: true
          }
        }
      }
    });

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + (parseFloat(price) * item.quantity);
    }, 0);

    ApiResponse.success(res, { 
      items: cartItems,
      totalItems,
      totalAmount,
      subtotal: totalAmount,
      tax: totalAmount * 0.18,
      shipping: totalAmount >= 999 ? 0 : 50
    }, 'Cart retrieved successfully');
  } catch (error) {
    console.error('Get cart error:', error);
    ApiResponse.error(res, 'Failed to retrieve cart', 500);
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        stock: true,
        isActive: true
      }
    });

    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    if (!product.isActive) {
      return ApiResponse.error(res, 'Product is not available', 400);
    }

    if (product.stock < quantity) {
      return ApiResponse.error(res, 'Insufficient stock', 400);
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
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
    }

    ApiResponse.success(res, cartItem, 'Item added to cart successfully');
  } catch (error) {
    console.error('Add to cart error:', error);
    ApiResponse.error(res, 'Failed to add item to cart', 500);
  }
});

// @desc    Update cart item
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Verify cart item belongs to user
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId
      }
    });

    if (!existingItem) {
      return ApiResponse.error(res, 'Cart item not found', 404);
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
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

    ApiResponse.success(res, updatedItem, 'Cart item updated successfully');
  } catch (error) {
    console.error('Update cart item error:', error);
    ApiResponse.error(res, 'Failed to update cart item', 500);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    // Verify cart item belongs to user
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId
      }
    });

    if (!existingItem) {
      return ApiResponse.error(res, 'Cart item not found', 404);
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    ApiResponse.success(res, { itemId }, 'Item removed from cart successfully');
  } catch (error) {
    console.error('Remove from cart error:', error);
    ApiResponse.error(res, 'Failed to remove item from cart', 500);
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    ApiResponse.success(res, {}, 'Cart cleared successfully');
  } catch (error) {
    console.error('Clear cart error:', error);
    ApiResponse.error(res, 'Failed to clear cart', 500);
  }
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
