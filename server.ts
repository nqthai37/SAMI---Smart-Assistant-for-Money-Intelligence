import express from 'express';
import type { Express } from 'express';
import authRoutes from './routes/authRoutes.js';

const app: Express = express();
const PORT: number = 8383;

// Initialize global temp storage for development mode
if (!((global as any).tempResetTokens)) {
    (global as any).tempResetTokens = new Map();
    console.log('🔧 Initialized tempResetTokens storage for development mode');
}

// Middleware
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Handle specific routes for password reset pages
app.get('/reset-password', (req, res) => {
    res.sendFile('reset-password.html', { root: 'public' });
});

app.get('/forgot-password', (req, res) => {
    res.sendFile('forgot-password.html', { root: 'public' });
});

app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: 'public' });
});

// API Routes
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error('🚨 Global error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Error handling for unhandled promises and exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));