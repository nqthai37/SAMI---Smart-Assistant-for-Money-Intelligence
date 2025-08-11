// File: services/auth.service.ts
import { UserModel } from '../model/userModel.js';
import EmailService from './emailService.js';
import bcrypt from 'bcryptjs';


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


const forgotPassword = async (email: string) => {
  // 1) Validate
  if (!email) {
    const error = new Error('Email là bắt buộc.');
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

  // 3) 🔐 Generate reset token (in real app, store this in database)
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

  // 4) 📧 Send password reset email
  try {
    // Force email sending for testing (change this logic as needed)
    const shouldSendRealEmail = process.env.NODE_ENV === 'production' || process.env.SEND_REAL_EMAILS === 'true';
    
    if (shouldSendRealEmail) {
      const emailResult = await EmailService.sendPasswordReset(email, resetToken);
      
      if (emailResult.success) {
        console.log(`✅ Password reset email sent to ${email}`);
        return { 
          success: true, 
          message: 'Email khôi phục mật khẩu đã được gửi.',
          resetToken // In production, don't return this
        };
      } else {
        console.log(`⚠️ Failed to send password reset email: ${emailResult.error}`);
        throw new Error('Không thể gửi email khôi phục mật khẩu.');
      }
    } else {
      // Development mode - just log the reset token
      console.log(`🔐 [DEV] Password reset for ${email}, token: ${resetToken}`);
      console.log(`🔗 [DEV] Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
      
      return { 
        success: true, 
        message: 'Email khôi phục mật khẩu đã được gửi (development mode).',
        resetToken, // In dev mode, return token for testing
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      };
    }
  } catch (emailError) {
    console.error('Email service error during password reset:', emailError);
    throw new Error('Không thể gửi email khôi phục mật khẩu.');
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
  forgotPassword
};

export const EnhancedAuthService = { 
  register, 
  login, 
  forgotPassword,
  sendTransactionNotification,
  sendBudgetAlert
};
