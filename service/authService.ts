// File: services/auth.service.ts
import { AuthModel } from '../model/authModel.js';
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
  const existingUser = await AuthModel.findByEmail(email);
  if (existingUser) {
    const error = new Error('Email này đã được đăng ký.');
    (error as any).statusCode = 409;
    throw error;
  }

  // 3) Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // 4) Tạo user theo schema mới (camelCase)
  const newUser = await AuthModel.create({
    email,
    passwordHash,
    firstName,
    lastName,
  });

  // 5) Bỏ passwordHash khi trả về
  const { passwordHash: _omit, ...userWithoutPassword } = newUser as any;
  return userWithoutPassword;
};

export const AuthService = { register };
