import { Prisma } from '@prisma/client';
export declare const searchTeams: (userId: number, keyword: string) => Promise<({
    teamMembers: {
        userId: number;
        teamId: number;
        role: string | null;
        joinedAt: Date | null;
    }[];
} & {
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
})[]>;
export declare const getUserProfile: (userId: number) => Promise<any>;
export declare const updateUserProfile: (userId: number, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string | Date;
    gender?: string;
}) => Promise<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    dateOfBirth: Date | null;
    phoneNumber: string | null;
} | null>;
export declare const showTeamList: (userId: number, options?: {
    page?: number;
    limit?: number;
}) => Promise<{
    data: {
        id: number;
        teamName: string;
        currency: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        totalIncome: number;
        totalExpenses: number;
        balance: number;
        currentUserRole: string;
        currentUserMode: string;
        members: {
            length: number;
        };
    }[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}>;
export declare const getNotification: (userId?: number, options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}) => Promise<any[] | null>;
export declare const changePassword: (userIdentifier: {
    id: number;
}, // Nhận object chứa id từ token
oldPassword: string, newPassword: string) => Promise<{
    success: boolean;
}>;
export declare const searchTeam: (query: string) => Promise<unknown[]>;
//# sourceMappingURL=userService.d.ts.map