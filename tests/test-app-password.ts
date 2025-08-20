// Test email service với App Password mới
import { config } from 'dotenv';
config(); // Load environment variables

async function testEmailWithAppPassword() {
  console.log('🧪 Testing Email Service with App Password...\n');
  
  // Check if App Password is properly set
  const emailPassword = process.env.EMAIL_PASSWORD;
  console.log('📧 Email Configuration Check:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD length:', emailPassword?.length || 0);
  console.log('EMAIL_PASSWORD format:', emailPassword?.replace(/./g, '*') || 'Not set');
  
  // Validate App Password format
  if (emailPassword && emailPassword.length === 16 && !/\s/.test(emailPassword)) {
    console.log('✅ App Password format looks correct');
  } else {
    console.log('❌ App Password format issues:');
    if (!emailPassword) {
      console.log('   - No password set');
    } else if (emailPassword.length !== 16) {
      console.log(`   - Wrong length: ${emailPassword.length} (should be 16)`);
    } else if (/\s/.test(emailPassword)) {
      console.log('   - Contains spaces (should remove all spaces)');
    }
    return;
  }
  
  // Test email connection
  try {
    console.log('\n🔗 Testing email connection...');
    const EmailService = (await import('./service/emailService.js')).default;
    
    const isHealthy = await EmailService.verifyConnection();
    
    if (isHealthy) {
      console.log('✅ Email service connection: SUCCESS!');
      console.log('🎉 Gmail App Password is working correctly');
      
      // Optional: Test password reset email
      console.log('\n📧 Testing password reset email...');
      const result = await EmailService.sendPasswordReset(
        'test@example.com',
        'test-token-123'
      );
      
      if (result.success) {
        console.log('✅ Password reset email: SUCCESS');
        console.log('Message ID:', result.messageId);
      } else {
        console.log('❌ Password reset email failed:', result.error);
      }
      
    } else {
      console.log('❌ Email service connection: STILL FAILING');
      console.log('\n🔧 Double-check:');
      console.log('1. App Password copied correctly (no spaces)');
      console.log('2. 2-Factor Authentication is enabled');
      console.log('3. Using the Gmail account that generated the App Password');
    }
    
  } catch (error) {
    console.log('❌ Error testing email service:', error);
  }
}

testEmailWithAppPassword();
