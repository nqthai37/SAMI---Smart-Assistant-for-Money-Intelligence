interface RegisterUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export declare const AuthService: {
    register: (userData: RegisterUserData) => Promise<any>;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword: (email: string) => Promise<{
        success: boolean;
        message: string;
        resetToken?: never;
        resetLink?: never;
    } | {
        success: boolean;
        message: string;
        resetToken: string;
        resetLink: string;
    }>;
    resetPassword: (token: string, newPassword: string) => Promise<{
        success: boolean;
        message: string;
    }>;
};
export declare const EnhancedAuthService: {
    register: (userData: RegisterUserData) => Promise<any>;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword: (email: string) => Promise<{
        success: boolean;
        message: string;
        resetToken?: never;
        resetLink?: never;
    } | {
        success: boolean;
        message: string;
        resetToken: string;
        resetLink: string;
    }>;
    resetPassword: (token: string, newPassword: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    sendTransactionNotification: (userEmail: string, userName: string, transactionData: {
        type: "income" | "expense";
        amount: number;
        description: string;
        category: string;
        teamName?: string;
        currency?: string;
    }) => Promise<{
        success: boolean;
        messageId: string | undefined;
        error?: never;
    } | {
        success: boolean;
        error: string | undefined;
        messageId?: never;
    }>;
    sendBudgetAlert: (userEmail: string, userName: string, teamName: string, budgetData: {
        budget: number;
        spent: number;
        currency?: string;
    }) => Promise<{
        success: boolean;
        messageId: string | undefined;
        error?: never;
    } | {
        success: boolean;
        error: string | undefined;
        messageId?: never;
    }>;
};
export {};
//# sourceMappingURL=authService.d.ts.map