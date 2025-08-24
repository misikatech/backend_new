#!/bin/bash

# API Testing Script with cURL
# Make sure the server is running on http://localhost:3001

BASE_URL="http://localhost:3001/api"

echo "🧪 Testing APIs with cURL..."
echo "================================"

# Step 1: Register Admin User
echo "1. Creating admin user..."
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@misika.com",
    "password": "admin123456"
  }' | jq '.'

echo -e "\n"

# Step 2: Login as Admin
echo "2. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@misika.com",
    "password": "admin123456"
  }')

echo $LOGIN_RESPONSE | jq '.'

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
echo "Access Token: $ACCESS_TOKEN"

echo -e "\n"

# Step 3: Create Category
echo "3. Creating category..."
CATEGORY_RESPONSE=$(curl -s -X POST $BASE_URL/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Test Laptops",
    "description": "High-performance laptops for work and gaming",
    "image": "https://example.com/images/laptops.jpg"
  }')

echo $CATEGORY_RESPONSE | jq '.'

# Extract category ID
CATEGORY_ID=$(echo $CATEGORY_RESPONSE | jq -r '.data.id')
echo "Category ID: $CATEGORY_ID"

echo -e "\n"

# Step 4: Get All Categories
echo "4. Fetching all categories..."
curl -s -X GET $BASE_URL/categories \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n"

# Step 5: Create Product
echo "5. Creating product..."
PRODUCT_RESPONSE=$(curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"name\": \"MacBook Pro M3\",
    \"description\": \"Latest MacBook Pro with M3 chip, perfect for developers and creators\",
    \"price\": 1999.99,
    \"salePrice\": 1799.99,
    \"sku\": \"MACBOOK-M3-$(date +%s)\",
    \"stock\": 15,
    \"images\": [
      \"https://example.com/images/macbook-m3-1.jpg\",
      \"https://example.com/images/macbook-m3-2.jpg\"
    ],
    \"categoryId\": \"$CATEGORY_ID\",
    \"isFeatured\": true
  }")

echo $PRODUCT_RESPONSE | jq '.'

# Extract product ID
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.data.id')
echo "Product ID: $PRODUCT_ID"

echo -e "\n"

# Step 6: Get All Products
echo "6. Fetching all products..."
curl -s -X GET $BASE_URL/products \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n"

# Step 7: Get Single Product
echo "7. Fetching single product..."
curl -s -X GET $BASE_URL/products/$PRODUCT_ID \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n"

# Step 8: Update Product
echo "8. Updating product..."
curl -s -X PUT $BASE_URL/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "price": 1899.99,
    "salePrice": 1699.99,
    "stock": 20
  }' | jq '.'

echo -e "\n"

# Step 9: Test Product Filters
echo "9. Testing product filters..."

echo "9a. Filter by category:"
curl -s -X GET "$BASE_URL/products?category=test-laptops" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n"

echo "9b. Filter by price range:"
curl -s -X GET "$BASE_URL/products?minPrice=1000&maxPrice=2000" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n"

echo "9c. Search products:"
curl -s -X GET "$BASE_URL/products?search=macbook" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n"

echo "🎉 All cURL tests completed!"
