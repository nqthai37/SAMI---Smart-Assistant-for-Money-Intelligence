// File: models/auth.model.ts
import { prisma } from '../lib/prisma.js';
//Tìm người dùng qua ID
const findByUserID = async (userId) => {
    try {
        return await prisma.user.findUnique({
            where: { id: userId },
        });
    }
    catch (error) {
        console.error('Lỗi Model: không thể tìm người dùng bằng ID.', error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
// Tìm người dùng qua email
const findByEmail = async (email) => {
    try {
        return await prisma.user.findUnique({
            where: { email },
        });
    }
    catch (error) {
        console.error('Lỗi Model: không thể tìm người dùng bằng email.', error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
// Tạo người dùng mới
const create = async (userData) => {
    try {
        return await prisma.user.create({
            data: userData,
        });
    }
    catch (error) {
        console.error('Lỗi Model: không thể tạo người dùng mới.', error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
export const UserModel = { findByUserID, findByEmail, create };
//# sourceMappingURL=userModel.js.map