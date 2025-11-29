export declare const TeamService: {
    createNewTeam: (teamData: {
        name: string;
        ownerId: number;
    }) => Promise<{
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        teamName: string;
        ownerId: number;
        currency: string;
        budget: import("@prisma/client/runtime/library").Decimal | null;
        incomeGoal: import("@prisma/client/runtime/library").Decimal | null;
        allowMemberViewReport: boolean | null;
        categories: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteTeam: (teamId: number, userId: number) => Promise<void>;
    setBudgetAmount: (teamId: number, userId: number, amount: number) => Promise<{
        id: number;
        updatedAt: Date | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    setIncomeTarget: (teamId: number, userId: number, target: number) => Promise<{
        id: number;
        updatedAt: Date | null;
        incomeGoal: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    setPreferredCurrency: (teamId: number, userId: number, currency: string) => Promise<{
        id: number;
        updatedAt: Date | null;
        currency: string;
    }>;
    setFinanceCategories: (teamId: number, userId: number, newCategory: {
        name: string;
        icon: string;
    }[]) => Promise<{
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        teamName: string;
        ownerId: number;
        currency: string;
        budget: import("@prisma/client/runtime/library").Decimal | null;
        incomeGoal: import("@prisma/client/runtime/library").Decimal | null;
        allowMemberViewReport: boolean | null;
        categories: import("@prisma/client/runtime/library").JsonValue;
    }>;
    renameWorkspaceName: (teamId: number, userId: number, newName: string) => Promise<{
        id: number;
        updatedAt: Date | null;
        teamName: string;
    }>;
    permitReportAccess: (teamId: number, userId: number, allow: boolean) => Promise<{
        id: number;
        updatedAt: Date | null;
        allowMemberViewReport: boolean | null;
    }>;
    sendInviteEmail: (teamId: number, email: string, inviterID: number) => Promise<{
        success: boolean;
        message: string;
    }>;
    handleInviteResponse: (inviteToken: string, email: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    getTeamDetails: (teamId: number, userId: number) => Promise<{
        balance: number;
        budgetProgress: string;
        incomeProgress: string;
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
        budget: import("@prisma/client/runtime/library").Decimal | null;
        incomeGoal: import("@prisma/client/runtime/library").Decimal | null;
        allowMemberViewReport: boolean | null;
        categories: import("@prisma/client/runtime/library").JsonValue;
    }>;
    removeMember: (teamId: number, memberId: number, userId: number) => Promise<import("@prisma/client").Prisma.BatchPayload>;
    changeMemberRole: (teamId: number, memberId: number, userId: number, newRole: string) => Promise<import("@prisma/client").Prisma.BatchPayload>;
};
//# sourceMappingURL=teamService.d.ts.map