# 📧 SAMI Email Service - TypeScript Implementation

## Overview
Hệ thống email service hoàn chỉnh với TypeScript để gửi thông báo tự động cho SAMI (Smart Assistant for Money Intelligence).

## Features
- ✅ **Type-safe email operations**
- ✅ **Welcome emails for new users**
- ✅ **Team invitation emails**
- ✅ **Transaction alerts**
- ✅ **Budget warnings**
- ✅ **Password reset emails**
- ✅ **Bulk email sending**
- ✅ **Professional HTML templates**
- ✅ **Error handling & validation**

## Setup Instructions

### 1. Environment Configuration
Tạo file `.env` với cấu hình email:

```env
# Gmail Configuration (Recommended)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
```

**Lưu ý:** Để sử dụng Gmail, bạn cần tạo "App Password":
1. Vào Google Account Settings
2. Security > 2-Step Verification
3. App passwords > Generate password
4. Sử dụng password này thay vì password thường

### 2. Install Dependencies
```bash
npm install nodemailer dotenv
npm install --save-dev @types/nodemailer typescript ts-node
```

### 3. Project Structure
```
src/
├── services/
│   └── EmailService.ts          # Main email service
├── routes/
│   └── email.ts                 # Email API endpoints
├── types/
│   └── email.types.ts           # TypeScript definitions
└── examples/
    └── emailExamples.ts         # Usage examples
```

## API Endpoints

### Basic Email Sending
```typescript
POST /api/email/send
{
  "to": "user@example.com",
  "subject": "Test Email",
  "html": "<h1>Hello World</h1>"
}
```

### Welcome Email
```typescript
POST /api/email/welcome
{
  "email": "newuser@example.com",
  "name": "John Doe"
}
```

### Team Invitation
```typescript
POST /api/email/team-invitation
{
  "email": "user@example.com",
  "teamName": "Finance Team",
  "inviterName": "Admin User"
}
```

### Transaction Alert
```typescript
POST /api/email/transaction-alert
{
  "email": "user@example.com",
  "userName": "John Doe",
  "transaction": {
    "type": "expense",
    "amount": 50000,
    "description": "Lunch expense",
    "category": "Food",
    "date": "2024-01-15T10:30:00Z",
    "currency": "VND"
  }
}
```

### Budget Alert
```typescript
POST /api/email/budget-alert
{
  "email": "user@example.com",
  "userName": "John Doe",
  "teamName": "Finance Team",
  "budgetInfo": {
    "budget": 1000000,
    "spent": 850000,
    "remaining": 150000,
    "percentage": 85,
    "currency": "VND"
  }
}
```

### Health Check
```typescript
GET /api/email/health
```

## Usage Examples

### Basic Integration
```typescript
import EmailService from './services/EmailService.js';

// Send welcome email
const result = await EmailService.sendWelcomeEmail(
  'user@example.com', 
  'John Doe'
);

if (result.success) {
  console.log('Email sent successfully!');
} else {
  console.error('Failed to send email:', result.error);
}
```

### With Express Routes
```typescript
import express from 'express';
import emailRoutes from './routes/email.js';

const app = express();
app.use(express.json());
app.use('/api/email', emailRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Transaction Integration
```typescript
// After creating a transaction
import { sendTransactionNotification } from './examples/emailExamples.js';

await sendTransactionNotification(
  'user@example.com',
  'John Doe',
  {
    type: 'expense',
    amount: 50000,
    description: 'Coffee purchase',
    category: 'Food & Drink',
    teamName: 'Personal Budget',
    currency: 'VND'
  }
);
```

## Email Templates

### Welcome Email Features
- 🎉 Welcoming message with user name
- 📋 Feature overview of SAMI
- 🔗 Direct link to dashboard
- 🎨 Professional branding

### Transaction Alert Features
- 💰 Transaction details (amount, type, category)
- 📊 Visual formatting based on income/expense
- 🔗 Link to view in dashboard
- 📅 Timestamp information

### Budget Alert Features
- ⚠️ Visual warning indicators
- 📈 Progress bar showing budget usage
- 💯 Percentage calculation
- 🚨 Different colors for different alert levels

## Error Handling

### Connection Verification
```typescript
const isHealthy = await EmailService.verifyConnection();
if (!isHealthy) {
  console.error('Email service is not available');
}
```

### Bulk Email Error Handling
```typescript
const results = await EmailService.sendBulkEmails(emails);
const failures = results.filter(r => !r.success);

if (failures.length > 0) {
  console.log(`${failures.length} emails failed to send`);
}
```

## TypeScript Benefits

### 1. Type Safety
```typescript
// Compile-time error if required fields are missing
const transaction: TransactionEmailData = {
  type: 'expense',
  amount: 50000,
  // description: missing - TypeScript error!
};
```

### 2. IntelliSense Support
- Auto-completion for all email methods
- Parameter suggestions
- Return type information

### 3. Refactoring Safety
- Rename operations across all files
- Find all references
- Safe code changes

## Configuration Options

### SMTP Alternative
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Custom Templates
Modify template methods in `EmailService.ts`:
- `generateWelcomeEmailTemplate()`
- `generateTransactionAlertTemplate()`
- `generateBudgetAlertTemplate()`

## Testing

### Manual Testing
```typescript
import { testEmailService } from './examples/emailExamples.js';

// Test connection
await testEmailService();

// Test welcome email
import EmailService from './services/EmailService.js';
const result = await EmailService.sendWelcomeEmail(
  'test@example.com', 
  'Test User'
);
console.log(result);
```

### Integration with SAMI

1. **User Registration**: Automatically send welcome email
2. **Transaction Creation**: Send transaction alerts to team members
3. **Budget Monitoring**: Automated budget warnings
4. **Team Management**: Invitation emails for new team members

## Next Steps

1. **Database Integration**: Store email logs and preferences
2. **Email Scheduling**: Queue system for delayed sending
3. **Template Management**: Dynamic template loading
4. **Analytics**: Email open rates and engagement tracking
5. **Internationalization**: Multi-language email templates

## Troubleshooting

### Common Issues

1. **Gmail Authentication Error**
   - Use App Password instead of regular password
   - Enable 2-factor authentication first

2. **Module Resolution Error**
   - Check TypeScript configuration
   - Ensure proper file extensions (.js for imports)

3. **Template Not Loading**
   - Verify environment variables
   - Check FRONTEND_URL configuration

### Support
For issues or questions, check the email service health endpoint or verify your SMTP configuration.
