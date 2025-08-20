// File: controllers/authController.ts
import { AuthService } from '../services/authService.js';
import jwt from 'jsonwebtoken';
const register = async (req, res) => {
    try {
        // Chỉ việc nhận yêu cầu và chuyển cho Service xử lý
        const newUser = await AuthService.register(req.body);
        // Nếu Service chạy thành công, gửi về response thành công
        return res.status(201).json({
            message: "Tài khoản đã được tạo thành công!",
            user: newUser,
        });
    }
    catch (error) {
        // Nếu Service có lỗi, Controller sẽ bắt lại và gửi response lỗi
        // Dùng statusCode và message mà Service đã định nghĩa
        return res.status(error.statusCode || 500).json({
            message: error.message || "Đã có lỗi không mong muốn xảy ra."
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
        }
        // Call login service
        const user = await AuthService.login(email, password);
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET chưa được thiết lập");
        }
        const token = jwt.sign({ id: user.id }, // payload
        jwtSecret, // secret key
        { expiresIn: '1h' } // tùy chỉnh thời gian sống
        );
        // If login is successful, return user data
        return res.status(200).json({
            message: "Đăng nhập thành công!",
            token,
            user,
        });
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Đã có lỗi không mong muốn xảy ra."
        });
    }
};
const logout = async (req, res) => {
    try {
        // Call logout service
        const result = await AuthService.logout();
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Đã có lỗi không mong muốn xảy ra."
        });
    }
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        // Validate input
        if (!email) {
            return res.status(400).json({ message: "Email là bắt buộc." });
        }
        const result = await AuthService.forgotPassword(email);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Đã có lỗi không mong muốn xảy ra."
        });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        // Validate input
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token và mật khẩu mới là bắt buộc." });
        }
        // Call reset password service
        const result = await AuthService.resetPassword(token, newPassword);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Đã có lỗi không mong muốn xảy ra."
        });
    }
};
export { register, login, logout, forgotPassword, resetPassword, };
//# sourceMappingURL=authController.js.map