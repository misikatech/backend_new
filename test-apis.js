const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testCategory = {
  name: `Electronics ${Date.now()}`, // Make it unique
  description: 'Electronic devices and gadgets',
  image: 'https://example.com/images/electronics.jpg'
};

const testProduct = {
  name: `iPhone 15 Pro ${Date.now()}`, // Make it unique
  description: 'Latest iPhone with advanced features and powerful performance',
  price: 999.99,
  salePrice: 899.99,
  sku: `IPHONE15PRO${Date.now()}`, // Make SKU unique
  stock: 50,
  images: [
    'https://example.com/images/iphone15pro-1.jpg',
    'https://example.com/images/iphone15pro-2.jpg'
  ],
  isFeatured: true
};

async function testAPIs() {
  try {
    console.log('🧪 Starting API Tests...\n');

    // Test 1: Create a user for admin access
    console.log('1. Creating admin user...');
    const adminUser = {
      username: 'admin',
      email: 'admin@misika.com',
      password: 'admin123456'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, adminUser);
      console.log('✅ Admin user created successfully');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ Admin user already exists');
      } else {
        throw error;
      }
    }

    // Test 2: Login as admin
    console.log('\n2. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    
    const { accessToken } = loginResponse.data.data;
    console.log('✅ Admin login successful');

    // Test 3: Create Category
    console.log('\n3. Creating category...');
    const categoryResponse = await axios.post(`${BASE_URL}/categories`, testCategory, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const createdCategory = categoryResponse.data.data;
    console.log('✅ Category created:', createdCategory.name);
    console.log('   ID:', createdCategory.id);
    console.log('   Slug:', createdCategory.slug);

    // Test 4: Get Categories
    console.log('\n4. Fetching categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Categories fetched:', categoriesResponse.data.data.length, 'categories found');

    // Test 5: Create Product
    console.log('\n5. Creating product...');
    const productData = {
      ...testProduct,
      categoryId: createdCategory.id
    };
    
    const productResponse = await axios.post(`${BASE_URL}/products`, productData, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const createdProduct = productResponse.data.data;
    console.log('✅ Product created:', createdProduct.name);
    console.log('   ID:', createdProduct.id);
    console.log('   SKU:', createdProduct.sku);
    console.log('   Price:', createdProduct.price);

    // Test 6: Get Products
    console.log('\n6. Fetching products...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Products fetched:', productsResponse.data.data.length, 'products found');

    // Test 7: Get Single Product
    console.log('\n7. Fetching single product...');
    const singleProductResponse = await axios.get(`${BASE_URL}/products/${createdProduct.id}`);
    console.log('✅ Single product fetched:', singleProductResponse.data.data.name);

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Admin user creation/login');
    console.log('   ✅ Category creation');
    console.log('   ✅ Category listing');
    console.log('   ✅ Product creation');
    console.log('   ✅ Product listing');
    console.log('   ✅ Single product fetch');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Wait for server to be ready
setTimeout(testAPIs, 2000);
