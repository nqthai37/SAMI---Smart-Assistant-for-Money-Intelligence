// File: test-password-reset.js
// Test chức năng reset password trong development mode

const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Đổi port nếu cần

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset Flow...\n');

  try {
    // Test 1: Forgot Password
    console.log('1️⃣ Testing Forgot Password...');
    const forgotResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: 'test@example.com'
    });
    
    console.log('✅ Forgot Password Response:', forgotResponse.data);
    
    // Trong development mode, chúng ta sẽ nhận được resetToken
    const resetToken = forgotResponse.data.resetToken;
    if (!resetToken) {
      console.log('❌ No reset token received (production mode?)');
      return;
    }
    
    console.log(`🔑 Reset Token: ${resetToken}\n`);
    
    // Test 2: Reset Password với token hợp lệ
    console.log('2️⃣ Testing Reset Password with valid token...');
    const resetResponse = await axios.post(`${BASE_URL}/auth/reset-password`, {
      token: resetToken,
      newPassword: 'newpassword123'
    });
    
    console.log('✅ Reset Password Response:', resetResponse.data);
    
    // Test 3: Thử reset với token đã sử dụng
    console.log('\n3️⃣ Testing Reset Password with used token...');
    try {
      const usedTokenResponse = await axios.post(`${BASE_URL}/auth/reset-password`, {
        token: resetToken,
        newPassword: 'anothernewpassword'
      });
      console.log('❌ Should have failed with used token');
    } catch (error) {
      console.log('✅ Expected error with used token:', error.response.data.message);
    }
    
    // Test 4: Thử reset với token không hợp lệ
    console.log('\n4️⃣ Testing Reset Password with invalid token...');
    try {
      const invalidTokenResponse = await axios.post(`${BASE_URL}/auth/reset-password`, {
        token: 'invalid-token-123',
        newPassword: 'newpassword456'
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      console.log('✅ Expected error with invalid token:', error.response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
  }
}

// Test với các validation cases
async function testValidation() {
  console.log('\n🔍 Testing Validation...\n');
  
  try {
    // Test forgot password without email
    console.log('1️⃣ Testing forgot password without email...');
    try {
      await axios.post(`${BASE_URL}/auth/forgot-password`, {});
    } catch (error) {
      console.log('✅ Expected validation error:', error.response.data.message);
    }
    
    // Test reset password without token
    console.log('\n2️⃣ Testing reset password without token...');
    try {
      await axios.post(`${BASE_URL}/auth/reset-password`, {
        newPassword: 'test123'
      });
    } catch (error) {
      console.log('✅ Expected validation error:', error.response.data.message);
    }
    
    // Test reset password with short password
    console.log('\n3️⃣ Testing reset password with short password...');
    try {
      await axios.post(`${BASE_URL}/auth/reset-password`, {
        token: 'dummy-token',
        newPassword: '123'
      });
    } catch (error) {
      console.log('✅ Expected validation error:', error.response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Validation Test Error:', error.response?.data || error.message);
  }
}

// Chạy tests
async function runTests() {
  console.log('🚀 Starting Password Reset Tests...\n');
  console.log('📝 Make sure server is running on localhost:3000\n');
  
  await testPasswordReset();
  await testValidation();
  
  console.log('\n✨ All tests completed!');
}

runTests().catch(console.error);
