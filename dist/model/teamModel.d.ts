import { Prisma } from '@prisma/client';
import type { teams as Team } from '@prisma/client';
export type TeamCreationData = {
    name: string;
    ownerId: number;
};
export declare const TeamModel: {
    /**
     * Tạo team + tự thêm owner vào teamMembers (role='owner')
     */
    create: (teamData: TeamCreationData) => Promise<Team>;
    /**
     * XÓA THẲNG team theo id (KHÔNG kiểm tra quyền ở đây).
     * ĐÃ GIẢ ĐỊNH các quan hệ con có onDelete: Cascade trong schema.
     * Luôn gọi qua service để đã check quyền trước.
     */
    removeRaw: (teamId: number) => Promise<void>;
    updateBudget: (teamId: number, amount: number) => Promise<{
        id: number;
        updatedAt: Date | null;
        budget: Prisma.Decimal | null;
    }>;
    updateIncomeGoal: (teamId: number, target: number) => Promise<{
        id: number;
        updatedAt: Date | null;
        incomeGoal: Prisma.Decimal | null;
    }>;
    updateCurrency: (teamId: number, currency: string) => Promise<{
        id: number;
        updatedAt: Date | null;
        currency: string;
    }>;
    updateCategories: (teamId: number, categories: Prisma.JsonValue) => Promise<{
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        teamName: string;
        ownerId: number;
        currency: string;
        budget: Prisma.Decimal | null;
        incomeGoal: Prisma.Decimal | null;
        allowMemberViewReport: boolean | null;
        categories: Prisma.JsonValue;
    }>;
    updateName: (teamId: number, newName: string) => Promise<{
        id: number;
        updatedAt: Date | null;
        teamName: string;
    }>;
    updateReportPermission: (teamId: number, allow: boolean) => Promise<{
        id: number;
        updatedAt: Date | null;
        allowMemberViewReport: boolean | null;
    }>;
    /**
     * Lấy thông tin cơ bản của team để kiểm tra tồn tại/ownerId
     */
    getBasic: (teamId: number) => Promise<{
        id: number;
        ownerId: number;
    } | null>;
    /**
     * Tìm một thành viên trong team.
     * Trả về record thành viên nếu tìm thấy, ngược lại trả về null.
     */
    findMember: (teamId: number, userId: number) => Promise<{
        userId: number;
        teamId: number;
        role: string | null;
        joinedAt: Date | null;
    } | null>;
    getCategories: (teamId: number) => Promise<{
        categories: Prisma.JsonValue;
    } | null>;
    /**
     * Đếm membership theo role
     */
    countMembershipByRoles: (teamId: number, userId: number, roles: string[]) => Promise<number>;
};
//# sourceMappingURL=teamModel.d.ts.map