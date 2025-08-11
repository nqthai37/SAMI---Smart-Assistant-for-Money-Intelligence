import { Router } from 'express';
import type { Request, Response } from 'express';
import EmailService from '../service/emailService.js';
import type { 
  EmailOptions, 
  TransactionEmailData, 
  BudgetAlertData,
  EmailResult
} from '../email.types.js';

const router = Router();

// Basic email sending endpoint
router.post('/send', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, text, html, attachments }: EmailOptions = req.body;

    if (!to || !subject) {
      res.status(400).json({
        error: 'Missing required fields: to, subject'
      });
      return;
    }

    if (!text && !html) {
      res.status(400).json({
        error: 'Either text or html content must be provided'
      });
      return;
    }

    const emailOptions: any = {
      to,
      subject
    };
    
    if (text) emailOptions.text = text;
    if (html) emailOptions.html = html;
    if (attachments) emailOptions.attachments = attachments;

    const result = await EmailService.sendEmail(emailOptions);

    if (result.success) {
      res.status(200).json({
        message: 'Email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        error: result.error || 'Failed to send email'
      });
    }
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Welcome email endpoint
router.post('/welcome', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      res.status(400).json({
        error: 'Missing required fields: email, name'
      });
      return;
    }

    const result = await EmailService.sendWelcomeEmail(email, name);

    if (result.success) {
      res.status(200).json({
        message: 'Welcome email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        error: result.error || 'Failed to send welcome email'
      });
    }
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Team invitation email endpoint
router.post('/team-invitation', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, teamName, inviterName } = req.body;

    if (!email || !teamName || !inviterName) {
      res.status(400).json({
        error: 'Missing required fields: email, teamName, inviterName'
      });
      return;
    }

    const result = await EmailService.sendTeamInvitation(email, teamName, inviterName);

    if (result.success) {
      res.status(200).json({
        message: 'Team invitation email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        error: result.error || 'Failed to send team invitation email'
      });
    }
  } catch (error) {
    console.error('Team invitation email error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Transaction alert email endpoint
router.post('/transaction-alert', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, userName, transaction }: { 
      email: string; 
      userName: string; 
      transaction: TransactionEmailData 
    } = req.body;

    if (!email || !userName || !transaction) {
      res.status(400).json({
        error: 'Missing required fields: email, userName, transaction'
      });
      return;
    }

    // Validate transaction data
    if (!transaction.type || !transaction.amount || !transaction.description) {
      res.status(400).json({
        error: 'Invalid transaction data. Required: type, amount, description'
      });
      return;
    }

    const result = await EmailService.sendTransactionAlert(email, userName, transaction);

    if (result.success) {
      res.status(200).json({
        message: 'Transaction alert email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        error: result.error || 'Failed to send transaction alert email'
      });
    }
  } catch (error) {
    console.error('Transaction alert email error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Password reset email endpoint
router.post('/password-reset', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, resetToken } = req.body;

    if (!email || !resetToken) {
      res.status(400).json({
        error: 'Missing required fields: email, resetToken'
      });
      return;
    }

    const result = await EmailService.sendPasswordReset(email, resetToken);

    if (result.success) {
      res.status(200).json({
        message: 'Password reset email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        error: result.error || 'Failed to send password reset email'
      });
    }
  } catch (error) {
    console.error('Password reset email error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Budget alert email endpoint
router.post('/budget-alert', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, userName, teamName, budgetInfo }: {
      email: string;
      userName: string;
      teamName: string;
      budgetInfo: BudgetAlertData;
    } = req.body;

    if (!email || !userName || !teamName || !budgetInfo) {
      res.status(400).json({
        error: 'Missing required fields: email, userName, teamName, budgetInfo'
      });
      return;
    }

    // Validate budget info
    if (typeof budgetInfo.budget !== 'number' || 
        typeof budgetInfo.spent !== 'number' || 
        typeof budgetInfo.percentage !== 'number') {
      res.status(400).json({
        error: 'Invalid budgetInfo data. Required numeric fields: budget, spent, percentage'
      });
      return;
    }

    const result = await EmailService.sendBudgetAlert(email, userName, teamName, budgetInfo);

    if (result.success) {
      res.status(200).json({
        message: 'Budget alert email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        error: result.error || 'Failed to send budget alert email'
      });
    }
  } catch (error) {
    console.error('Budget alert email error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Bulk email sending endpoint
router.post('/bulk', async (req: Request, res: Response): Promise<void> => {
  try {
    const { emails }: { emails: EmailOptions[] } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      res.status(400).json({
        error: 'Missing or invalid emails array'
      });
      return;
    }

    // Validate each email
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      if (!email || !email.to || !email.subject || (!email.text && !email.html)) {
        res.status(400).json({
          error: `Invalid email at index ${i}. Required: to, subject, and either text or html`
        });
        return;
      }
    }

    const results = await EmailService.sendBulkEmails(emails);
    
    const successCount = results.filter((r: EmailResult) => r.success).length;
    const failureCount = results.length - successCount;

    res.status(200).json({
      message: 'Bulk email sending completed',
      total: results.length,
      successful: successCount,
      failed: failureCount,
      results: results
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Email service health check
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const isHealthy = await EmailService.verifyConnection();
    
    if (isHealthy) {
      res.status(200).json({
        status: 'healthy',
        message: 'Email service is operational'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        message: 'Email service is not available'
      });
    }
  } catch (error) {
    console.error('Email health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Email service health check failed'
    });
  }
});

export default router;
