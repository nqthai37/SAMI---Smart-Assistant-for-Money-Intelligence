// File: server.ts
import express from 'express';
import cors from 'cors'; // 1. Import cors
import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import userRoutes from './routes/userRoute.js';
import transactionRoutes from './routes/transactionRoutes.js';
const app = express();
const PORT = 8383;
// Initialize global temp storage for development mode
if (!(global.tempResetTokens)) {
    global.tempResetTokens = new Map();
    console.log('🔧 Initialized tempResetTokens storage for development mode');
}
// Middleware
// 2. Sử dụng middleware cors trước tất cả các routes
// Cấu hình này cho phép request từ origin của frontend (localhost:3000)
app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(express.json());
// Sử dụng các router đã import
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
//# sourceMappingURL=server.js.map