import { Prisma } from '@prisma/client';
export declare const getUserProfile: (userId: number) => Promise<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    dateOfBirth: Date | null;
} | null>;
export declare const updateUserProfile: (userId: number, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
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
} | null>;
export declare const showTeamList: (userId: number, options?: {
    page?: number;
    limit?: number;
}) => Promise<{
    data: {
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
export declare const changePassword: (userId: number, oldPassword: string, newPassword: string) => Promise<{
    success: boolean;
}>;
export declare const searchTeam: (query: string) => Promise<unknown[]>;
//# sourceMappingURL=userService.d.ts.map