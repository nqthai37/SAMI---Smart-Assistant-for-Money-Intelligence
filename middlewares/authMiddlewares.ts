import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mở rộng interface Request của Express để có thể chứa thuộc tính user
export interface AuthRequest extends Request {
    user?: { id: string | number }; // Hoặc định nghĩa rõ hơn type của user
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Lấy token từ header 'Authorization'
    const authHeader = req.headers.authorization;

    // 1. Kiểm tra xem header Authorization hoặc token có tồn tại không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Truy cập bị từ chối. Không tìm thấy token.' });
    }

    const token = authHeader.split(' ')[1] as string;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        // Ghi log lỗi để bạn biết và dừng ứng dụng một cách an toàn
        console.error("Lỗi nghiêm trọng: Biến môi trường JWT_SECRET chưa được thiết lập.");
        return res.status(500).json({ message: "Lỗi cấu hình máy chủ." });
    }

    try {
        // 2. Xác thực token
        const decoded = jwt.verify(token, jwtSecret as string);

        // 3. Gán thông tin người dùng đã giải mã vào request
        req.user = decoded as { id: string | number };

        // 4. Chuyển sang middleware hoặc controller tiếp theo
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ.' });
    }
};