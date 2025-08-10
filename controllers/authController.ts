// File: controllers/authController.ts

import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

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
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
        }

        // Call login service
        const user = await AuthService.login(email, password);

        // If login is successful, return user data
        return res.status(200).json({
            message: "Đăng nhập thành công!",
            user,
        });

    } catch (error: any) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Đã có lỗi không mong muốn xảy ra."
        });
    }
};


// const forgotPassword = async (req: Request, res: Response) => {
//     try {
//         const { email } = req.body;

//         // Validate input
//         if (!email) {
//             return res.status(400).json({ message: "Email là bắt buộc." });
//         }

//         // Call forgot password service
//         await AuthService.forgotPassword(email);

//         return res.status(200).json({
//             message: "Đã gửi email khôi phục mật khẩu."
//         });

//     } catch (error: any) {
//         return res.status(error.statusCode || 500).json({
//             message: error.message || "Đã có lỗi không mong muốn xảy ra."
//         });
//     }
// };

export {
    register,
    login,
    // forgotPassword,
};


