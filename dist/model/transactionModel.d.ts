import type { Prisma } from '@prisma/client';
export declare const TransactionModel: {
    create: (transactionData: Prisma.transactionsCreateInput) => Promise<{
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
    }>;
    findById: (id: number) => Promise<{
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
    } | null>;
    update: (id: number, updates: Prisma.transactionsUpdateInput) => Promise<{
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
    }>;
    remove: (id: number) => Promise<{
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
    }>;
    createChangeRequest: (data: Prisma.changeRequestsCreateInput) => Promise<{
        id: number;
        requesterId: number;
        targetTransactionId: number;
        type: string;
        status: import("@prisma/client").$Enums.change_request_status;
        reason: string;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    findChangeRequestById: (id: number) => Promise<{
        id: number;
        requesterId: number;
        targetTransactionId: number;
        type: string;
        status: import("@prisma/client").$Enums.change_request_status;
        reason: string;
        createdAt: Date | null;
        updatedAt: Date | null;
    } | null>;
    updateChangeRequestStatus: (id: number, status: "pending" | "approved" | "rejected") => Promise<{
        id: number;
        requesterId: number;
        targetTransactionId: number;
        type: string;
        status: import("@prisma/client").$Enums.change_request_status;
        reason: string;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
};
//# sourceMappingURL=transactionModel.d.ts.map