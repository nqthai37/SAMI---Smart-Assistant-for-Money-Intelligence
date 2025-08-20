# 🔐 HƯỚNG DẪN CHI TIẾT TẠO APP PASSWORD

## Các bước thực hiện:

### 1. Truy cập Google Account
- Vào: https://myaccount.google.com
- Đăng nhập: alertsnoreply.sami@gmail.com

### 2. Vào mục Bảo mật
- Menu bên trái → "Bảo mật" (Security)

### 3. Bật xác minh 2 bước (nếu chưa có)
- Tìm "Xác minh 2 bước" → Nhấp "Bắt đầu"
- Làm theo hướng dẫn (thường dùng số điện thoại)

### 4. Tạo mật khẩu ứng dụng
- Tìm "Mật khẩu ứng dụng" (App passwords)
- Nhấp "Chọn ứng dụng" → "Mail" (Thư)
- Nhấp "Chọn thiết bị" → "Khác (Tên tùy chỉnh)"
- Nhập: "SAMI Email Service"
- Nhấp "Tạo" (Generate)

### 5. Sao chép mật khẩu
```
Gmail hiển thị: abcd efgh ijkl mnop
Bạn sao chép: abcdefghijklmnop (BỎ HẾT DẤU CÁCH)
```

### 6. Cập nhật file .env
```env
EMAIL_PASSWORD="abcdefghijklmnop"
```

## ⚠️ LƯU Ý QUAN TRỌNG:
- Mật khẩu 16 ký tự KHÔNG có dấu cách
- Chỉ hiển thị 1 lần, phải sao chép ngay
- KHÔNG dùng mật khẩu đăng nhập Gmail thường
- Có thể thu hồi và tạo lại bất kỳ lúc nào

## 🧪 Test sau khi cập nhật:
```bash
npx tsx test-app-password.ts
```
