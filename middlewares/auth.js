const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const pool = require('../config/db');
const ApiResponse = require('../utils/response');

const prisma = new PrismaClient();

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.error(res, 'Not authorized, no token', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    // First try to find user in Prisma User table (for both admin and regular users)
    try {
      const prismaUser = await prisma.user.findUnique({
        where: { id: decoded.id },
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

      if (prismaUser) {
        user = prismaUser;
      }
    } catch (error) {
      console.error('Prisma user lookup error:', error);
    }

    // If not found in Prisma, check in userquery table (PostgreSQL) for legacy users
    if (!user) {
      try {
        const result = await pool.query("SELECT id, name, email, mobile_number, city, created_at FROM userquery WHERE id = $1", [decoded.id]);

        if (result.rows.length > 0) {
          user = {
            ...result.rows[0],
            role: 'USER' // Legacy users are regular users
          };
        }
      } catch (error) {
        console.error('PostgreSQL user lookup error:', error);
      }
    }

    if (!user) {
      return ApiResponse.error(res, 'Not authorized, user not found', 401);
    }

    if (!user.isActive && user.isActive !== undefined) {
      return ApiResponse.error(res, 'Account is deactivated', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return ApiResponse.error(res, 'Not authorized, token failed', 401);
  }
};

// Middleware to check admin role
const admin = (req, res, next) => {
  console.log('Admin middleware - User:', req.user); // Debug log
  
  if (!req.user) {
    return ApiResponse.error(res, 'Not authorized, user not found', 401);
  }

  // Check if user has ADMIN role
  if (req.user.role === 'ADMIN') {
    next();
  } else {
    return ApiResponse.error(res, 'Not authorized as admin', 403);
  }
};

module.exports = { protect, admin };
