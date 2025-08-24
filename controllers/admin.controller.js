const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue,
    recentOrders
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'delivered' }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true, email: true } }
      }
    })
  ]);

  const stats = {
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue: totalRevenue._sum.total || 0,
    recentOrders
  };

  ApiResponse.success(res, stats, 'Dashboard stats fetched successfully');
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  
  const where = {};
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (role) {
    where.role = role;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } }
    },
    skip: (page - 1) * limit,
    take: parseInt(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.user.count({ where });

  ApiResponse.success(res, {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Users fetched successfully');
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const where = {};
  if (status) {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { username: true, email: true } },
      orderItems: {
        include: {
          product: { select: { name: true, price: true } }
        }
      }
    },
    skip: (page - 1) * limit,
    take: parseInt(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.order.count({ where });

  ApiResponse.success(res, {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Orders fetched successfully');
});

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { username: true, email: true } }
    }
  });

  ApiResponse.success(res, order, 'Order status updated successfully');
});

// @desc    Toggle user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      username: true,
      email: true,
      status: true
    }
  });

  ApiResponse.success(res, user, 'User status updated successfully');
});

// @desc    Get vendors (placeholder)
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getVendors = asyncHandler(async (req, res) => {
  // Placeholder for vendor management
  const vendors = [];
  ApiResponse.success(res, vendors, 'Vendors fetched successfully');
});

// @desc    Get inventory stats
// @route   GET /api/admin/inventory
// @access  Private/Admin
const getInventory = asyncHandler(async (req, res) => {
  const [
    totalProducts,
    lowStockProducts,
    outOfStockProducts
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lte: 10 } } }),
    prisma.product.count({ where: { stock: 0 } })
  ]);

  const lowStockItems = await prisma.product.findMany({
    where: { stock: { lte: 10 } },
    select: {
      id: true,
      name: true,
      stock: true,
      category: { select: { name: true } }
    },
    take: 10
  });

  const stats = {
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    lowStockItems
  };

  ApiResponse.success(res, stats, 'Inventory stats fetched successfully');
});

module.exports = {
  getDashboardStats,
  getUsers,
  getOrders,
  getVendors,
  getInventory,
  updateOrderStatus,
  toggleUserStatus
};
