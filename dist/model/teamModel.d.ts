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
    findById: (teamId: number) => Promise<{
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
    } | null>;
    findMemberByEmail: (teamId: number, email: string) => Promise<{
        role: string | null;
    } | null>;
    findInviteByEmail: (teamId: number, email: string) => Promise<{
        id: number;
        expiresAt: Date | null;
    } | null>;
    saveInvitation: (data: {
        inviteToken: string;
        teamId: number;
        inviterID: number;
        email: string;
        expiresAt: Date;
    }) => Promise<{
        token: string;
        id: number;
        status: import("@prisma/client").$Enums.invitation_status;
        createdAt: Date | null;
        teamId: number;
        expiresAt: Date | null;
        inviterId: number;
        inviteeEmail: string;
    }>;
    findInviteByToken: (inviteToken: string) => Promise<{
        id: number;
        teamId: number;
        expiresAt: Date | null;
        inviterId: number;
        inviteeEmail: string;
    } | null>;
    updateInvitationStatus: (inviteId: number, status: "accepted" | "rejected" | "expired") => Promise<{
        token: string;
        id: number;
        status: import("@prisma/client").$Enums.invitation_status;
        createdAt: Date | null;
        teamId: number;
        expiresAt: Date | null;
        inviterId: number;
        inviteeEmail: string;
    }>;
    addMember: (teamId: number, userId: number, role: string) => Promise<{
        userId: number;
        teamId: number;
        role: string | null;
        joinedAt: Date | null;
    }>;
    getTransactions: (teamId: number) => Promise<{
        id: number;
        type: import("@prisma/client").$Enums.transaction_type;
        createdAt: Date | null;
        updatedAt: Date | null;
        userId: number;
        teamId: number;
        amount: Prisma.Decimal;
        categoryName: string | null;
        categoryIcon: string | null;
        description: string | null;
        transactionDate: Date | null;
    }[]>;
    getDetails: (teamId: number, userId: number) => Promise<{
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        teamMembers: {
            User: {
                id: number;
                firstName: string;
                lastName: string;
                email: string;
            };
            role: string | null;
            joinedAt: Date | null;
        }[];
        teamName: string;
        ownerId: number;
        currency: string;
        budget: Prisma.Decimal | null;
        incomeGoal: Prisma.Decimal | null;
        allowMemberViewReport: boolean | null;
        categories: Prisma.JsonValue;
    }>;
    getMembership: (teamId: number, userId: number) => Promise<{
        role: string | null;
    } | null>;
    removeMember: (teamId: number, memberId: number) => Promise<Prisma.BatchPayload>;
    updateMemberRole: (teamId: number, memberId: number, newRole: string) => Promise<Prisma.BatchPayload>;
};
//# sourceMappingURL=teamModel.d.ts.map