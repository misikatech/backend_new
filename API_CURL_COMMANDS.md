# Misika Backend API - cURL Commands

## Base URL
```
BASE_URL=http://localhost:3001/api
```

## 🔐 Authentication APIs

### 1. Login User (Generate Token)
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "askanimeshsingh@gmail.com",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "name": "Animesh Singh",
      "mobile_number": "8795087016",
      "email": "askanimeshsingh@gmail.com",
      "city": "Mumbai"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-08-05T15:57:22.926Z"
}
```

### 2. Register User (Alternative Auth System)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@misika.com",
    "password": "admin123456"
  }'
```

### 3. Login (Alternative Auth System)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@misika.com",
    "password": "admin123456"
  }'
```

## 📂 Category APIs

### 1. Get All Categories (Public)
```bash
curl -X GET http://localhost:3001/api/categories \
  -H "Content-Type: application/json"
```

### 2. Create Category (Admin Required)
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQyODE3MzYyLTA2NzgtNDU4ZC05ZWZmLTdlYzIwMDcxOThiZCIsImlhdCI6MTc1NDQxMDczOSwiZXhwIjoxNzU0NDExNjM5fQ.IBNEs0FoFrGpxLljSLj-q9o5sxzmr929Koy5Pa7XE2U" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "image": "https://example.com/electronics.jpg"
  }'
```

### 3. Update Category (Admin Required)
```bash
curl -X PUT http://localhost:3001/api/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Updated Electronics",
    "description": "Updated electronic devices and gadgets",
    "image": "https://example.com/updated-electronics.jpg"
  }'
```

### 4. Delete Category (Admin Required)
```bash
curl -X DELETE http://localhost:3001/api/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🛍️ Product APIs

### 1. Get All Products (Public)
```bash
curl -X GET http://localhost:3001/api/products \
  -H "Content-Type: application/json"
```

### 2. Get Products with Filters (Public)
```bash
curl -X GET "http://localhost:3001/api/products?page=1&limit=10&category=electronics&minPrice=100&maxPrice=1000&search=phone&sortBy=price&sortOrder=asc" \
  -H "Content-Type: application/json"
```

### 3. Get Products by Category (Public)
```bash
curl -X GET http://localhost:3001/api/products/category/electronics \
  -H "Content-Type: application/json"
```

### 4. Get Single Product (Public)
```bash
curl -X GET http://localhost:3001/api/products/PRODUCT_ID \
  -H "Content-Type: application/json"
```

### 5. Create Product (Admin Required)
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone with advanced features",
    "price": 999.99,
    "salePrice": 899.99,
    "sku": "IPHONE15PRO001",
    "stock": 50,
    "images": ["https://example.com/iphone1.jpg", "https://example.com/iphone2.jpg"],
    "categoryId": "CATEGORY_ID",
    "isFeatured": true
  }'
```

### 6. Update Product (Admin Required)
```bash
curl -X PUT http://localhost:3001/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "iPhone 15 Pro Max",
    "description": "Updated iPhone with more features",
    "price": 1099.99,
    "salePrice": 999.99,
    "stock": 30
  }'
```

### 7. Delete Product (Admin Required)
```bash
curl -X DELETE http://localhost:3001/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Get Featured Products (Public)
```bash
curl -X GET http://localhost:3001/api/products/featured \
  -H "Content-Type: application/json"
```

### 9. Get Featured Products with Limit (Public)
```bash
curl -X GET "http://localhost:3001/api/products/featured?limit=5" \
  -H "Content-Type: application/json"
```

### 10. Search Products (Public)
```bash
curl -X GET "http://localhost:3001/api/products/search?q=phone&page=1&limit=10" \
  -H "Content-Type: application/json"
```

## 📊 Statistics APIs (Admin Only)

### 1. Get Dashboard Stats
```bash
curl -X GET http://localhost:3001/api/stats/dashboard \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Get Product Stats
```bash
curl -X GET http://localhost:3001/api/stats/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 Test Endpoints

### 1. Health Check
```bash
curl -X GET http://localhost:3001/health \
  -H "Content-Type: application/json"
```

### 2. API Root
```bash
curl -X GET http://localhost:3001/ \
  -H "Content-Type: application/json"
