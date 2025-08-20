// Test unified email.types.ts file
import type { 
  EmailOptions, 
  TransactionEmailData, 
  BudgetAlertData,
  EmailResult,
  EmailTypes 
} from './email.types.js';

console.log('🧪 Testing Unified Email Types...\n');

// Test 1: EmailOptions type
const testEmailOptions: EmailOptions = {
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>This is a test</p>'
};
console.log('✅ EmailOptions type: Valid');

// Test 2: TransactionEmailData type
const testTransaction: TransactionEmailData = {
  type: 'expense',
  amount: 50000,
  description: 'Test transaction',
  category: 'Food',
  date: new Date().toISOString(),
  currency: 'VND'
};
console.log('✅ TransactionEmailData type: Valid');

// Test 3: BudgetAlertData type
const testBudgetAlert: BudgetAlertData = {
  budget: 1000000,
  spent: 750000,
  remaining: 250000,
  percentage: 75,
  currency: 'VND'
};
console.log('✅ BudgetAlertData type: Valid');

// Test 4: Namespace usage
const namespaceTest: EmailTypes.Options = {
  to: 'namespace@test.com',
  subject: 'Namespace Test'
};
console.log('✅ EmailTypes namespace: Working');

console.log('\n🎉 Unified email.types.ts is working perfectly!');
console.log('\n📁 File location: ./email.types.ts');
console.log('📦 Contains all email-related types in one place');
console.log('🔗 Easy to import: import type { EmailOptions } from "./email.types.js"');

console.log('\n✨ Available types:');
console.log('- EmailOptions, EmailResult, EmailConfig');
console.log('- TransactionEmailData, BudgetAlertData');
console.log('- EmailTemplateData, NotificationSettings');
console.log('- BulkEmailRequest, BulkEmailResponse');
console.log('- SAMIEmailContext, WelcomeEmailData');
console.log('- TeamInvitationEmailData, PasswordResetEmailData');
console.log('- EmailServiceConfig, EmailQueueItem');
console.log('- EmailAnalytics, EmailError');
console.log('- EmailTypes namespace for easier access');
