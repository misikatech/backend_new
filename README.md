# Misika Backend API

A comprehensive e-commerce backend API built with Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations for products and categories
- **Shopping Cart**: Add, update, remove items from cart
- **Order Management**: Complete checkout flow with payment integration
- **Payment Integration**: Stripe, COD, UPI, Net Banking support
- **Address Management**: Multiple shipping addresses per user
- **Email Service**: Automated emails using Nodemailer + Ethereal
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest integration tests
- **Documentation**: Comprehensive API documentation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT
- **Payment**: Stripe
- **Email**: Nodemailer + Ethereal
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: Joi
- **Testing**: Jest + Supertest

## 📦 Installation

1. Clone the repository
```bash
git clone <repository-url>
cd misika-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start development server
```bash
npm run dev
```

## 🔧 Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/misika_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"
STRIPE_SECRET_KEY="sk_test_..."
EMAIL_HOST="smtp.ethereal.email"
EMAIL_USER="your-ethereal-user"
EMAIL_PASS="your-ethereal-pass"
FRONTEND_URL="http://localhost:5173"
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders/checkout` - Initiate checkout
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders/:id/cancel` - Cancel order

### Addresses
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Payments
- `POST /api/payments/stripe/create-intent` - Create Stripe payment intent
- `POST /api/payments/verify` - Verify payment

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/dashboard` - Get dashboard stats

### Contact & Static
- `POST /api/contact` - Submit contact form
- `GET /api/static/about` - Get about page content
- `GET /api/static/services` - Get services content
- `GET /api/static/privacy` - Get privacy policy
- `GET /api/static/terms` - Get terms of service

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 🚀 Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Environment Setup
- Set up Neon PostgreSQL database
- Configure environment variables in Vercel dashboard
- Set up Stripe webhook endpoints

## 📝 Database Schema

The database includes the following main entities:
- Users (with roles and authentication)
- Products (with categories and inventory)
- Orders (with items and payment tracking)
- Cart Items (session-based shopping cart)
- Addresses (multiple shipping addresses)
- Payments (transaction records)
- Reviews (product reviews and ratings)
- Wishlist (saved items)
- Contact (contact form submissions)

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet security headers
- Input validation with Joi
- SQL injection prevention with Prisma

## 📧 Email Templates

Pre-built email templates for:
- Welcome emails
- Password reset
- Order confirmation
- Order shipped notifications
- Contact form submissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.