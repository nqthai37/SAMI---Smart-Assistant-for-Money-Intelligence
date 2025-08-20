// File: services/auth.service.ts
import { UserModel } from '../model/userModel.js';
import EmailService from './emailService.js';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';


interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string; // trong schema hiện KHÔNG optional
}

const register = async (userData: RegisterUserData) => {
  const { email, password, firstName, lastName } = userData;

  // 1) Validate
  if (!email || !password || !firstName || !lastName) {
    const error = new Error('Email, mật khẩu, firstName, lastName là bắt buộc.');
    (error as any).statusCode = 400;
    throw error;
  }

  // 2) Check trùng email
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    const error = new Error('Email này đã được đăng ký.');
    (error as any).statusCode = 409;
    throw error;
  }

  // 3) Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // 4) Tạo user theo schema mới (camelCase)
  const newUser = await UserModel.create({
    email,
    passwordHash,
    firstName,
    lastName,
  });

  // 5) Bỏ passwordHash khi trả về
  const { passwordHash: _omit, ...userWithoutPassword } = newUser as any;
  return userWithoutPassword;
};

const login = async (email: string, password: string) => {
  // 1) Validate
  if (!email || !password) {
    const error = new Error('Email và mật khẩu là bắt buộc.');
    (error as any).statusCode = 400;
    throw error;
  }

  // 2) Tìm người dùng theo email
  const user = await UserModel.findByEmail(email);
  if (!user) {
    const error = new Error('Người dùng không tồn tại.');
    (error as any).statusCode = 404;
    throw error;
  }

  // 3) Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Mật khẩu không chính xác.');
    (error as any).statusCode = 401;
    throw error;
  }

  // 4) Bỏ passwordHash khi trả về
  const { passwordHash: _omit, ...userWithoutPassword } = user as any;
  return userWithoutPassword;
};

const logout = async () => {
  // For client-side logout, just return success
  // Client will clear localStorage/sessionStorage
  return {
    success: true,
    message: 'Đăng xuất thành công.'
  };
};


