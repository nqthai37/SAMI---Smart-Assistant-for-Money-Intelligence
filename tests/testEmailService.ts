// Alternative Email Service for development/testing

// Simple test email service without authentication
const createTestEmailService = () => {
  console.log('🧪 Using Test Email Service (No actual sending)');
  
  return {
    async sendEmail(options: any) {
      console.log('📧 [TEST EMAIL] Would send:', {
        to: options.to,
        subject: options.subject,
        htmlLength: options.html?.length || 0
      });
      
      return {
        success: true,
        messageId: 'test-' + Date.now(),
        message: 'Test email logged successfully'
      };
    },
    
    async sendWelcomeEmail(email: string, name: string) {
      console.log(`🎉 [WELCOME EMAIL] To: ${email}, Name: ${name}`);
      return { success: true, messageId: 'welcome-test-' + Date.now() };
    },
    
    async sendPasswordReset(email: string, token: string) {
      console.log(`🔐 [RESET EMAIL] To: ${email}, Token: ${token}`);
      return { success: true, messageId: 'reset-test-' + Date.now() };
    },
    
    async sendTransactionAlert(email: string, userName: string, transaction: any) {
      console.log(`💰 [TRANSACTION ALERT] To: ${email}, User: ${userName}, Amount: ${transaction.amount}`);
      return { success: true, messageId: 'transaction-test-' + Date.now() };
    },
    
    async sendBudgetAlert(email: string, userName: string, teamName: string, budgetInfo: any) {
      console.log(`⚠️ [BUDGET ALERT] To: ${email}, Team: ${teamName}, Usage: ${budgetInfo.percentage}%`);
      return { success: true, messageId: 'budget-test-' + Date.now() };
    },
    
    async sendTeamInvitation(email: string, teamName: string, inviterName: string) {
      console.log(`👥 [TEAM INVITE] To: ${email}, Team: ${teamName}, From: ${inviterName}`);
      return { success: true, messageId: 'invite-test-' + Date.now() };
    },
    
    async verifyConnection() {
      console.log('✅ Test email service always ready');
      return true;
    },
    
    async sendBulkEmails(emails: any[]) {
      console.log(`📨 [BULK EMAIL] Would send ${emails.length} emails`);
      return emails.map((_, index) => ({
        success: true,
        messageId: `bulk-test-${index}-${Date.now()}`
      }));
    }
  };
};

export default createTestEmailService();
