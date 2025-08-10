// File: models/auth.model.ts
import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

type UserCreateData = Prisma.UserCreateArgs['data'];

// Tìm người dùng qua email
const findByEmail = async (email: string) => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error('Lỗi Model: không thể tìm người dùng bằng email.', error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

// Tạo người dùng mới
const create = async (userData: Prisma.UserCreateInput) => {
  try {
    return await prisma.user.create({
      data: userData,
    });
  } catch (error) {
    console.error('Lỗi Model: không thể tạo người dùng mới.', error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

export const UserModel = { findByEmail, create };
