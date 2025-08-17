
    // File: server.ts
    import express from 'express';
    import type { Express } from 'express';
    import authRoutes from './routes/authRoutes.js';
    import teamRoutes from './routes/teamRoutes.js';
    import userRoutes from './routes/userRoute.js';
    import transactionRoutes from './routes/transactionRoutes.js';

    const app: Express = express();
    const PORT: number = 8383;

    // Middleware
    app.use(express.json());

    // Sử dụng các router đã import
    app.use('/api/auth', authRoutes);
    app.use('/api/teams', teamRoutes);

    app.use('/api/user', userRoutes);

    app.use('/api/transactions', transactionRoutes);
    app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));

