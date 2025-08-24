const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/jwt');

const prisma = new PrismaClient();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

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
    if (existingUser.email === email) {
      return ApiResponse.error(res, 'User already exists with this email', 400);
    }
    if (existingUser.username === username) {
      return ApiResponse.error(res, 'Username is already taken', 400);
    }
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create the new user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword
    },
    select: {
      id: true,
      username: true,
      email: true,
      created_at: true
    }
  });

  // Generate tokens
  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  ApiResponse.success(
    res,
    { user, accessToken, refreshToken },
    'User registered successfully',
    201
  );
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ 
    where: { email },
    select: {
      id: true,
      username: true,
      email: true,
      password: true,
      role: true,
      created_at: true
    }
  });

  if (!user) {
    return ApiResponse.error(res, 'Invalid email or password', 401);
  }

  // Prevent admin users from logging in through regular login
  if (user.role === 'ADMIN') {
    return ApiResponse.error(res, 'Admin users must use admin login', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return ApiResponse.error(res, 'Invalid email or password', 401);
  }

  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  const { password: _, ...userWithoutPassword } = user;

  ApiResponse.success(
    res,
    { 
      user: userWithoutPassword, 
      token: accessToken,
      accessToken, 
      refreshToken 
    },
    'Login successful'
  );
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return ApiResponse.error(res, 'Refresh token is required', 400);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true
      }
    });

    if (!user) {
      return ApiResponse.error(res, 'Invalid refresh token', 401);
    }

    const newAccessToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    ApiResponse.success(
      res,
      { user, accessToken: newAccessToken, refreshToken: newRefreshToken },
      'Token refreshed successfully'
    );
  } catch (error) {
    return ApiResponse.error(res, 'Invalid refresh token', 401);
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  ApiResponse.success(res, null, 'Logged out successfully');
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return ApiResponse.error(res, 'No user found with this email address', 404);
  }

  // Generate reset token (in production, implement proper token generation and email sending)
  const resetToken = generateToken(user.id, '1h'); // 1 hour expiry

  // In production, save this token to database and send email
  // For now, just return success message
  ApiResponse.success(
    res, 
    { resetToken }, // Remove this in production
    'Password reset instructions sent to your email'
  );
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return ApiResponse.error(res, 'Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    ApiResponse.success(res, null, 'Password reset successful');
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired reset token', 400);
  }
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
};
