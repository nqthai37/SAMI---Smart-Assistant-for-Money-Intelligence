// File: lib/prisma.ts
import { PrismaClient } from '@prisma/client';
// Tạo instance của PrismaClient.
// Nếu đã có instance trong biến global thì dùng lại, nếu không thì tạo mới.
export const prisma = global.prisma || new PrismaClient();
// Chỉ trong môi trường development, gán instance mới tạo vào biến global
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
//# sourceMappingURL=prisma.js.map