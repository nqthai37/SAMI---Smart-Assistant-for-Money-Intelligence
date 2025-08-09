// File: lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Khai báo một biến toàn cục để lưu trữ instance của PrismaClient
// Điều này giúp tránh việc khởi tạo lại client mỗi khi code được reload trong môi trường development
declare global {
    var prisma: PrismaClient | undefined;
}

// Tạo instance của PrismaClient.
// Nếu đã có instance trong biến global thì dùng lại, nếu không thì tạo mới.
export const prisma = global.prisma || new PrismaClient();

// Chỉ trong môi trường development, gán instance mới tạo vào biến global
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}