```

## 📝 Notes

1. **Replace `YOUR_ACCESS_TOKEN`** with the actual token received from login
2. **Replace `CATEGORY_ID`** and `PRODUCT_ID`** with actual IDs
3. **Admin Access**: For admin operations, use an email containing 'admin' (e.g., admin@misika.com)
4. **Token Expiry**: Access tokens expire in 15 minutes, refresh tokens in 7 days
5. **Database**: Uses PostgreSQL with userquery table for authentication

## 🔧 Environment Setup

Make sure your `.env` file contains:
```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
```

## 🚀 Quick Test Sequence

1. **Login to get token:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}' | \
  jq -r '.data.accessToken')
```

2. **Create a category:**
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test Category", "description": "Test Description"}'
```

3. **Get all categories:**
```bash
curl -X GET http://localhost:3001/api/categories
```

4. **Get all products:**
```bash
curl -X GET http://localhost:3001/api/products
```

## 🎯 Complete API Test Examples

### Example 1: Complete Category Management Flow
```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}' | \
  jq -r '.data.accessToken')

# 2. Create a category
CATEGORY_RESPONSE=$(curl -s -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Electronics", "description": "Electronic devices"}')

CATEGORY_ID=$(echo $CATEGORY_RESPONSE | jq -r '.data.id')

# 3. Update the category
curl -X PUT http://localhost:3001/api/categories/$CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Updated Electronics", "description": "Updated description"}'

# 4. Get all categories
curl -X GET http://localhost:3001/api/categories

# 5. Delete the category
curl -X DELETE http://localhost:3001/api/categories/$CATEGORY_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Example 2: Complete Product Management Flow
```bash
# 1. Login and get token (same as above)
TOKEN=$(curl -s -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}' | \
  jq -r '.data.accessToken')

# 2. Create a category first
CATEGORY_RESPONSE=$(curl -s -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Smartphones", "description": "Mobile phones"}')

CATEGORY_ID=$(echo $CATEGORY_RESPONSE | jq -r '.data.id')

# 3. Create a product
PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"iPhone 15\",
    \"description\": \"Latest iPhone\",
    \"price\": 999.99,
    \"salePrice\": 899.99,
    \"sku\": \"IPHONE15001\",
    \"stock\": 50,
    \"images\": [\"https://example.com/iphone.jpg\"],
    \"categoryId\": \"$CATEGORY_ID\",
    \"isFeatured\": true
  }")

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.data.id')

# 4. Get the product
curl -X GET http://localhost:3001/api/products/$PRODUCT_ID

# 5. Update the product
curl -X PUT http://localhost:3001/api/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "iPhone 15 Pro", "price": 1099.99}'

# 6. Get products by category
curl -X GET http://localhost:3001/api/products/category/smartphones

# 7. Search for products
curl -X GET "http://localhost:3001/api/products/search?q=iPhone"

# 8. Get featured products
curl -X GET http://localhost:3001/api/products/featured
```

### Example 3: Admin Dashboard Stats
```bash
# Login as admin
TOKEN=$(curl -s -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}' | \
  jq -r '.data.accessToken')

# Get dashboard stats
curl -X GET http://localhost:3001/api/stats/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Get product stats
curl -X GET http://localhost:3001/api/stats/products \
  -H "Authorization: Bearer $TOKEN"
```

## 🔍 API Response Examples

### Successful Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "name": "Animesh Singh",
      "mobile_number": "8795087016",
      "email": "askanimeshsingh@gmail.com",
      "city": "Mumbai"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-08-05T15:57:22.926Z"
}
```

### Products List Response
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "id": "product-id",
      "name": "iPhone 15",
      "slug": "iphone-15",
      "description": "Latest iPhone",
      "price": "999.99",
      "salePrice": "899.99",
      "sku": "IPHONE15001",
      "stock": 50,
      "images": ["https://example.com/iphone.jpg"],
      "isActive": true,
      "isFeatured": true,
      "category": {
        "name": "Smartphones",
        "slug": "smartphones"
      },
      "averageRating": 0,
      "reviewCount": 0,
      "createdAt": "2025-08-05T15:57:22.926Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "timestamp": "2025-08-05T15:57:22.926Z"
}
```
