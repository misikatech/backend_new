const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/users';

// Test data
const testUser = {
  name: "Test User",
  mobile_number: "9876543210",
  email: "test@example.com",
  city: "Test City",
  password: "testpassword123"
};

async function testOTPFlow() {
  try {
    console.log('🧪 Testing OTP-based Registration Flow\n');

    // Step 1: Send OTP
    console.log('📧 Step 1: Sending OTP...');
    const otpResponse = await axios.post(`${BASE_URL}/send-otp`, testUser);
    console.log('✅ OTP sent successfully:', otpResponse.data.message);

    // Step 2: Simulate OTP input (you would get this from email)
    const otp = prompt('Enter the OTP you received in email: ');
    
    if (!otp) {
      console.log('❌ No OTP provided. Test cancelled.');
      return;
    }

    // Step 3: Verify OTP and complete registration
    console.log('\n🔐 Step 2: Verifying OTP and completing registration...');
    const verifyResponse = await axios.post(`${BASE_URL}/verify-otp`, {
      email: testUser.email,
      otp: otp
    });
    console.log('✅ Registration successful:', verifyResponse.data.message);
    console.log('👤 User created:', verifyResponse.data.user);

    // Step 4: Test login
    console.log('\n🔑 Step 3: Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('👤 User data:', loginResponse.data.user);

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function testForgotPassword() {
  try {
    console.log('\n🔄 Testing Forgot Password Flow\n');

    // Step 1: Request password reset OTP
    console.log('📧 Step 1: Requesting password reset OTP...');
    const forgotResponse = await axios.post(`${BASE_URL}/forgot-password`, {
      email: testUser.email
    });
    console.log('✅ Password reset OTP sent:', forgotResponse.data.message);

    // Step 2: Simulate OTP input
    const otp = prompt('Enter the password reset OTP: ');
    
    if (!otp) {
      console.log('❌ No OTP provided. Test cancelled.');
      return;
    }

    // Step 3: Reset password
    console.log('\n🔐 Step 2: Resetting password...');
    const resetResponse = await axios.post(`${BASE_URL}/reset-password`, {
      email: testUser.email,
      otp: otp,
      newPassword: 'newpassword123'
    });
    console.log('✅ Password reset successful:', resetResponse.data.message);

    // Step 4: Test login with new password
    console.log('\n🔑 Step 3: Testing login with new password...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: testUser.email,
      password: 'newpassword123'
    });
    console.log('✅ Login with new password successful:', loginResponse.data.message);

    console.log('\n🎉 Forgot password flow completed successfully!');

  } catch (error) {
    console.error('❌ Forgot password test failed:', error.response?.data || error.message);
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting API Tests...\n');
  console.log('Make sure the server is running on http://localhost:3001\n');
  
  // Uncomment the test you want to run:
  // testOTPFlow();
  // testForgotPassword();
  
  console.log('Uncomment the test function you want to run in the file.');
}

module.exports = { testOTPFlow, testForgotPassword };
