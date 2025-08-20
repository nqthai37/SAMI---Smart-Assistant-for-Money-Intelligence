// Email-related type definitions for SAMI
// Single unified email types file

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

// Email notification settings
export interface NotificationSettings {
  welcomeEmail: boolean;
  transactionAlerts: boolean;
  budgetWarnings: boolean;
  teamInvitations: boolean;
  passwordResets: boolean;
}

// Bulk email types
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

// Email template types
export type EmailTemplateType = 
  | 'welcome'
  | 'team-invitation'
  | 'transaction-alert'
  | 'budget-warning'
  | 'password-reset'
  | 'custom';

export interface EmailTemplate {
  type: EmailTemplateType;
  subject: string;
  htmlContent: string;
  variables: string[];
}

// SAMI specific email types
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

// Email service configuration
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

// Email queue types for advanced features
export interface EmailQueueItem {
  id: string;
  emailOptions: EmailOptions;
  priority: 'low' | 'normal' | 'high';
  scheduledTime?: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'sent' | 'failed';
}

// Email analytics types
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

// Error types
export interface EmailError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Export all types as a namespace for easier importing
export namespace EmailTypes {
  export type Options = EmailOptions;
  export type Result = EmailResult;
  export type Config = EmailConfig;
  export type TransactionData = TransactionEmailData;
  export type BudgetAlert = BudgetAlertData;
  export type TemplateData = EmailTemplateData;
  export type ServiceConfig = EmailServiceConfig;
  export type QueueItem = EmailQueueItem;
  export type Analytics = EmailAnalytics;
  export type Error = EmailError;
}
