const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// GET /api/transactions - Get all transactions
router.get('/', async (req, res) => {
  try {
    const { team_id, user_id, type, limit = 50 } = req.query
    
    const where = {}
    if (team_id) where.teamId = parseInt(team_id)
    if (user_id) where.userId = parseInt(user_id)
    if (type) where.transactionType = type
    
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        team: {
          select: {
            id: true,
            teamName: true,
            currency: true
          }
        }
      },
      orderBy: { transactionDate: 'desc' },
      take: parseInt(limit)
    })
    
    res.json(transactions)
  } catch (err) {
    console.error('Get transactions error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        team: {
          select: {
            id: true,
            teamName: true,
            currency: true
          }
        }
      }
    })
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    
    res.json(transaction)
  } catch (err) {
    console.error('Get transaction by ID error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/transactions - Create new transaction
router.post('/', async (req, res) => {
  try {
    console.log('=== PRISMA TRANSACTION CREATION ===')
    console.log('Request body:', JSON.stringify(req.body, null, 2))
    
    const { 
      user_id, 
      team_id, 
      amount, 
      description, 
      category, 
      transaction_type,
      transaction_date 
    } = req.body
    
    // Validate required fields
    if (!user_id || !team_id || !amount || !transaction_type) {
      return res.status(400).json({ 
        error: 'userId, teamId, amount, and transactionType are required',
        received: { user_id, team_id, amount, transaction_type }
      })
    }

    // Verify user and team exist
    const [user, team] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(user_id) } }),
      prisma.team.findUnique({ where: { id: parseInt(team_id) } })
    ])
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' })
    }
    if (!team) {
      return res.status(400).json({ error: 'Team not found' })
    }

    console.log('Creating transaction with Prisma...')
    const transaction = await prisma.transaction.create({
      data: {
        userId: parseInt(user_id),
        teamId: parseInt(team_id),
        amount: parseFloat(amount),
        description: description || null,
        category: category || null,
        transactionType: transaction_type,
        transactionDate: transaction_date ? new Date(transaction_date) : new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        team: {
          select: {
            id: true,
            teamName: true,
            currency: true
          }
        }
      }
    })
    
    console.log('Transaction created successfully:', transaction)
    res.status(201).json(transaction)
  } catch (err) {
    console.error('Create transaction error:', err)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/transactions/:id - Update transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { amount, description, category, transaction_type, transaction_date } = req.body

    const updateData = {}
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (transaction_type !== undefined) updateData.transactionType = transaction_type
    if (transaction_date !== undefined) updateData.transactionDate = new Date(transaction_date)

    const transaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        team: {
          select: {
            id: true,
            teamName: true,
            currency: true
          }
        }
      }
    })

    res.json(transaction)
  } catch (err) {
    console.error('Update transaction error:', err)
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.transaction.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: 'Transaction deleted successfully' })
  } catch (err) {
    console.error('Delete transaction error:', err)
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Transaction not found' })
    }
    
    res.status(500).json({ error: err.message })
  }
})

// GET /api/transactions/summary - Get financial summary
router.get('/summary/all', async (req, res) => {
  try {
    const { team_id, user_id, start_date, end_date } = req.query
    
    const where = {}
    if (team_id) where.teamId = parseInt(team_id)
    if (user_id) where.userId = parseInt(user_id)
    if (start_date || end_date) {
      where.transactionDate = {}
      if (start_date) where.transactionDate.gte = new Date(start_date)
      if (end_date) where.transactionDate.lte = new Date(end_date)
    }
    
    const transactions = await prisma.transaction.findMany({
      where
    })
    
    const totalIncome = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const totalExpense = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const balance = totalIncome - totalExpense
    
    // Group by category
    const byCategory = transactions.reduce((acc, t) => {
      const cat = t.category || 'Uncategorized'
      if (!acc[cat]) {
        acc[cat] = { income: 0, expense: 0, count: 0 }
      }
      
      if (t.transactionType === 'income') {
        acc[cat].income += Number(t.amount)
      } else {
        acc[cat].expense += Number(t.amount)
      }
      acc[cat].count += 1
      
      return acc
    }, {})
    
    res.json({
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      byCategory
    })
  } catch (err) {
    console.error('Get transaction summary error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
