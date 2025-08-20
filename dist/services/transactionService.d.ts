import type { Prisma } from '@prisma/client';
interface AddTransactionData {
    teamId: number;
    amount: number;
    type: string;
    categoryName: string;
    categoryIcon?: string;
    description?: string;
    transactionDate: Date;
}
export declare const addTransactionRecord: (transactionData: AddTransactionData, userId: number) => Promise<{
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
export declare const listTransactionsByTeam: (teamId: number, userId: number, options: {
    page: number;
    limit: number;
}) => Promise<{
    data: {
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
    }[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}>;
export declare const hasPermissionToChangeOtherTransaction: (teamId: number, userId: number) => Promise<boolean | null>;
export declare const hasPermissionToEdit: (transactionId: number, userId: number) => Promise<boolean | null>;
export declare const editTransactionItem: (transactionId: number, updates: Partial<AddTransactionData>, userId: number) => Promise<{
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
export declare const hasPermissionToDelete: (transactionId: number, userId: number) => Promise<boolean | null>;
export declare const deleteTransactionItem: (transactionId: number, userId: number) => Promise<boolean>;
export declare const requestEditOtherTransaction: (transactionId: number, userId: number, updates: Partial<AddTransactionData>) => Promise<{
    id: number;
    requesterId: number;
    targetTransactionId: number;
    type: string;
    status: import("@prisma/client").$Enums.change_request_status;
    reason: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare const requestDeleteOtherTransaction: (transactionId: number, userId: number) => Promise<{
    id: number;
    requesterId: number;
    targetTransactionId: number;
    type: string;
    status: import("@prisma/client").$Enums.change_request_status;
    reason: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare const confirmTransactionChange: (requestId: number, approverId: number, action: "approve" | "reject") => Promise<boolean>;
export {};
//# sourceMappingURL=transactionService.d.ts.map