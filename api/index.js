const express = require('express');
const cors = require('cors');
require('dotenv').config();

let routesLoaded = false;
let authRoutes, userRoutes, userApiRoutes, cartRoutes, categoryRoutes, productRoutes;
let contactRoutes, adminRoutes, adminAuthRoutes, orderRoutes, addressRoutes, paymentRoutes;
let notFound, errorHandler;

// Try to load routes and middleware, but don't fail if they can't be loaded
try {
  authRoutes = require('../routes/auth.routes');
  userRoutes = require('../routes/userRoutes');
  userApiRoutes = require('../routes/user.routes');
  cartRoutes = require('../routes/cart.routes');
  categoryRoutes = require('../routes/category.routes');
  productRoutes = require('../routes/product.routes');
  contactRoutes = require('../routes/contact.routes');
  adminRoutes = require('../routes/admin.routes');
  adminAuthRoutes = require('../routes/adminAuth.routes');
  orderRoutes = require('../routes/order.routes');
  addressRoutes = require('../routes/address.routes');
  paymentRoutes = require('../routes/payment.routes');
  const errorHandlerModule = require('../middlewares/errorHandler');
  notFound = errorHandlerModule.notFound;
  errorHandler = errorHandlerModule.errorHandler;
  routesLoaded = true;
} catch (error) {
  console.error('Error loading routes:', error.message);
  routesLoaded = false;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Basic CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting - commented out for now
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom logging middleware for cleaner output
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const method = req.method;
      const url = req.originalUrl;

      // Only log API requests, skip static files and health checks
      if (url.startsWith('/api') && url !== '/api/health') {
        const statusColor = status >= 400 ? '🔴' : status >= 300 ? '🟡' : '🟢';
        const methodColor = method === 'GET' ? '📖' : method === 'POST' ? '📝' : method === 'PUT' ? '✏️' : method === 'DELETE' ? '🗑️' : '📋';

        console.log(`${statusColor} ${methodColor} ${method} ${url} - ${status} (${duration}ms)`);
      }
    });

    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Placeholder image endpoints
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const color = req.query.color || 'cccccc';
  const textColor = req.query.text || '666666';
  const text = req.query.t || `${width}x${height}`;
  
  // Redirect to a placeholder service
  res.redirect(`https://via.placeholder.com/${width}x${height}/${color}/${textColor}?text=${encodeURIComponent(text)}`);
});

// API routes - only load if routes were successfully imported
if (routesLoaded) {
  app.use('/api/auth', authRoutes);
  app.use('/api/admin-auth', adminAuthRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/users', userRoutes); // This is for the OTP-based registration
  app.use('/api/user', userApiRoutes); // This is for user profile/wishlist
  app.use('/api/cart', cartRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/addresses', addressRoutes);
  app.use('/api/payments', paymentRoutes);
} else {
  // Fallback routes when main routes can't be loaded
  app.use('/api/*', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'API routes are temporarily unavailable',
      error: 'Routes could not be loaded'
    });
  });
}

// Add logging middleware to debug requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Misika API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    routesLoaded: routesLoaded,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      users: '/api/users',
      contact: '/api/contact',
      stats: '/api/stats',
    },
  });
});

// Error handling middleware
if (routesLoaded && notFound && errorHandler) {
  app.use(notFound);
  app.use(errorHandler);
} else {
  // Basic error handling
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  });
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.clear(); // Clear terminal for clean output
    console.log('\n🚀 Misika Backend Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🎯 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Server ready - Watching for changes...\n');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    server.close(() => {
      console.log('✅ Server closed successfully\n');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    server.close(() => {
      console.log('✅ Server closed successfully\n');
      process.exit(0);
    });
  });
}

module.exports = app;
