// Test email functionality directly
import EmailService from './service/emailService.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmail() {
    console.log('🧪 Testing email functionality...');
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
    console.log('🔐 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' : 'NOT SET');
    console.log('📤 SEND_REAL_EMAILS:', process.env.SEND_REAL_EMAILS);
    
    try {
        const testToken = 'test-token-' + Date.now();
        console.log('🔑 Test token:', testToken);
        
        const result = await EmailService.sendPasswordReset('thai37205@gmail.com', testToken);
        
        console.log('✅ Email result:', result);
        
        if (result.success) {
            console.log('🎉 Email sent successfully!');
        } else {
            console.log('❌ Email failed:', result.error);
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

testEmail();
