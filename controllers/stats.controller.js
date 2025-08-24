const prisma = require('../utils/prisma');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');

// @desc    Get dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get stats from Prisma (categories and products)
    const [categoriesCount, productsCount, activeProductsCount, featuredProductsCount] = await Promise.all([
      prisma.category.count({ where: { isActive: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isFeatured: true, isActive: true } })
    ]);

    // Get stats from PostgreSQL (users)
    const userResult = await pool.query("SELECT COUNT(*) as count FROM userquery");
    const usersCount = parseInt(userResult.rows[0].count);

    // Get recent users
    const recentUsersResult = await pool.query(
      "SELECT name, email, city, created_at FROM userquery ORDER BY created_at DESC LIMIT 5"
    );

    // Get recent products
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    const stats = {
      overview: {
        totalUsers: usersCount,
        totalCategories: categoriesCount,
        totalProducts: productsCount,
        activeProducts: activeProductsCount,
        featuredProducts: featuredProductsCount
      },
      recentUsers: recentUsersResult.rows,
      recentProducts: recentProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category.name,
        createdAt: product.createdAt
      }))
    };

    ApiResponse.success(res, stats, 'Dashboard stats fetched successfully');
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    ApiResponse.error(res, 'Failed to fetch dashboard stats', 500);
  }
});

// @desc    Get product stats
// @route   GET /api/stats/products
// @access  Private/Admin
const getProductStats = asyncHandler(async (req, res) => {
  try {
    // Get products by category
    const productsByCategory = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: 10 }
      },
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { stock: 'asc' },
      take: 10
    });

    const stats = {
      productsByCategory: productsByCategory.map(category => ({
        category: category.name,
        count: category._count.products
      })),
      lowStockProducts: lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        category: product.category.name,
        price: product.price
      }))
    };

    ApiResponse.success(res, stats, 'Product stats fetched successfully');
  } catch (error) {
    console.error('Error fetching product stats:', error);
    ApiResponse.error(res, 'Failed to fetch product stats', 500);
  }
});

module.exports = {
  getDashboardStats,
  getProductStats
};
