import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { UserModel } from '../model/UserModel.js';
import bcrypt from 'bcryptjs';


// search teams by keyword
export const searchTeams = async (userId: number, keyword: string) => {
  try {
    // Validate keyword
    if (!keyword || keyword.trim() === '') {
      throw new Error('Keyword is required for search');
    }

    // Call the model method to search teams
    const teams = await UserModel.findByKeyWord(userId, keyword);
    
    // Return the found teams
    return teams;
  } catch (error) {
    console.error('Error in userService.searchTeams:', error);
    throw new Error('Failed to search teams');
  }
};

// Get user profile
export const getUserProfile = async (userId: number) => {
  const user = await UserModel.findByID(userId);
  if (!user) return null;

  // Return a copy of the user object without the passwordHash
  const { passwordHash, ...userProfile } = user;
  return userProfile;
};


// Update profile
export const updateUserProfile = async (
  userId: number,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
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
  userId: number,
  options: { page?: number; limit?: number } = {}
) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  // Lấy teams với transactions để tính balance
  const teams = await prisma.teams.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          teamMembers: {
            some: { userId: userId },
          },
        },
      ],
    },
    include: {
      transactions: {
        select: {
          amount: true,
          type: true,
        },
      },
      teamMembers: {
        where: { userId: userId },
        select: { role: true },
      },
      _count: {
        select: { teamMembers: true },
      },
    },
    skip: skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  // Tính balance cho từng team
  const teamsWithBalance = teams.map(team => {
    const totalIncome = team.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpenses = team.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    
    const currentUserRole = team.teamMembers[0]?.role || 'member';
    
    return {
      id: team.id,
      teamName: team.teamName,
      // description: team.description,
      // color: team.color || 'bg-blue-500',
      currency: team.currency,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      totalIncome,
      totalExpenses,
      balance,
      currentUserRole,
      currentUserMode: currentUserRole, // Assuming mode is same as role
      members: { length: team._count.teamMembers },
    };
  });

  

  const totalTeams = await prisma.teams.count({
    where: {
      OR: [
        { ownerId: userId },
        {
          teamMembers: {
            some: { userId: userId },
          },
        },
      ],
    },
  });

  return {
    data: teamsWithBalance,
    pagination: {
      page,
      limit,
      totalItems: totalTeams,
      totalPages: Math.ceil(totalTeams / limit),
    },
  };
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
// export const changePassword = async (
//   userId: number,
//   oldPassword: string,
//   newPassword: string
// ) => {
//   const user = await UserModel.findByID(userId);
//   if (!user) throw new Error('User not found');
  
//   // Verify old password by comparing with hashed password
//   const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
//   if (!isOldPasswordValid) throw new Error('Old password is incorrect');

//   // Hash new password before saving
//   const newPasswordHash = await bcrypt.hash(newPassword, 10);
  
//   // Update password in database
//   await prisma.user.update({
//     where: { id: userId },
//     data: { passwordHash: newPasswordHash }
//   });

//   return { success: true };
// };
export const changePassword = async (
  userIdentifier: { id: number }, // Nhận object chứa id từ token
  oldPassword: string,
  newPassword: string
) => {
  // Tìm user bằng id lấy từ token
  const user = await prisma.user.findUnique({
    where: { id: userIdentifier.id },
  });

  if (!user) {
    // Lỗi này không nên xảy ra nếu token hợp lệ, nhưng vẫn cần kiểm tra
    throw new Error('User not found');
  }
  
  // Xác thực mật khẩu cũ
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isOldPasswordValid) {
    throw new Error('Mật khẩu hiện tại không chính xác');
  }

  // Hash mật khẩu mới
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  
  // Cập nhật mật khẩu trong database
  await prisma.user.update({
    where: { id: user.id },
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