const forgotPassword = async (email: string) => {
  // 1) Validate
  if (!email) {
    const error = new Error('Email là bắt buộc.');
    (error as any).statusCode = 400;
    throw error;
  }

  // 2) Tìm người dùng theo email
  let user;
  try {
    user = await UserModel.findByEmail(email);
    
    if (!user) {
      // Security: Don't reveal if email exists or not
      return { 
        success: true, 
        message: 'Nếu email tồn tại, bạn sẽ nhận được email khôi phục mật khẩu.',
      };
    }
  } catch (findUserError) {
    console.error('❌ Error finding user:', findUserError);
    throw new Error('Lỗi khi tìm người dùng.');
  }

  // 3) 🔐 Create reset token
  try {
    // Check if we're in development mode without database connection
    const isDevelopmentMode = process.env.NODE_ENV !== 'production' && process.env.SEND_REAL_EMAILS?.toLowerCase().trim() !== 'true';
    
    let resetToken: string;
    
    if (isDevelopmentMode) {
      // Development mode: Generate simple token without database
      resetToken = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15) + 
                   Date.now().toString(36);
                   
      console.log(`� [DEV] Password reset for ${email}, token: ${resetToken}`);
      console.log(`🔗 [DEV] Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
      
      // Store token temporarily in memory for demo (not production ready)
      if (!(global as any).tempResetTokens) {
        (global as any).tempResetTokens = new Map();
      }
      (global as any).tempResetTokens.set(resetToken, {
        userId: user.id,
        email: email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        used: false
      });
      
      return { 
        success: true, 
        message: 'Email khôi phục mật khẩu đã được gửi (development mode).',
        resetToken, // In dev mode, return token for testing
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      };
    } else {
      // Production mode: Use database
      // Deactivate any existing tokens for this user
      await (prisma as any).passwordResets.updateMany({
        where: { 
          userId: user.id,
          used: false,
          expiresAt: {
            gt: new Date()
          }
        },
        data: { used: true }
      });

      // Create new reset token
      const resetRecord = await (prisma as any).passwordResets.create({
        data: {
          userId: user.id,
        }
      });

      const emailResult = await EmailService.sendPasswordReset(email, resetRecord.token);
      
      if (emailResult.success) {
        return { 
          success: true, 
          message: 'Email khôi phục mật khẩu đã được gửi.',
        };
      } else {
        throw new Error('Không thể gửi email khôi phục mật khẩu.');
      }
    }
  } catch (dbError) {
    console.error('Database error during password reset:', dbError);
    throw new Error('Không thể tạo token khôi phục mật khẩu.');
  }
};

const resetPassword = async (token: string, newPassword: string) => {
  // 1) Validate inputs
  if (!token || !newPassword) {
    const error = new Error('Token và mật khẩu mới là bắt buộc.');
    (error as any).statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    (error as any).statusCode = 400;
    throw error;
  }

  // 2) Check mode and find token
  const isDevelopmentMode = process.env.NODE_ENV !== 'production' && process.env.SEND_REAL_EMAILS !== 'true';
  
  try {
    if (isDevelopmentMode) {
      // Development mode: Use memory storage
      const tempTokens = (global as any).tempResetTokens;
      if (!tempTokens) {
        const error = new Error('Token storage chưa được khởi tạo.');
        (error as any).statusCode = 500;
        throw error;
      }
      
      if (!tempTokens.has(token)) {
        const error = new Error('Token không hợp lệ hoặc đã hết hạn.');
        (error as any).statusCode = 400;
        throw error;
      }
      
      const tokenData = tempTokens.get(token);
      
      // Check if token is expired or used
      if (tokenData.used || new Date() > tokenData.expiresAt) {
        const error = new Error('Token không hợp lệ hoặc đã hết hạn.');
        (error as any).statusCode = 400;
        throw error;
      }
      
      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      // Update user password (find user by email since we have it in tokenData)
      const user = await UserModel.findByEmail(tokenData.email);
      if (!user) {
        const error = new Error('Người dùng không tồn tại.');
        (error as any).statusCode = 404;
        throw error;
      }
      
      // For development, we'll simulate updating the password
      // In real implementation, this would update the database
      
      // Mark token as used
      tokenData.used = true;
      tempTokens.set(token, tokenData);
      
      return {
        success: true,
        message: 'Mật khẩu đã được cập nhật thành công (development mode).'
      };
      
    } else {
      // Production mode: Use database
      const resetRecord = await (prisma as any).passwordResets.findFirst({
        where: {
          token: token,
          used: false,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          User: true
        }
      });

      if (!resetRecord) {
        const error = new Error('Token không hợp lệ hoặc đã hết hạn.');
        (error as any).statusCode = 400;
        throw error;
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update user password and mark token as used
      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetRecord.userId },
          data: { passwordHash }
        }),
        (prisma as any).passwordResets.update({
          where: { id: resetRecord.id },
          data: { used: true }
        })
      ]);

      return {
        success: true,
        message: 'Mật khẩu đã được cập nhật thành công.'
      };
    }

  } catch (dbError) {
    console.error('Error during password reset:', dbError);
    const error = new Error('Không thể cập nhật mật khẩu.');
    (error as any).statusCode = 500;
    throw error;
  }
};

// 🆕 New method: Send transaction notification to user
const sendTransactionNotification = async (
  userEmail: string,
  userName: string,
  transactionData: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: string;
    teamName?: string;
    currency?: string;
  }
) => {
  try {
    const transaction = {
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      category: transactionData.category,
      date: new Date().toISOString(),
      currency: transactionData.currency || 'VND',
      ...(transactionData.teamName && { teamName: transactionData.teamName })
    };

    const result = await EmailService.sendTransactionAlert(userEmail, userName, transaction);
    
    if (result.success) {
      console.log(`✅ Transaction alert sent to ${userEmail}`);
      return { success: true, messageId: result.messageId };
    } else {
      console.log(`⚠️ Failed to send transaction alert: ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error sending transaction notification:', error);
    return { success: false, error: 'Failed to send transaction notification' };
  }
};

// 🆕 New method: Send budget alert to team members
const sendBudgetAlert = async (
  userEmail: string,
  userName: string,
  teamName: string,
  budgetData: {
    budget: number;
    spent: number;
    currency?: string;
  }
) => {
  try {
    const percentage = (budgetData.spent / budgetData.budget) * 100;
    
    const budgetInfo = {
      budget: budgetData.budget,
      spent: budgetData.spent,
      remaining: budgetData.budget - budgetData.spent,
      percentage: percentage,
      currency: budgetData.currency || 'VND'
    };

    const result = await EmailService.sendBudgetAlert(userEmail, userName, teamName, budgetInfo);
    
    if (result.success) {
      console.log(`✅ Budget alert sent to ${userEmail}`);
      return { success: true, messageId: result.messageId };
    } else {
      console.log(`⚠️ Failed to send budget alert: ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error sending budget alert:', error);
    return { success: false, error: 'Failed to send budget alert' };
  }
};

export const AuthService = { 
  register, 
  login,
  logout,
  forgotPassword,
  resetPassword
};

export const EnhancedAuthService = { 
  register, 
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendTransactionNotification,
  sendBudgetAlert
};
