// Email Delivery Diagnostic Tool
import { config } from 'dotenv';
config();
async function emailDeliveryDiagnostic() {
    console.log('🔍 EMAIL DELIVERY DIAGNOSTIC\n');
    console.log('Investigating why thai37205@gmail.com did not receive the email...\n');
    // 1. Check email configuration
    console.log('1️⃣ EMAIL CONFIGURATION CHECK:');
    console.log('From Email:', process.env.EMAIL_USER);
    console.log('To Email: thai37205@gmail.com');
    console.log('App Password Length:', process.env.EMAIL_PASSWORD?.length);
    console.log('');
    // 2. Test email sending again with detailed logging
    console.log('2️⃣ SENDING TEST EMAIL WITH DETAILED LOGGING:');
    try {
        const EmailService = (await import('./service/emailService.js')).default;
        // Send a simple test email
        const testResult = await EmailService.sendEmail({
            to: 'thai37205@gmail.com',
            subject: '🧪 SAMI Test Email - ' + new Date().toLocaleString(),
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px;">
            <h2 style="color: #4CAF50;">✅ SAMI Email Test</h2>
            <p>If you receive this email, the SAMI email service is working correctly!</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Time: ${new Date().toLocaleString()}</li>
              <li>From: ${process.env.EMAIL_USER}</li>
              <li>Service: Gmail SMTP</li>
            </ul>
            <p style="background: #e8f5e8; padding: 15px; border-radius: 5px;">
              📧 <strong>Success!</strong> Email delivery is working properly.
            </p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This is a test email from SAMI (Smart Assistant for Money Intelligence)
            </p>
          </div>
        </div>
      `
        });
        if (testResult.success) {
            console.log('✅ EMAIL SENT SUCCESSFULLY!');
            console.log('Message ID:', testResult.messageId);
            console.log('');
            console.log('3️⃣ EMAIL DELIVERY TROUBLESHOOTING:');
            console.log('');
            console.log('🔍 WHERE TO CHECK FOR YOUR EMAIL:');
            console.log('');
            console.log('📧 GMAIL INTERFACE STEPS:');
            console.log('1. Go to https://gmail.com');
            console.log('2. Login to thai37205@gmail.com');
            console.log('3. Check these locations:');
            console.log('   📥 Primary inbox');
            console.log('   📢 Promotions tab');
            console.log('   📰 Updates tab');
            console.log('   🚫 Spam/Junk folder');
            console.log('   📁 All Mail');
            console.log('');
            console.log('🔍 SEARCH OPTIONS:');
            console.log('Search in Gmail for:');
            console.log(`   "from:${process.env.EMAIL_USER}"`);
            console.log('   "SAMI Test Email"');
            console.log('   "Password Reset Request"');
            console.log('');
            console.log('⏰ TIMING:');
            console.log('- Email was sent at:', new Date().toLocaleString());
            console.log('- Allow 1-5 minutes for delivery');
            console.log('- Sometimes Gmail has delays');
            console.log('');
            console.log('🚨 MOST COMMON ISSUES:');
            console.log('1. Email in SPAM folder (90% of cases)');
            console.log('2. Email in Promotions tab (Gmail feature)');
            console.log('3. Gmail filters blocking the email');
            console.log('4. Corporate/school email blocking external emails');
            console.log('');
            console.log('🔧 SOLUTIONS:');
            console.log('1. Add alertsnoreply.sami@gmail.com to contacts');
            console.log('2. Mark any found emails as "Not Spam"');
            console.log('3. Check Gmail filters in Settings');
            console.log('4. Try with a different email address');
        }
        else {
            console.log('❌ EMAIL FAILED TO SEND');
            console.log('Error:', testResult.error);
        }
    }
    catch (error) {
        console.log('❌ EMAIL SERVICE ERROR:', error);
    }
    // 4. Alternative email test
    console.log('');
    console.log('4️⃣ ALTERNATIVE EMAIL TEST:');
    console.log('Try testing with different email providers:');
    console.log('- Another Gmail account');
    console.log('- Yahoo mail');
    console.log('- Outlook/Hotmail');
    console.log('- Corporate email');
    console.log('');
    console.log('This helps determine if the issue is specific to thai37205@gmail.com');
}
emailDeliveryDiagnostic().catch(console.error);
//# sourceMappingURL=email-delivery-check.js.map