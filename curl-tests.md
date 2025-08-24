# API Testing with cURL Commands

## Base URL
```
BASE_URL=http://localhost:3001/api
```

## 1. Create Admin User (Registration)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@misika.com",
    "password": "admin123456"
  }'
```

## 2. Login as Admin

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@misika.com",
    "password": "admin123456"
  }'
```

**Save the accessToken from the response for the next requests.**

## 3. Create Category

```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "name": "Smartphones",
    "description": "Latest smartphones and mobile devices",
    "image": "https://example.com/images/smartphones.jpg"
  }'
```

## 4. Get All Categories

```bash
curl -X GET http://localhost:3001/api/categories \
  -H "Content-Type: application/json"
```

## 5. Create Product

**Note: Replace CATEGORY_ID_HERE with the actual category ID from step 3**

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "name": "Samsung Galaxy S24",
    "description": "Latest Samsung flagship smartphone with advanced AI features",
    "price": 899.99,
    "salePrice": 799.99,
    "sku": "SAMSUNG-S24-001",
    "stock": 25,
    "images": [
      "https://example.com/images/samsung-s24-1.jpg",
      "https://example.com/images/samsung-s24-2.jpg"
    ],
    "categoryId": "CATEGORY_ID_HERE",
    "isFeatured": true
  }'
```

## 6. Get All Products

```bash
curl -X GET http://localhost:3001/api/products \
  -H "Content-Type: application/json"
```

## 7. Get Single Product

**Note: Replace PRODUCT_ID_HERE with the actual product ID from step 5**

```bash
curl -X GET http://localhost:3001/api/products/PRODUCT_ID_HERE \
  -H "Content-Type: application/json"
```

## 8. Update Product

**Note: Replace PRODUCT_ID_HERE with the actual product ID**

```bash
curl -X PUT http://localhost:3001/api/products/PRODUCT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "price": 849.99,
    "salePrice": 749.99,
    "stock": 30
  }'
```

## 9. Delete Product (Soft Delete)

**Note: Replace PRODUCT_ID_HERE with the actual product ID**

```bash
curl -X DELETE http://localhost:3001/api/products/PRODUCT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 10. Get Products with Filters

### Filter by category
```bash
curl -X GET "http://localhost:3001/api/products?category=smartphones" \
  -H "Content-Type: application/json"
```

### Filter by price range
```bash
curl -X GET "http://localhost:3001/api/products?minPrice=500&maxPrice=1000" \
  -H "Content-Type: application/json"
```

### Search products
```bash
curl -X GET "http://localhost:3001/api/products?search=samsung" \
  -H "Content-Type: application/json"
```

### Pagination
```bash
curl -X GET "http://localhost:3001/api/products?page=1&limit=5" \
  -H "Content-Type: application/json"
```

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-07-31T17:50:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": "Detailed error information",
  "timestamp": "2025-07-31T17:50:00.000Z"
}
```

## Database Schema Validation

The APIs validate data according to these schemas:

### Category Schema
- `name`: String (2-100 chars, required)
- `description`: String (optional)
- `image`: Valid URL (optional)

### Product Schema
- `name`: String (2-200 chars, required)
- `description`: String (min 10 chars, required)
- `price`: Positive number (required)
- `salePrice`: Positive number (optional)
- `sku`: String (required, unique)
- `stock`: Integer >= 0 (required)
- `images`: Array of valid URLs (min 1, required)
- `categoryId`: Valid UUID (required)
- `isFeatured`: Boolean (optional)
