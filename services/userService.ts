import { UserModel } from "../model/UserModel.ts";
import bcrypt from 'bcrypt';

// src/services/userService.ts
interface PaginationOptions {
  page?: number | undefined;
  limit?: number | undefined;
  unreadOnly?: boolean | undefined;
}

// Dữ liệu giả lập để test
let users = [
  {
    id: 1,
    name: 'James',
    email: 'james@example.com',
    password: '123456',
    teams: ['Team A', 'Team B', 'Team C'],
    notifications: [
      { id: 101, message: 'Welcome!', read: false },
      { id: 102, message: 'New update available', read: true }
    ]
  },
  {
    id: 2,
    name: 'Anna',
    email: 'anna@example.com',
    password: '654321',
    teams: ['Team D'],
    notifications: []
  }
];

// Test service
export const testService = () => {
  return { message: 'User service works!', example: [1, 2, 3] };
};

// Get user profile
export const getUserProfile = async (userId: number) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const { passwordHash, ...userProfile } = user;
  return userProfile;
};

// Update profile
export const updateUserProfile = async (
  userId: number,
  data: { name?: string; email?: string }
) => {
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  if (data.name) user.name = data.name;
  if (data.email) user.email = data.email;

  return user;
};

// Change password
// export const verifyOldPassword = async (userId: number, oldPassword: string) => {
//   const user = await UserModel.findById(userId);
//   if (!user) {
//     throw new Error('User not found');
//   }
//   return bcrypt.compare(oldPassword, user.passwordHash);
// }
export const changeUserPassword = async (userId: number, oldPassword: string, newPassword: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error('Old password is incorrect');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = newPasswordHash;
  await user.save();

  return { message: 'Password changed successfully' };
}

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



// Search teams (tìm trong teams)
export const searchTeam = async (query: string) => {
  if (!query) return [];

  const results = users
    .flatMap(u => u.teams)
    .filter(team => team.toLowerCase().includes(query.toLowerCase()));

  // Loại bỏ trùng lặp
  return [...new Set(results)];
};
