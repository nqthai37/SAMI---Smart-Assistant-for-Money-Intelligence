import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { UserModel } from '../model/UserModel.js';
import bcrypt from 'bcryptjs';
// src/services/userService.ts
interface PaginationOptions {
  page?: number | undefined;
  limit?: number | undefined;
  unreadOnly?: boolean | undefined;
}


// Get user profile
export const getUserProfile = async (userId: number) => {
  const user = await UserModel.findByUserID(userId);
  if (!user) return null;

  // Return a copy of the user object without the password
  const { password, ...userProfile } = user;
  return userProfile;
};

// Update profile
// ...existing code...
// Update profile
export const updateUserProfile = async (
  userId: number,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string | Date;
    gender?: string;
  }
) => {
  // Chuyển đổi dateOfBirth sang đối tượng Date nếu nó là string
  if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      updated_at: new Date(), // Cập nhật trường updated_at
    },
  });

  if (!updatedUser) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...userProfile } = updatedUser;
  return userProfile;
};


// Show team list with pagination
export const showTeamList = async (
  userId?: number,
  options?: { page?: number; limit?: number }
) => {
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  let teams = [...user.teams];
  if (options?.page && options?.limit) {
    const start = (options.page - 1) * options.limit;
    teams = teams.slice(start, start + options.limit);
  }

  return teams;
};

// Get notifications with pagination + unread filter
export const getNotification = async (
  userId?: number,
  options?: { page?: number; limit?: number; unreadOnly?: boolean }
) => {
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  let notifications = [...user.notifications];
  if (options?.unreadOnly) {
    notifications = notifications.filter(n => !n.read);
  }
  if (options?.page && options?.limit) {
    const start = (options.page - 1) * options.limit;
    notifications = notifications.slice(start, start + options.limit);
  }

  return notifications;
};

// Change password
export const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string
) => {
  const user = await UserModel.findByUserID(userId);
  if (!user) throw new Error('User not found');
  
  // Verify old password by comparing with hashed password
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isOldPasswordValid) throw new Error('Old password is incorrect');

  // Hash new password before saving
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  
  // Update password in database
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash }
  });

  return { success: true };
};

// Search teams (tìm trong teams)
export const searchTeam = async (query: string) => {
  if (!query) return [];

  const results = users
    .flatMap(u => u.teams)
    .filter(team => team.toLowerCase().includes(query.toLowerCase()));

  // Loại bỏ trùng lặp
  return [...new Set(results)];
};
