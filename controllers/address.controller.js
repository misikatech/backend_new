const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { createAddressSchema, updateAddressSchema } = require('../validators/address.validator');

const prisma = new PrismaClient();

// @desc    Get all addresses for user
// @route   GET /api/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  ApiResponse.success(res, addresses, 'Addresses retrieved successfully');
});

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
const createAddress = asyncHandler(async (req, res) => {
  const { error } = createAddressSchema.validate(req.body);
  if (error) {
    return ApiResponse.error(res, error.details[0].message, 400);
  }

  const addressData = {
    ...req.body,
    userId: req.user.id
  };

  // If this is set as default, unset other default addresses
  if (addressData.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id },
      data: { isDefault: false }
    });
  }

  const address = await prisma.address.create({
    data: addressData
  });

  ApiResponse.success(res, address, 'Address created successfully', 201);
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const { error } = updateAddressSchema.validate(req.body);
  if (error) {
    return ApiResponse.error(res, error.details[0].message, 400);
  }

  const { id } = req.params;

  // Check if address exists and belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: id,
      userId: req.user.id
    }
  });

  if (!existingAddress) {
    return ApiResponse.error(res, 'Address not found', 404);
  }

  // If setting as default, unset other default addresses
  if (req.body.isDefault) {
    await prisma.address.updateMany({
      where: { 
        userId: req.user.id,
        id: { not: id }
      },
      data: { isDefault: false }
    });
  }

  const address = await prisma.address.update({
    where: { id: id },
    data: req.body
  });

  ApiResponse.success(res, address, 'Address updated successfully');
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if address exists and belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: id,
      userId: req.user.id
    }
  });

  if (!existingAddress) {
    return ApiResponse.error(res, 'Address not found', 404);
  }

  await prisma.address.delete({
    where: { id: id }
  });

  ApiResponse.success(res, null, 'Address deleted successfully');
});

// @desc    Set default address
// @route   POST /api/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if address exists and belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: id,
      userId: req.user.id
    }
  });

  if (!existingAddress) {
    return ApiResponse.error(res, 'Address not found', 404);
  }

  // Unset all default addresses for user
  await prisma.address.updateMany({
    where: { userId: req.user.id },
    data: { isDefault: false }
  });

  // Set this address as default
  const address = await prisma.address.update({
    where: { id: id },
    data: { isDefault: true }
  });

  ApiResponse.success(res, address, 'Default address updated successfully');
});

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
