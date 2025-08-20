import type { EmailOptions, EmailResult, TransactionEmailData, BudgetAlertData } from './email.types.js';
declare class EmailService {
    private transporter;
    private readonly fromAddress;
    constructor();
    private createTransporter;
    sendEmail(options: EmailOptions): Promise<EmailResult>;
    sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResult>;
    sendTeamInvitation(userEmail: string, teamName: string, inviterName: string): Promise<EmailResult>;
    sendTransactionAlert(userEmail: string, userName: string, transaction: TransactionEmailData): Promise<EmailResult>;
    sendPasswordReset(userEmail: string, resetToken: string): Promise<EmailResult>;
    sendBudgetAlert(userEmail: string, userName: string, teamName: string, budgetInfo: BudgetAlertData): Promise<EmailResult>;
    sendBulkEmails(emailList: EmailOptions[]): Promise<EmailResult[]>;
    verifyConnection(): Promise<boolean>;
    private generateWelcomeEmailTemplate;
    private generateTeamInvitationTemplate;
    private generateTransactionAlertTemplate;
    private generatePasswordResetTemplate;
    private generateBudgetAlertTemplate;
    private delay;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map