const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

// @desc    Register admin user
// @route   POST /api/admin-auth/register
// @access  Public (but creates admin user)
const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    return ApiResponse.error(res, 'User with this email or username already exists', 400);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create the admin user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: 'ADMIN',
      isVerified: true,
      isActive: true
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isVerified: true,
      isActive: true,
      created_at: true
    }
  });

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  console.log('Admin registered:', { userId: user.id, role: user.role }); // Debug log

  ApiResponse.success(
    res,
    { user, accessToken, refreshToken },
    'Admin user registered successfully',
    201
  );
});

// @desc    Login admin user
// @route   POST /api/admin-auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isVerified: true,
      isActive: true,
      created_at: true,
      updated_at: true
    }
  });

  if (!user) {
    return ApiResponse.error(res, 'Invalid admin credentials', 401);
  }

  // Only allow ADMIN role users to login through admin endpoint
  if (user.role !== 'ADMIN') {
    return ApiResponse.error(res, 'Access denied. Admin privileges required.', 403);
  }

  if (!user.isActive) {
    return ApiResponse.error(res, 'Admin account is deactivated', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return ApiResponse.error(res, 'Invalid admin credentials', 401);
  }

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  console.log('Admin logged in:', { userId: user.id, role: user.role });

  ApiResponse.success(
    res,
    { 
      user: userWithoutPassword, 
      accessToken, 
      refreshToken 
    },
    'Admin login successful'
  );
});

// @desc    Get admin profile
// @route   GET /api/admin-auth/profile
// @access  Private/Admin
const getAdminProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isVerified: true,
      isActive: true,
      avatar: true,
      created_at: true,
      updated_at: true
    }
  });

  if (!user || user.role !== 'ADMIN') {
    return ApiResponse.error(res, 'Admin not found', 404);
  }

  ApiResponse.success(res, user, 'Admin profile fetched successfully');
});

// @desc    Update admin profile
// @route   PUT /api/admin-auth/profile
// @access  Private/Admin
const updateAdminProfile = asyncHandler(async (req, res) => {
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
      role: true,
      isVerified: true,
      isActive: true,
      avatar: true,
      created_at: true,
      updated_at: true
    }
  });

  ApiResponse.success(res, updatedUser, 'Admin profile updated successfully');
});

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile
};
