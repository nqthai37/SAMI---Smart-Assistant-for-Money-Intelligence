# SAMI - Smart Assistant for Money Intelligence

## 📁 Project Structure

```
SAMI/
├── 📂 controller/           # API Controllers
│   └── authController.ts    # Authentication endpoints
├── 📂 docs/                 # Documentation
├── 📂 lib/                  # Database and utility libraries
│   └── prisma.ts           # Prisma client configuration
├── 📂 model/               # Data models
│   └── userModel.ts        # User data model
├── 📂 prisma/              # Database schema and migrations
│   └── schema.prisma       # Database schema
├── 📂 public/              # Static frontend files
│   ├── forgot-password.html
│   ├── reset-password.html
│   ├── login.html
│   └── index.html
├── 📂 routes/              # API Routes
│   └── authRoutes.ts       # Authentication routes
├── 📂 service/             # Business logic
│   ├── authService.ts      # Authentication service
│   ├── emailService.ts     # Email service
│   └── email.types.ts      # Email type definitions
├── 📂 scripts/             # Setup and migration scripts
├── 📂 tests/               # Test files and debug utilities
├── 📄 server.ts            # Main server file
├── 📄 package.json         # Dependencies and scripts
├── 📄 tsconfig.json        # TypeScript configuration
└── 📄 .env                 # Environment variables
```

## 🚀 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run build` - Build TypeScript files
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 🔧 Features

- ✅ User Authentication (Register/Login)
- ✅ Password Reset via Email
- ✅ Static File Serving
- ✅ Database Integration (PostgreSQL + Prisma)
- ✅ Email Service (Nodemailer)
- ✅ TypeScript Support
- ✅ Environment Configuration

## 🌐 Endpoints

- `GET /` - Main application
- `GET /login` - Login page
- `GET /forgot-password` - Forgot password page
- `GET /reset-password` - Reset password page
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

## 🏃‍♂️ Quick Start

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Generate Prisma client: `npm run prisma:generate`
4. Start development server: `npm run dev`
5. Open browser: `http://localhost:8383`
