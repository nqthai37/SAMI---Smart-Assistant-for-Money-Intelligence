# 🔐 Password Reset Guide - SAMI

Hướng dẫn sử dụng chức năng reset mật khẩu trong SAMI (Smart Assistant for Money Intelligence).

## 📋 Tổng quan

Chức năng reset mật khẩu cho phép người dùng khôi phục tài khoản khi quên mật khẩu thông qua email.

### ✨ Tính năng

- 🔒 **Bảo mật cao**: Token có thời hạn 1 giờ và chỉ sử dụng được 1 lần
- 📧 **Email template đẹp**: HTML email với design chuyên nghiệp
- 🛡️ **Validation**: Kiểm tra đầy đủ các input và điều kiện
- 🔄 **Development mode**: Support cho testing dễ dàng
- 📱 **Responsive**: Interface thân thiện với người dùng

## 🚀 API Endpoints

### 1. Forgot Password - Yêu cầu reset

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (Development mode):**
```json
{
  "success": true,
  "message": "Email khôi phục mật khẩu đã được gửi (development mode).",
  "resetToken": "abc123def456...",
  "resetLink": "http://localhost:3000/reset-password?token=abc123def456..."
}
```

**Response (Production mode):**
```json
{
  "success": true,
  "message": "Email khôi phục mật khẩu đã được gửi."
}
```

### 2. Reset Password - Đổi mật khẩu

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "abc123def456...",
  "newPassword": "mynewpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mật khẩu đã được cập nhật thành công."
}
```

## 🗃️ Database Schema

```sql
-- Bảng password_resets
CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 🛠️ Cách sử dụng

### Backend Integration

```typescript
import { AuthService } from './service/authService.js';

// Yêu cầu reset password
const result = await AuthService.forgotPassword('user@example.com');

// Reset password với token
const resetResult = await AuthService.resetPassword('token123', 'newpassword');
```

### Frontend Integration

```javascript
// Gửi yêu cầu reset
const response = await fetch('/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// Reset password
const resetResponse = await fetch('/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    token: 'abc123...', 
    newPassword: 'newpass123' 
  })
});
```

## 🧪 Testing

### 1. Chạy test script

```bash
node test-password-reset.js
```

### 2. Sử dụng demo page

Mở file `public/reset-password-demo.html` trong browser để test qua giao diện.

### 3. Test cases

- ✅ Email hợp lệ → Nhận token reset
- ✅ Token hợp lệ + password mới → Reset thành công  
- ❌ Token đã sử dụng → Lỗi validation
- ❌ Token hết hạn → Lỗi validation
- ❌ Password ngắn hơn 6 ký tự → Lỗi validation

## ⚙️ Configuration

### Environment Variables

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SEND_REAL_EMAILS=false  # true for production

# Frontend URL for reset links
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...
```

### Development vs Production

**Development Mode (`SEND_REAL_EMAILS=false`):**
- Token được return trong API response
- Log reset link ra console
- Không gửi email thật

**Production Mode (`SEND_REAL_EMAILS=true`):**
- Gửi email thật với token
- Không return token trong response
- Security tối ưu

## 🎨 Email Template

Email reset sử dụng template HTML đẹp với:

- 🎨 **Design hiện đại**: Gradient, shadows, responsive
- 🔗 **Button reset rõ ràng**: Call-to-action nổi bật
- ⚠️ **Warning về thời hạn**: Thông báo token hết hạn sau 1h
- 🔒 **Thông tin bảo mật**: Hướng dẫn nếu không yêu cầu reset

## 🔐 Security Features

1. **Token hết hạn**: Tự động expire sau 1 giờ
2. **One-time use**: Token chỉ dùng được 1 lần
3. **Auto deactivate**: Vô hiệu hóa token cũ khi tạo mới
4. **No email leak**: Không tiết lộ email có tồn tại hay không
5. **Strong token**: 32 bytes random, hex encoded

## 🚨 Error Handling

### Common Errors

| Error | Code | Description |
|-------|------|-------------|
| Email required | 400 | Thiếu email trong request |
| Token required | 400 | Thiếu token hoặc password |
| Password too short | 400 | Password < 6 ký tự |
| Invalid token | 400 | Token không tồn tại/hết hạn/đã dùng |
| Email send failed | 500 | Lỗi gửi email |
| Database error | 500 | Lỗi database |

## 📝 Maintenance

### Cleanup expired tokens

```sql
-- Xóa token đã hết hạn (chạy định kỳ)
DELETE FROM password_resets 
WHERE expires_at < NOW() OR used = true;
```

### Monitor usage

```sql
-- Thống kê reset password
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN used THEN 1 END) as successful_resets
FROM password_resets 
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🔗 Related Files

- `service/authService.ts` - Business logic
- `controller/authController.ts` - API controllers  
- `routes/authRoutes.ts` - Route definitions
- `service/emailService.ts` - Email templates
- `prisma/schema.prisma` - Database schema
- `public/reset-password-demo.html` - Demo interface
- `test-password-reset.js` - Test script

## 📞 Support

Nếu có vấn đề, hãy kiểm tra:

1. ✅ Server đang chạy trên port đúng
2. ✅ Database connection hoạt động
3. ✅ Environment variables được config đúng
4. ✅ Email service hoạt động (nếu production mode)
5. ✅ Prisma client đã được generate

---

*Phát triển bởi SAMI Team 🚀*
