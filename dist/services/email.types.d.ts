export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        encoding?: string;
    }>;
}
export interface EmailResult {
    success: boolean;
    messageId?: string;
    message?: string;
    error?: string;
}
export interface EmailConfig {
    service?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    auth: {
        user: string;
        pass: string;
    };
}
export interface TransactionEmailData {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: string;
    date: string;
    currency: string;
    teamName?: string;
}
export interface BudgetAlertData {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
    currency: string;
}
export interface EmailTemplateData {
    userName?: string;
    teamName?: string;
    inviterName?: string;
    transaction?: TransactionEmailData;
    budgetInfo?: BudgetAlertData;
    resetToken?: string;
}
export interface NotificationSettings {
    welcomeEmail: boolean;
    transactionAlerts: boolean;
    budgetWarnings: boolean;
    teamInvitations: boolean;
    passwordResets: boolean;
}
export interface BulkEmailRequest {
    emails: EmailOptions[];
    delayBetweenEmails?: number;
}
export interface BulkEmailResponse {
    total: number;
    successful: number;
    failed: number;
    results: EmailResult[];
}
export type EmailTemplateType = 'welcome' | 'team-invitation' | 'transaction-alert' | 'budget-warning' | 'password-reset' | 'custom';
export interface EmailTemplate {
    type: EmailTemplateType;
    subject: string;
    htmlContent: string;
    variables: string[];
}
export interface SAMIEmailContext {
    userEmail: string;
    userName: string;
    teamName?: string;
    teamId?: string;
    userId?: string;
}
export interface WelcomeEmailData extends SAMIEmailContext {
    registrationDate: string;
    frontendUrl: string;
}
export interface TeamInvitationEmailData extends SAMIEmailContext {
    inviterName: string;
    inviterEmail: string;
    teamDescription?: string;
    invitationLink: string;
}
export interface PasswordResetEmailData extends SAMIEmailContext {
    resetToken: string;
    resetLink: string;
    expirationTime: string;
}
export interface EmailServiceConfig {
    provider: 'gmail' | 'smtp' | 'sendgrid' | 'mailgun';
    fromAddress: string;
    fromName: string;
    replyTo?: string;
    credentials: {
        user: string;
        password: string;
    };
    smtp?: {
        host: string;
        port: number;
        secure: boolean;
    };
}
export interface EmailQueueItem {
    id: string;
    emailOptions: EmailOptions;
    priority: 'low' | 'normal' | 'high';
    scheduledTime?: Date;
    retryCount: number;
    maxRetries: number;
    status: 'pending' | 'processing' | 'sent' | 'failed';
}
export interface EmailAnalytics {
    emailId: string;
    sent: boolean;
    sentTime?: Date;
    delivered?: boolean;
    deliveredTime?: Date;
    opened?: boolean;
    openedTime?: Date;
    clicked?: boolean;
    clickedTime?: Date;
    bounced?: boolean;
    bounceReason?: string;
}
export interface EmailError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
}
export declare namespace EmailTypes {
    type Options = EmailOptions;
    type Result = EmailResult;
    type Config = EmailConfig;
    type TransactionData = TransactionEmailData;
    type BudgetAlert = BudgetAlertData;
    type TemplateData = EmailTemplateData;
    type ServiceConfig = EmailServiceConfig;
    type QueueItem = EmailQueueItem;
    type Analytics = EmailAnalytics;
    type Error = EmailError;
}
//# sourceMappingURL=email.types.d.ts.map