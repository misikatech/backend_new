const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

const testAuth = async () => {
  console.log('🧪 Testing Auth Endpoints...\n');

  try {
    // Test Registration
    console.log('1. Testing Registration...');
    const registerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '9876543210',
      acceptTerms: true
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful');
    console.log('User:', registerResponse.data.data.user.email);
    
    const { accessToken, refreshToken } = registerResponse.data.data;

    // Test Login
    console.log('\n2. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ Login successful');

    // Test Protected Route
    console.log('\n3. Testing Protected Route...');
    const protectedResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Protected route accessible');

    // Test Token Refresh
    console.log('\n4. Testing Token Refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    console.log('✅ Token refresh successful');

    console.log('\n🎉 All auth tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Wait for server to start
setTimeout(testAuth, 3000);