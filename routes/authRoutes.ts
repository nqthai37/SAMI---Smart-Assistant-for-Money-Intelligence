// File: routes/authRoutes.ts

import { Router } from 'express';

// SỬA ĐỔI: Dùng import từ cú pháp ES Modules
// Thêm đuôi .js vào cuối đường dẫn
import * as AuthController from '../controller/authController.js';

const router = Router();

// Gọi đến các hàm thông qua đối tượng đã import
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);

// Dùng export default là đúng chuẩn ES Module
export default router;