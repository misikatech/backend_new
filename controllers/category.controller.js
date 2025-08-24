const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');
const { createCategorySchema } = require('../validators/product.validator');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { isActive, search } = req.query;
  
  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive'
    };
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  ApiResponse.success(res, categories, 'Categories fetched successfully');
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  console.log('Create category - User:', req.user); // Debug log
  
  const { name, description, image, isActive = true } = req.body;

  // Check if category already exists
  const existingCategory = await prisma.category.findUnique({
    where: { name }
  });

  if (existingCategory) {
    return ApiResponse.error(res, 'Category with this name already exists', 400);
  }

  // Generate slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      image,
      isActive
    }
  });

  ApiResponse.success(res, category, 'Category created successfully', 201);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, image, isActive } = req.body;

  const category = await prisma.category.findUnique({
    where: { id }
  });

  if (!category) {
    return ApiResponse.error(res, 'Category not found', 404);
  }

  const updateData = {};
  if (name) {
    updateData.name = name;
    updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: updateData
  });

  ApiResponse.success(res, updatedCategory, 'Category updated successfully');
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!category) {
    return ApiResponse.error(res, 'Category not found', 404);
  }

  if (category._count.products > 0) {
    return ApiResponse.error(res, 'Cannot delete category with existing products', 400);
  }

  await prisma.category.delete({
    where: { id }
  });

  ApiResponse.success(res, null, 'Category deleted successfully');
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!category) {
    return ApiResponse.error(res, 'Category not found', 404);
  }

  ApiResponse.success(res, category, 'Category fetched successfully');
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryBySlug
};
