// File: models/auth.model.ts
import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

type UserCreateData = Prisma.UserCreateArgs['data'];

//Tìm người dùng qua ID
const findByUserID = async (userId: number) => {
  try 
  {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  } catch (error) {
    console.error('Lỗi Model: không thể tìm người dùng bằng ID.', error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

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

const findById = async (id:  number) => {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Lỗi Model: không thể tìm người dùng bằng ID.', error);
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

// findByKeyWord
const findByKeyWord = async (userId: number, keyword: string) => {
  try {
    return await prisma.teams.findMany({
      where: {
        OR: [
          { teamName: { contains: keyword, mode: 'insensitive' } },
        ],
        teamMembers: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        teamMembers: true,
      },
    });
  } catch (error) {
    console.error('Lỗi Model: không thể tìm kiếm đội bằng từ khóa.', error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
}

export const UserModel = { 
  findByEmail, 
  create, 
  findById,
  findByKeyWord,
};
