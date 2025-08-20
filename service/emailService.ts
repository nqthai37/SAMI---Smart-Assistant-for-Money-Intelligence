import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';
import { config } from 'dotenv';
import type {
  EmailOptions,
  EmailResult,
  EmailConfig,
  TransactionEmailData,
  BudgetAlertData,
  EmailTemplateData
} from './email.types.js';

config();

class EmailService {
  private transporter: Transporter;
  private readonly fromAddress: string;

  constructor() {
    this.fromAddress = `"SAMI - Smart Assistant" <${process.env.EMAIL_USER}>`;
    this.transporter = this.createTransporter();
  }

  private createTransporter(): Transporter {
    const emailConfig: EmailConfig = {
      service: 'gmail', // hoặc 'hotmail', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || ''
      }
    };

    // Alternative SMTP configuration
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASSWORD || ''
        }
      });
    }

    return nodemailer.createTransport(emailConfig);
  }

  public async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!options.to || !options.subject) {
        throw new Error('Missing required email fields: to, subject');
      }

      if (!options.text && !options.html) {
        throw new Error('Either text or html content must be provided');
      }

      const mailOptions: SendMailOptions = {
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  public async sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResult> {
    const htmlContent = this.generateWelcomeEmailTemplate({ userName });

    return await this.sendEmail({
      to: userEmail,
      subject: '🎉 Welcome to SAMI - Your Financial Journey Starts Here!',
      html: htmlContent
    });
  }

  public async sendTeamInvitation(
    userEmail: string, 
    teamName: string, 
    inviterName: string
  ): Promise<EmailResult> {
    const htmlContent = this.generateTeamInvitationTemplate({ teamName, inviterName });

    return await this.sendEmail({
      to: userEmail,
      subject: `🎯 You're invited to join "${teamName}" team on SAMI`,
      html: htmlContent
    });
  }

  public async sendTransactionAlert(
    userEmail: string, 
    userName: string, 
    transaction: TransactionEmailData
  ): Promise<EmailResult> {
    const htmlContent = this.generateTransactionAlertTemplate({ 
      userName, 
      transaction 
    });

    return await this.sendEmail({
      to: userEmail,
      subject: '💰 New Transaction Alert - SAMI',
      html: htmlContent
    });
  }

  public async sendPasswordReset(userEmail: string, resetToken: string): Promise<EmailResult> {
    const htmlContent = this.generatePasswordResetTemplate({ resetToken });

    return await this.sendEmail({
      to: userEmail,
      subject: '🔐 Password Reset Request - SAMI',
      html: htmlContent
    });
  }

  public async sendBudgetAlert(
    userEmail: string, 
    userName: string, 
    teamName: string, 
    budgetInfo: BudgetAlertData
  ): Promise<EmailResult> {
    const htmlContent = this.generateBudgetAlertTemplate({ 
      userName, 
      teamName, 
      budgetInfo 
    });

    return await this.sendEmail({
      to: userEmail,
      subject: `⚠️ Budget Alert for "${teamName}" - SAMI`,
      html: htmlContent
    });
  }

  public async sendBulkEmails(emailList: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    for (const emailOptions of emailList) {
      const result = await this.sendEmail(emailOptions);
      results.push(result);
      
      // Add small delay to avoid rate limiting
      await this.delay(100);
    }
    
    return results;
  }

  public async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  // Template generation methods
  private generateWelcomeEmailTemplate(data: EmailTemplateData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">Welcome to SAMI! 🏦</h1>
            <p style="color: #666; font-size: 16px;">Smart Assistant for Money Intelligence</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${data.userName}</strong>,</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Welcome to SAMI - your personal Smart Assistant for Money Intelligence! 
            We're excited to help you take control of your financial future.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #4CAF50; margin-top: 0;">🚀 What you can do with SAMI:</h3>
            <ul style="line-height: 1.8; color: #555;">
              <li>Create and manage financial teams</li>
              <li>Track income and expenses with precision</li>
              <li>Generate detailed financial reports</li>
              <li>Set budgets and receive smart alerts</li>
              <li>Collaborate with team members seamlessly</li>
              <li>Monitor spending by categories</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Get Started Now
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Best regards,<br>
            <strong>The SAMI Team</strong>
          </p>
        </div>
      </div>
    `;
  }

  private generateTeamInvitationTemplate(data: EmailTemplateData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">Team Invitation 👥</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hello there!</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>${data.inviterName}</strong> has invited you to join the team 
            <strong>"${data.teamName}"</strong> on SAMI.
          </p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50;">
            <h3 style="color: #2e7d32; margin-top: 0;">💼 About SAMI Teams:</h3>
            <ul style="line-height: 1.8; color: #555;">
              <li>Collaborate on financial planning</li>
              <li>Share expenses and track budgets together</li>
              <li>Real-time financial insights and reports</li>
              <li>Transparent money management</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/accept-invitation" 
               style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            This invitation was sent by ${data.inviterName}.<br>
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      </div>
    `;
  }

  private generateTransactionAlertTemplate(data: EmailTemplateData): string {
    const transaction = data.transaction!;
    const isIncome = transaction.type === 'income';
    const bgColor = isIncome ? '#e8f5e8' : '#fff3e0';
    const iconColor = isIncome ? '#4CAF50' : '#FF9800';
    const icon = isIncome ? '💰' : '💳';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${iconColor}; margin: 0;">Transaction Alert ${icon}</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${data.userName}</strong>,</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            A new ${transaction.type} transaction has been recorded in your team.
          </p>
          
          <div style="background: ${bgColor}; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: ${iconColor}; margin-top: 0;">📊 Transaction Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Type:</td><td style="text-transform: capitalize;">${transaction.type}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Amount:</td><td style="font-size: 18px; color: ${iconColor};">${transaction.currency} ${transaction.amount.toLocaleString()}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Description:</td><td>${transaction.description}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Category:</td><td>${transaction.category}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Date:</td><td>${new Date(transaction.date).toLocaleString()}</td></tr>
              ${transaction.teamName ? `<tr><td style="padding: 8px 0; font-weight: bold;">Team:</td><td>${transaction.teamName}</td></tr>` : ''}
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: ${iconColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View in Dashboard
            </a>
          </div>
        </div>
      </div>
    `;
  }

  private generatePasswordResetTemplate(data: EmailTemplateData): string {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${data.resetToken}`;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F44336; margin: 0;">Password Reset 🔐</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            You requested to reset your password for your SAMI account. 
            Click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #F44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FF9800;">
            <p style="margin: 0; color: #e65100;">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </p>
          
          <p style="color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            For security, you can also copy and paste this link into your browser:<br>
            <code style="background: #f5f5f5; padding: 5px; word-break: break-all;">${resetLink}</code>
          </p>
        </div>
      </div>
    `;
  }

  private generateBudgetAlertTemplate(data: EmailTemplateData): string {
    const budgetInfo = data.budgetInfo!;
    const isOverBudget = budgetInfo.percentage >= 100;
    const isNearLimit = budgetInfo.percentage >= 80;
    const alertColor = isOverBudget ? '#F44336' : isNearLimit ? '#FF9800' : '#4CAF50';
    const alertIcon = isOverBudget ? '🚨' : isNearLimit ? '⚠️' : '📊';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${alertColor}; margin: 0;">Budget Alert ${alertIcon}</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${data.userName}</strong>,</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Your team <strong>"${data.teamName}"</strong> has ${isOverBudget ? 'exceeded' : 'reached'} a budget threshold:
          </p>
          
          <div style="background: ${isOverBudget ? '#ffebee' : isNearLimit ? '#fff8e1' : '#e8f5e8'}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${alertColor};">
            <h3 style="color: ${alertColor}; margin-top: 0;">💰 Budget Status:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Budget:</td><td style="font-size: 18px;">${budgetInfo.currency} ${budgetInfo.budget.toLocaleString()}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Spent:</td><td style="font-size: 18px; color: ${alertColor};">${budgetInfo.currency} ${budgetInfo.spent.toLocaleString()}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Remaining:</td><td style="font-size: 18px;">${budgetInfo.currency} ${budgetInfo.remaining.toLocaleString()}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Usage:</td><td style="font-size: 20px; font-weight: bold; color: ${alertColor};">${budgetInfo.percentage.toFixed(1)}%</td></tr>
            </table>
            
            <div style="background: #eee; height: 20px; border-radius: 10px; margin: 15px 0; overflow: hidden;">
              <div style="background: ${alertColor}; height: 100%; width: ${Math.min(budgetInfo.percentage, 100)}%; border-radius: 10px; transition: width 0.3s ease;"></div>
            </div>
          </div>
          
          ${isOverBudget ? 
            `<div style="background: #ffcdd2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #c62828; font-weight: bold;">
                🚨 Your team has exceeded the budget! Consider reviewing expenses or adjusting the budget limit.
              </p>
            </div>` : 
            `<p style="color: #666;">Consider reviewing your spending patterns or adjusting your budget if needed.</p>`
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/teams/${data.teamName}" 
               style="background: ${alertColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Review Team Budget
            </a>
          </div>
        </div>
      </div>
    `;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new EmailService();
