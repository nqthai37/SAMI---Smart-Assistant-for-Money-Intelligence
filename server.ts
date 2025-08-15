
    // File: server.ts

    import express from 'express';
    import type { Express } from 'express';

    // SỬA ĐỔI: Thêm đuôi .js vào cuối đường dẫn import
    import authRoutes from './routes/authRoutes.js';
    import teamRoutes from './routes/teamRoutes.js';

    const app: Express = express();
    const PORT: number = 8383;

    // Middleware
    app.use(express.json());

    // Sử dụng các router đã import
    app.use('/api/auth', authRoutes);
    app.use('/api/teams', teamRoutes);

    app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));

