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

interface InvitationData {
  inviteToken: string;
  teamId: number;
  inviterID: number;
  email: string;
  expiresAt: Date;
}

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

  findById: async (teamId: number) =>
    prisma.teams.findUnique({
      where: { id: teamId },
    }),
  
  findMemberByEmail: async (teamId: number, email: string) => {
    const userId = await UserModel.findByEmail(email);
    if (!userId) return null; // Nếu không tìm thấy người dùng theo email
    return prisma.teamMembers.findFirst({
      where: {
        teamId,
        userId: userId.id, 
      },
      select: {
        role: true,
      },
    });
  },

  //Tìm token mời, nếu có thì xét thời hạn, còn thời hạn thì trả về true, hết thời hạn thì trả về false để có thể mời tiếp
  findInviteByEmail: async (teamId: number, email: string) => {
    try {
      return await prisma.teamInvitations.findFirst({
        where: {
          teamId,
          inviteeEmail: email,
          status: 'pending',
          expiresAt: {
            gt: new Date() // Only get non-expired invitations
          }
        },
        select: {
          id: true,
          expiresAt: true
        }
      });
    } catch (error) {
      console.error('Error finding invitation:', error);
      throw new Error('Không thể kiểm tra lời mời.');
    }
  },

  saveInvitation: async (data: {
    inviteToken: string;
    teamId: number;
    inviterID: number;
    email: string;
    expiresAt: Date;
  }) => {
    try {
      return await prisma.teamInvitations.create({
        data: {
          token: data.inviteToken,
          teamId: data.teamId,
          inviterId: data.inviterID,
          inviteeEmail: data.email,
          status: 'pending',
          expiresAt: data.expiresAt
        }
      });
    } catch (error) {
      console.error('Error saving invitation:', error);
      throw new Error('Không thể lưu lời mời.');
    }
  },

  findInviteByToken: async (inviteToken: string, email: string) => {
    try {
      return await prisma.teamInvitations.findFirst({
        where: {
          token: inviteToken,
          inviteeEmail: email,
          status: 'pending',
          expiresAt: {
            gt: new Date() // Only get non-expired invitations
          }
        },
        select: {
          id: true,
          teamId: true,
          inviterId: true,
          inviteeEmail: true,
          expiresAt: true
        }
      });
    } catch (error) {
      console.error('Error finding invitation by token:', error);
      throw new Error('Không thể tìm lời mời theo token.');
    }
  },

  updateInvitationStatus: async (inviteId: number, status: 'accepted' | 'rejected' | 'expired') => {
    try {
      return await prisma.teamInvitations.update({
        where: { id: inviteId },
        data: {
          status,
        }
      });
    } catch (error) {
      console.error('Error updating invitation status:', error);
      throw new Error('Không thể cập nhật trạng thái lời mời.');
    }
  },

  addMember: async (teamId: number, userId: number, role: string) => {
    try {
      return await prisma.teamMembers.create({
        data: {
          teamId,
          userId,
          role,
        },
      });
    } catch (error) {
      console.error('Error adding member:', error);
      throw new Error('Không thể thêm thành viên vào nhóm.');
    }
  },

  getTransactions: async (teamId: number) => {
    try {
      return await prisma.transactions.findMany({
        where: { teamId },
      });
    } catch (error) {
      console.error('Error getting team balance:', error);
      throw new Error('Không thể lấy số dư của nhóm.');
    }
  },

  getDetails: async (teamId: number, userId: number) => {
    try {
      const team = await prisma.teams.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          teamName: true,
          budget: true,
          incomeGoal: true,
          currency: true,
          categories: true,
          allowMemberViewReport: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
        }
      });

      if (!team) {
        throw new Error('Team not found');
      }

      return team;
    } catch (error) {
      console.error('Error getting team details:', error);
      throw new Error('Không thể lấy thông tin team.');
    }
  }
};
