// File: controllers/authController.ts

import type { Request, Response } from 'express';
import { AuthService } from '../service/authService.js';

const register = async (req: Request, res: Response) => {
    try {
        // Chỉ việc nhận yêu cầu và chuyển cho Service xử lý
        const newUser = await AuthService.register(req.body);

        // Nếu Service chạy thành công, gửi về response thành công
        return res.status(201).json({
            message: "Tài khoản đã được tạo thành công!",
            user: newUser,
        });

    } catch (error: any) {
        // Nếu Service có lỗi, Controller sẽ bắt lại và gửi response lỗi
        // Dùng statusCode và message mà Service đã định nghĩa
        return res.status(error.statusCode || 500).json({
            message: error.message || "Đã có lỗi không mong muốn xảy ra."
        });
    }
};

const login = async (req: Request, res: Response) => {
    // Tương tự, bạn sẽ tạo hàm login trong Service và gọi nó ở đây
    res.status(501).json({ message: "Chức năng đăng nhập chưa được cài đặt." });
};


export {
    register,
    login,
};
