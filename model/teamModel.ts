// model/teamModel.ts
import { PrismaClient, Prisma } from '@prisma/client';
import type { teams as Team } from '@prisma/client';
import { UserModel } from './UserModel.js'; // Giả sử bạn có một UserModel để tìm người dùng theo email
import  EmailService from '../services/emailService.js'; // Giả sử bạn có một EmailService để gửi email
const prisma = new PrismaClient();

export type TeamCreationData = {
  name: string;
  ownerId: number;
};

export const TeamModel = {
  /**
   * Tạo team + tự thêm owner vào teamMembers (role='owner')
   */
  create: async (teamData: TeamCreationData): Promise<Team> => {
    const { name, ownerId } = teamData;

    const newTeam = await prisma.teams.create({
      data: {
        teamName: name,
        ownerId,
        teamMembers: {
          create: {
            userId: ownerId,
            role: 'owner',
          },
        },
      },
    });

    return newTeam;
  },

  /**
   * XÓA THẲNG team theo id (KHÔNG kiểm tra quyền ở đây).
   * ĐÃ GIẢ ĐỊNH các quan hệ con có onDelete: Cascade trong schema.
   * Luôn gọi qua service để đã check quyền trước.
   */
  removeRaw: async (teamId: number): Promise<void> => {
    await prisma.teams.delete({ where: { id: teamId } });
  },

  // ====== CÁC HÀM UPDATE FIELD THEO DB teams ======

  updateBudget: async (teamId: number, amount: number) => {
    // Chuyển amount sang kiểu Decimal và thêm updatedAt
    const decimalAmount = new Prisma.Decimal(amount).toDecimalPlaces(2);
    return await prisma.teams.update({
      where: { id: teamId },
      data: { 
        budget: decimalAmount,
        updatedAt: new Date() // Thêm dòng này cho nhất quán
      },
      select: { id: true, budget: true, updatedAt: true }, // Thêm updatedAt vào select
    });
  },

  updateIncomeGoal: async (teamId: number, target: number) => {
    const decimal = new Prisma.Decimal(target).toDecimalPlaces(2);
    return await prisma.teams.update({
      where: { id: teamId },
      data: { incomeGoal: decimal, updatedAt: new Date() }, // Sửa từ 'decimal' thành 'incomeGoal: decimal'
      select: { id: true, incomeGoal: true, updatedAt: true },
    });
  },

  updateCurrency: async (teamId: number, currency: string) =>
    prisma.teams.update({
      where: { id: teamId },
      data: { currency, updatedAt: new Date() },
      select: { id: true, currency: true, updatedAt: true },
    }),

  updateCategories: async (teamId: number, categories: Prisma.JsonValue) =>
    prisma.teams.update({
      where: { id: teamId },
      data: { categories, updatedAt: new Date() },
      select: { id: true, categories: true, updatedAt: true },
    }),

  updateName: async (teamId: number, newName: string) =>
    prisma.teams.update({
      where: { id: teamId },
      data: { teamName: newName, updatedAt: new Date() },
      select: { id: true, teamName: true, updatedAt: true },
    }),
  
  updateReportPermission: async (teamId: number, allow: boolean) =>
    prisma.teams.update({
      where: { id: teamId },
      data: { allowMemberViewReport: allow, updatedAt: new Date() },
      select: { id: true, allowMemberViewReport: true, updatedAt: true },
    }),
  // ====== DUNGS CHUNG TRONG SERVICE ======

  /**
   * Lấy thông tin cơ bản của team để kiểm tra tồn tại/ownerId
   */
  getBasic: async (teamId: number) =>
    prisma.teams.findUnique({
      where: { id: teamId },
      select: { id: true, ownerId: true },
    }),
  
  getCategories: async (teamId: number) =>
    prisma.teams.findUnique({
      where: { id: teamId },
      select: { categories: true },
    }),
  /**
   * Đếm membership theo role
   */
  countMembershipByRoles: async (teamId: number, userId: number, roles: string[]) =>
    prisma.teamMembers.count({
      where: { teamId, userId, role: { in: roles as any } },
    }),

   
};
