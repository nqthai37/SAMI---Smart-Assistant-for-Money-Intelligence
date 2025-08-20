// Comprehensive email debugging
import { config } from 'dotenv';
config();

async function debugEmailIssue() {
  console.log('🔍 DEBUGGING EMAIL ISSUE - Tại sao không nhận được email\n');
  
  // 1. Check environment variables
  console.log('1️⃣ KIỂM TRA CẤU HÌNH EMAIL:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);
  console.log('EMAIL_PASSWORD (masked):', process.env.EMAIL_PASSWORD?.replace(/./g, '*'));
  
  // Validate App Password format
  const emailPassword = process.env.EMAIL_PASSWORD;
  if (emailPassword?.includes(' ')) {
    console.log('❌ LỖI: App Password còn dấu cách!');
    console.log('   Hiện tại:', `"${emailPassword}"`);
    console.log('   Cần sửa thành:', `"${emailPassword.replace(/\s/g, '')}"`);
    return;
  } else if (emailPassword?.length !== 16) {
    console.log('❌ LỖI: App Password không đúng độ dài 16 ký tự!');
    console.log('   Độ dài hiện tại:', emailPassword?.length);
    return;
  } else {
    console.log('✅ App Password format: OK');
  }
  
  // 2. Test email service connection
  console.log('\n2️⃣ KIỂM TRA KẾT NỐI EMAIL SERVICE:');
  try {
    const EmailService = (await import('./service/emailService.js')).default;
    
    console.log('Testing SMTP connection...');
    const isHealthy = await EmailService.verifyConnection();
    
    if (isHealthy) {
      console.log('✅ SMTP Connection: SUCCESS');
      
      // 3. Test actual email sending
      console.log('\n3️⃣ TEST GỬI EMAIL THỰC TẾ:');
      console.log('Gửi email test đến:', 'thai37205@gmail.com');
      
      const testResult = await EmailService.sendPasswordReset(
        'thai37205@gmail.com',
        'test-reset-token-' + Date.now()
      );
      
      if (testResult.success) {
        console.log('✅ EMAIL ĐÃ GỬI THÀNH CÔNG!');
        console.log('Message ID:', testResult.messageId);
        console.log('\n📧 KIỂM TRA EMAIL:');
        console.log('1. Vào hộp thư đến của thai37205@gmail.com');
        console.log('2. Kiểm tra thư mục Spam/Junk');
        console.log('3. Tìm email từ: alertsnoreply.sami@gmail.com');
        console.log('4. Chủ đề: "🔐 Password Reset Request - SAMI"');
        
        // Check common email delivery issues
        console.log('\n🔍 NẾU KHÔNG THẤY EMAIL, KIỂM TRA:');
        console.log('📁 Thư mục Spam/Junk Mail');
        console.log('🔒 Bộ lọc email của Gmail');
        console.log('📨 Tab "Promotions" hoặc "Updates" trong Gmail');
        console.log('⏰ Đợi 1-2 phút (đôi khi có độ trễ)');
        
      } else {
        console.log('❌ EMAIL GỬI THẤT BẠI!');
        console.log('Lỗi:', testResult.error);
      }
      
    } else {
      console.log('❌ SMTP Connection: FAILED');
      console.log('Kiểm tra lại App Password và cài đặt Gmail');
    }
    
  } catch (error) {
    console.log('❌ LỖI EMAIL SERVICE:', error);
    
    if (error.message?.includes('Invalid login')) {
      console.log('\n🔐 LỖI XÁC THỰC - GIẢI PHÁP:');
      console.log('1. Kiểm tra App Password đã đúng chưa');
      console.log('2. Đảm bảo 2FA đã bật');
      console.log('3. Tạo lại App Password mới');
    }
  }
  
  // 4. Check authService logic
  console.log('\n4️⃣ KIỂM TRA LOGIC AUTHSERVICE:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
  console.log('Mode:', process.env.NODE_ENV === 'production' ? 'Production (gửi email thật)' : 'Development (có thể chỉ log)');
}

debugEmailIssue().catch(console.error);
