const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    minPrice,
    maxPrice,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Map frontend sortBy values to database field names
  const sortFieldMap = {
    'name': 'name',
    'price': 'price',
    'createdAt': 'created_at',
    'created_at': 'created_at',
    'rating': 'created_at', // fallback since rating might not exist
  };
  
  const dbSortField = sortFieldMap[sortBy] || 'created_at';
  
  const where = {
    isActive: true,
    ...(category && {
      category: {
        slug: category
      }
    }),
    ...(minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) })
      }
    },
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: {
        [dbSortField]: sortOrder
      }
    }),
    prisma.product.count({ where })
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));
  const currentPage = parseInt(page);

  ApiResponse.success(res, {
    products,
    pagination: {
      currentPage,
      totalPages,
      totalItems: total,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  }, 'Products retrieved successfully');
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: { name: true, slug: true }
      }
    }
  });

  if (!product) {
    return ApiResponse.error(res, 'Product not found', 404);
  }

  // Add default rating values
  const productWithRating = {
    ...product,
    averageRating: 0,
    reviewCount: 0
  };

  ApiResponse.success(res, productWithRating, 'Product fetched successfully');
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { error } = createProductSchema.validate(req.body);
  if (error) {
    return ApiResponse.error(res, error.details[0].message, 400);
  }

  const { name, description, price, salePrice, sku, stock, images, categoryId, isFeatured } = req.body;

  // Check if SKU already exists
  const existingSku = await prisma.product.findUnique({ where: { sku } });
  if (existingSku) {
    return ApiResponse.error(res, 'Product with this SKU already exists', 400);
  }

  // Generate slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      salePrice,
      sku,
      stock,
      images,
      categoryId,
      isFeatured: isFeatured || false
    },
    include: {
      category: {
        select: { name: true, slug: true }
      }
    }
  });

  ApiResponse.success(res, product, 'Product created successfully', 201);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { error } = updateProductSchema.validate(req.body);
  if (error) {
    return ApiResponse.error(res, error.details[0].message, 400);
  }

  const { id } = req.params;
  const updateData = req.body;

  // Generate new slug if name is being updated
  if (updateData.name) {
    updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: {
        select: { name: true, slug: true }
      }
    }
  });

  ApiResponse.success(res, product, 'Product updated successfully');
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Soft delete by setting isActive to false
  await prisma.product.update({
    where: { id },
    data: { isActive: false }
  });

  ApiResponse.success(res, null, 'Product deleted successfully');
});

// @desc    Get products by category
// @route   GET /api/products/category/:categorySlug
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categorySlug } = req.params;
  const {
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isActive: true,
    category: {
      slug: categorySlug,
      isActive: true
    },
    ...(minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) })
      }
    },
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder }
    }),
    prisma.product.count({ where })
  ]);

  // Add default rating values for products
  const productsWithRating = products.map(product => ({
    ...product,
    averageRating: 0,
    reviewCount: 0
  }));

  const pagination = {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
    hasPrev: parseInt(page) > 1
  };

  ApiResponse.paginated(res, productsWithRating, pagination, `Products in category '${categorySlug}' fetched successfully`);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isActive: true
    },
    include: {
      category: {
        select: { name: true, slug: true }
      }
    },
    take: parseInt(limit),
    orderBy: { createdAt: 'desc' }
  });

  // Add default rating values for products
  const productsWithRating = products.map(product => ({
    ...product,
    averageRating: 0,
    reviewCount: 0
  }));

  ApiResponse.success(res, productsWithRating, 'Featured products fetched successfully');
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { q: query, page = 1, limit = 12 } = req.query;

  if (!query) {
    return ApiResponse.error(res, 'Search query is required', 400);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isActive: true,
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { category: { name: { contains: query, mode: 'insensitive' } } }
    ]
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ]);

  // Add default rating values for products
  const productsWithRating = products.map(product => ({
    ...product,
    averageRating: 0,
    reviewCount: 0
  }));

  const pagination = {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
    hasPrev: parseInt(page) > 1
  };

  ApiResponse.paginated(res, productsWithRating, pagination, `Search results for '${query}'`);
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts
};
