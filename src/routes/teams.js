const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// GET /api/teams - Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            transactionType: true,
            transactionDate: true
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json(teams)
  } catch (err) {
    console.error('Get teams error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/teams/:id - Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        transactions: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { transactionDate: 'desc' }
        }
      }
    })
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    res.json(team)
  } catch (err) {
    console.error('Get team by ID error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/teams - Create new team
router.post('/', async (req, res) => {
  try {
    console.log('=== PRISMA TEAM CREATION ===')
    console.log('Request body:', JSON.stringify(req.body, null, 2))
    
    const { team_name, owner_id, currency = 'USD', budget = 0, categories = ['General'] } = req.body
    
    // Validate input
    if (!team_name || !owner_id) {
      return res.status(400).json({ 
        error: 'teamName and ownerId are required',
        received: { team_name, owner_id }
      })
    }

    // Verify owner exists
    const owner = await prisma.user.findUnique({
      where: { id: parseInt(owner_id) }
    })
    
    if (!owner) {
      return res.status(400).json({ error: 'Owner not found' })
    }

    console.log('Creating team with Prisma...')
    const team = await prisma.team.create({
      data: {
        teamName: team_name,
        ownerId: parseInt(owner_id),
        currency,
        budget: parseFloat(budget),
        categories
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    console.log('Team created successfully:', team)
    res.status(201).json(team)
  } catch (err) {
    console.error('Create team error:', err)
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/teams/:id - Update team
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { team_name, currency, budget, categories } = req.body

    const updateData = {}
    if (team_name !== undefined) updateData.teamName = team_name
    if (currency !== undefined) updateData.currency = currency
    if (budget !== undefined) updateData.budget = parseFloat(budget)
    if (categories !== undefined) updateData.categories = categories

    const team = await prisma.team.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    res.json(team)
  } catch (err) {
    console.error('Update team error:', err)
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/teams/:id - Delete team
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.team.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: 'Team deleted successfully' })
  } catch (err) {
    console.error('Delete team error:', err)
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    res.status(500).json({ error: err.message })
  }
})

// GET /api/teams/:id/summary - Get team financial summary
router.get('/:id/summary', async (req, res) => {
  try {
    const { id } = req.params
    
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id) },
      include: {
        transactions: true
      }
    })
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    const transactions = team.transactions
    const totalIncome = transactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const totalExpense = transactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const balance = totalIncome - totalExpense
    const budgetRemaining = Number(team.budget) - totalExpense
    
    res.json({
      teamId: team.id,
      teamName: team.teamName,
      currency: team.currency,
      budget: Number(team.budget),
      totalIncome,
      totalExpense,
      balance,
      budgetRemaining,
      transactionCount: transactions.length
    })
  } catch (err) {
    console.error('Get team summary error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
