import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { UserModel } from '../model/UserModel.js';
import bcrypt from 'bcryptjs';
// Get user profile
export const getUserProfile = async (userId) => {
    const user = await UserModel.findByUserID(userId);
    if (!user)
        return null;
    // Return a copy of the user object without the passwordHash
    const { passwordHash, ...userProfile } = user;
    return userProfile;
};
// Update profile
export const updateUserProfile = async (userId, data) => {
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
export const showTeamList = async (userId, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    // Tìm tất cả các team mà người dùng là chủ sở hữu HOẶC là thành viên
    const teams = await prisma.teams.findMany({
        where: {
            OR: [
                {
                    ownerId: userId, // Người dùng là chủ sở hữu
                },
                {
                    teamMembers: {
                        some: {
                            userId: userId, // Người dùng là thành viên trong team
                        },
                    },
                },
            ],
        },
        skip: skip,
        take: limit,
        orderBy: {
            createdAt: 'desc', // Sắp xếp theo team mới nhất
        },
    });
    // Lấy tổng số team để tính toán phân trang ở phía client
    const totalTeams = await prisma.teams.count({
        where: {
            OR: [
                {
                    ownerId: userId,
                },
                {
                    teamMembers: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            ],
        },
    });
    return {
        data: teams,
        pagination: {
            page,
            limit,
            totalItems: totalTeams,
            totalPages: Math.ceil(totalTeams / limit),
        },
    };
};
// Get notifications with pagination + unread filter
export const getNotification = async (userId, options) => {
    const user = users.find(u => u.id === userId);
    if (!user)
        return null;
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
export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await UserModel.findByUserID(userId);
    if (!user)
        throw new Error('User not found');
    // Verify old password by comparing with hashed password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid)
        throw new Error('Old password is incorrect');
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
export const searchTeam = async (query) => {
    if (!query)
        return [];
    const results = users
        .flatMap(u => u.teams)
        .filter(team => team.toLowerCase().includes(query.toLowerCase()));
    // Loại bỏ trùng lặp
    return [...new Set(results)];
};
//# sourceMappingURL=userService.js.map