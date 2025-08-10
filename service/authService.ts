// File: services/auth.service.ts
import { UserModel } from '../model/UserModel.js';
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

  // 3) Gửi email khôi phục mật khẩu (giả lập)
  console.log(`Gửi email khôi phục mật khẩu đến ${email}`);

  return true;
};

export const AuthService = { register, login };
