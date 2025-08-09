const prisma = require('../lib/prisma')

class TransactionService {
  static async createTransaction(transactionData) {
    const { 
      userId, 
      teamId, 
      amount, 
      description, 
      category, 
      transactionType,
      transactionDate 
    } = transactionData
    
    // Verify user and team exist
    const [user, team] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(userId) } }),
      prisma.team.findUnique({ where: { id: parseInt(teamId) } })
    ])
    
    if (!user) {
      throw new Error('User not found')
    }
    if (!team) {
      throw new Error('Team not found')
    }

    return await prisma.transaction.create({
      data: {
        userId: parseInt(userId),
        teamId: parseInt(teamId),
        amount: parseFloat(amount),
        description: description || null,
        category: category || null,
        transactionType,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date()
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
  }

  static async getAllTransactions(filters = {}) {
    const { teamId, userId, type, limit = 50, startDate, endDate } = filters
    
    const where = {}
    if (teamId) where.teamId = parseInt(teamId)
    if (userId) where.userId = parseInt(userId)
    if (type) where.transactionType = type
    
    if (startDate || endDate) {
      where.transactionDate = {}
      if (startDate) where.transactionDate.gte = new Date(startDate)
      if (endDate) where.transactionDate.lte = new Date(endDate)
    }
    
    return await prisma.transaction.findMany({
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
  }

  static async getTransactionById(id) {
    return await prisma.transaction.findUnique({
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
  }

  static async updateTransaction(id, updateData) {
    const { amount, description, category, transactionType, transactionDate } = updateData

    const data = {}
    if (amount !== undefined) data.amount = parseFloat(amount)
    if (description !== undefined) data.description = description
    if (category !== undefined) data.category = category
    if (transactionType !== undefined) data.transactionType = transactionType
    if (transactionDate !== undefined) data.transactionDate = new Date(transactionDate)

    return await prisma.transaction.update({
      where: { id: parseInt(id) },
      data,
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
  }

  static async deleteTransaction(id) {
    return await prisma.transaction.delete({
      where: { id: parseInt(id) }
    })
  }

  static async getFinancialSummary(filters = {}) {
    const { teamId, userId, startDate, endDate } = filters
    
    const where = {}
    if (teamId) where.teamId = parseInt(teamId)
    if (userId) where.userId = parseInt(userId)
    if (startDate || endDate) {
      where.transactionDate = {}
      if (startDate) where.transactionDate.gte = new Date(startDate)
      if (endDate) where.transactionDate.lte = new Date(endDate)
    }
    
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        team: {
          select: {
            teamName: true,
            currency: true
          }
        }
      }
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
        acc[cat] = { income: 0, expense: 0, count: 0, transactions: [] }
      }
      
      if (t.transactionType === 'income') {
        acc[cat].income += Number(t.amount)
      } else {
        acc[cat].expense += Number(t.amount)
      }
      acc[cat].count += 1
      acc[cat].transactions.push({
        id: t.id,
        amount: Number(t.amount),
        description: t.description,
        date: t.transactionDate,
        team: t.team.teamName
      })
      
      return acc
    }, {})

    // Group by month
    const byMonth = transactions.reduce((acc, t) => {
      const month = t.transactionDate.toISOString().substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0, count: 0 }
      }
      
      if (t.transactionType === 'income') {
        acc[month].income += Number(t.amount)
      } else {
        acc[month].expense += Number(t.amount)
      }
      acc[month].count += 1
      
      return acc
    }, {})

    // Group by team
    const byTeam = transactions.reduce((acc, t) => {
      const teamName = t.team.teamName
      if (!acc[teamName]) {
        acc[teamName] = { income: 0, expense: 0, count: 0, currency: t.team.currency }
      }
      
      if (t.transactionType === 'income') {
        acc[teamName].income += Number(t.amount)
      } else {
        acc[teamName].expense += Number(t.amount)
      }
      acc[teamName].count += 1
      
      return acc
    }, {})
    
    return {
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length,
        avgTransactionAmount: transactions.length > 0 
          ? Math.round((totalIncome + totalExpense) / transactions.length * 100) / 100 
          : 0
      },
      breakdown: {
        byCategory,
        byMonth,
        byTeam
      },
      dateRange: {
        from: startDate || (transactions.length > 0 ? Math.min(...transactions.map(t => t.transactionDate)) : null),
        to: endDate || (transactions.length > 0 ? Math.max(...transactions.map(t => t.transactionDate)) : null)
      }
    }
  }

  static async getRecentTransactions(limit = 10) {
    return await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        team: {
          select: {
            teamName: true,
            currency: true
          }
        }
      },
      orderBy: { transactionDate: 'desc' },
      take: limit
    })
  }

  static async bulkCreateTransactions(transactionsData) {
    return await prisma.transaction.createMany({
      data: transactionsData.map(t => ({
        userId: parseInt(t.userId),
        teamId: parseInt(t.teamId),
        amount: parseFloat(t.amount),
        description: t.description || null,
        category: t.category || null,
        transactionType: t.transactionType,
        transactionDate: t.transactionDate ? new Date(t.transactionDate) : new Date()
      }))
    })
  }
}

module.exports = TransactionService
