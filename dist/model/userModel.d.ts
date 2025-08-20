import type { Prisma } from '@prisma/client';
export declare const UserModel: {
    findByUserID: (userId: number) => Promise<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        passwordHash: string;
        gender: string | null;
        created_at: Date | null;
        updated_at: Date | null;
        dateOfBirth: Date | null;
    } | null>;
    findByEmail: (email: string) => Promise<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        passwordHash: string;
        gender: string | null;
        created_at: Date | null;
        updated_at: Date | null;
        dateOfBirth: Date | null;
    } | null>;
    create: (userData: Prisma.UserCreateInput) => Promise<{
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        passwordHash: string;
        gender: string | null;
        created_at: Date | null;
        updated_at: Date | null;
        dateOfBirth: Date | null;
    }>;
};
//# sourceMappingURL=userModel.d.ts.map