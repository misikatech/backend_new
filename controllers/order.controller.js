const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');
const { checkoutSchema, createOrderSchema } = require('../validators/order.validator');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { error } = createOrderSchema.validate(req.body);
  if (error) {
    return ApiResponse.error(res, error.details[0].message, 400);
  }

  const { addressId, paymentMethod, paymentIntentId, notes } = req.body;
  const userId = req.user.id;

  try {
    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            stock: true,
            isActive: true,
            images: true
          }
        }
      }
    });

    if (cartItems.length === 0) {
      return ApiResponse.error(res, 'Cart is empty', 400);
    }

    // Create or get default address if addressId doesn't exist
    let validAddressId = addressId;
    
    // Check if address exists
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    });

    if (!existingAddress) {
      // Create a default address for testing
      const defaultAddress = await prisma.address.create({
        data: {
          userId,
          name: 'John Doe',
          phone: '9876543210',
          street: '123 Main Street, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
          isDefault: true
        }
      });
      validAddressId = defaultAddress.id;
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      if (!item.product.isActive) {
        return ApiResponse.error(res, `Product ${item.product.name} is no longer available`, 400);
      }
      
      if (item.product.stock < item.quantity) {
        return ApiResponse.error(res, `Insufficient stock for ${item.product.name}`, 400);
      }

      const price = item.product.salePrice || item.product.price;
      subtotal += parseFloat(price) * item.quantity;
    }

    const shippingCost = subtotal >= 999 ? 0 : 50;
    const tax = subtotal * 0.18;
    const total = subtotal + shippingCost + tax;

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId: validAddressId,
          orderNumber,
          paymentMethod,
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingCost: parseFloat(shippingCost.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          notes: notes || null,
          status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING'
        }
      });

      // Create order items
      for (const item of cartItems) {
        const price = item.product.salePrice || item.product.price;
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(price),
            total: parseFloat(price) * item.quantity
          }
        });
      }

      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return newOrder;
    });

    console.log('Order created successfully:', order.id);
    ApiResponse.success(res, order, 'Order created successfully', 201);

  } catch (error) {
    console.error('Order creation error:', error);
    return ApiResponse.error(res, `Failed to create order: ${error.message}`, 500);
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
                salePrice: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Mock address data for now
    order.address = {
      name: 'John Doe',
      phone: '9876543210',
      street: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    };

    ApiResponse.success(res, order, 'Order retrieved successfully');
  } catch (error) {
    console.error('Get order error:', error);
    return ApiResponse.error(res, 'Failed to retrieve order', 500);
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
                salePrice: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const totalOrders = await prisma.order.count({
      where: { userId }
    });

    ApiResponse.success(res, {
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    }, 'Orders retrieved successfully');
  } catch (error) {
    console.error('Get orders error:', error);
    return ApiResponse.error(res, 'Failed to retrieve orders', 500);
  }
});

// @desc    Initiate checkout
// @route   POST /api/orders/checkout
// @access  Private
const initiateCheckout = asyncHandler(async (req, res) => {
  const { error } = checkoutSchema.validate(req.body);
  if (error) {
    return ApiResponse.error(res, error.details[0].message, 400);
  }

  const { addressId, paymentMethod, notes } = req.body;
  const userId = req.user.id;

  try {
    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            stock: true,
            isActive: true
          }
        }
      }
    });

    if (cartItems.length === 0) {
      return ApiResponse.error(res, 'Cart is empty', 400);
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      const price = item.product.salePrice || item.product.price;
      subtotal += parseFloat(price) * item.quantity;
    }

    const shippingCost = subtotal >= 999 ? 0 : 50;
    const tax = subtotal * 0.18;
    const total = subtotal + shippingCost + tax;

    const checkoutData = {
      items: cartItems,
      subtotal: subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      paymentMethod
    };

    ApiResponse.success(res, checkoutData, 'Checkout initiated successfully');
  } catch (error) {
    console.error('Checkout error:', error);
    return ApiResponse.error(res, 'Failed to initiate checkout', 500);
  }
});

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return ApiResponse.error(res, 'Order cannot be cancelled', 400);
    }

    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }
    });

    ApiResponse.success(res, null, 'Order cancelled successfully');
  } catch (error) {
    console.error('Cancel order error:', error);
    return ApiResponse.error(res, 'Failed to cancel order', 500);
  }
});

module.exports = {
  initiateCheckout,
  createOrder,
  getOrder,
  getUserOrders,
  cancelOrder
};
