// Simple forgot password test without Prisma
import EmailService from './service/emailService.ts';
import { UserModel } from './model/userModel.ts';
import dotenv from 'dotenv';

dotenv.config();

async function simpleForgotPassword(email: string) {
    console.log('🔍 Simple forgot password for:', email);
    
    try {
        // 1) Find user
        const user = await UserModel.findByEmail(email);
        if (!user) {
            console.log('⚠️ User not found');
            return { success: true, message: 'If email exists, reset link sent' };
        }
        
        console.log('👤 User found:', user.email);
        
        // 2) Generate token
        const resetToken = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15) + 
                          Date.now().toString(36);
        
        console.log('🔑 Generated token:', resetToken);
        
        // 3) Send email
        const emailResult = await EmailService.sendPasswordReset(email, resetToken);
        
        if (emailResult.success) {
            console.log('✅ Email sent successfully!');
            console.log('📧 Message ID:', emailResult.messageId);
            
            return {
                success: true,
                message: 'Email khôi phục mật khẩu đã được gửi.',
                resetToken: resetToken, // For testing
                resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
            };
        } else {
            console.log('❌ Email failed:', emailResult.error);
            throw new Error('Không thể gửi email.');
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
        throw error;
    }
}

// Test it
simpleForgotPassword('thai37205@gmail.com')
    .then(result => {
        console.log('🎉 Final result:', result);
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
    });
