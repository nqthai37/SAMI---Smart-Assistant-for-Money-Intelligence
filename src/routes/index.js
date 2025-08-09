const express = require('express')
const router = express.Router()

// Import Prisma routes
const usersRoutes = require('./users')
const teamsRoutes = require('./teams')
const transactionsRoutes = require('./transactions')

// Use routes
router.use('/users', usersRoutes)
router.use('/teams', teamsRoutes)
router.use('/transactions', transactionsRoutes)

// API Documentation
router.get('/', (req, res) => {
  res.json({
    message: 'SAMI API with Prisma ORM',
    version: '2.0.0',
    orm: 'Prisma',
    endpoints: {
      users: {
        'GET /api/users': 'Get all users with their teams',
        'GET /api/users/:id': 'Get user by ID with teams and transactions',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user'
      },
      teams: {
        'GET /api/teams': 'Get all teams with owner and transaction count',
        'GET /api/teams/:id': 'Get team by ID with owner and transactions',
        'POST /api/teams': 'Create new team',
        'PUT /api/teams/:id': 'Update team',
        'DELETE /api/teams/:id': 'Delete team',
        'GET /api/teams/:id/summary': 'Get team financial summary'
      },
      transactions: {
        'GET /api/transactions': 'Get all transactions with filters',
        'GET /api/transactions/:id': 'Get transaction by ID',
        'POST /api/transactions': 'Create new transaction',
        'PUT /api/transactions/:id': 'Update transaction',
        'DELETE /api/transactions/:id': 'Delete transaction',
        'GET /api/transactions/summary/all': 'Get financial summary'
      }
    },
    features: [
      'Type-safe database operations with Prisma',
      'Automatic relationship handling',
      'Built-in validation and error handling',
      'Optimized queries with includes',
      'Foreign key constraint validation',
      'JSON support for categories',
      'Decimal precision for financial data'
    ]
  })
})

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SAMI API with Prisma is running',
    timestamp: new Date().toISOString(),
    orm: 'Prisma',
    database: 'PostgreSQL (Supabase)'
  })
})

module.exports = router
