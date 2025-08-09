const prisma = require('../lib/prisma')

class TeamService {
  static async createTeam(teamData) {
    const { teamName, ownerId, currency = 'USD', budget = 0, categories = ['General'] } = teamData
    
    // Verify owner exists
    const owner = await prisma.user.findUnique({
      where: { id: parseInt(ownerId) }
    })
    
    if (!owner) {
      throw new Error('Owner not found')
    }

    return await prisma.team.create({
      data: {
        teamName,
        ownerId: parseInt(ownerId),
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
  }

  static async getAllTeams() {
    return await prisma.team.findMany({
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
  }

  static async getTeamById(id) {
    return await prisma.team.findUnique({
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
  }

  static async getTeamFinancialSummary(teamId) {
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) },
      include: {
        transactions: true,
        owner: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    if (!team) {
      throw new Error('Team not found')
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
    const budgetUsagePercentage = Number(team.budget) > 0 
      ? (totalExpense / Number(team.budget)) * 100 
      : 0

    // Category breakdown
    const categoryBreakdown = transactions.reduce((acc, t) => {
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

    return {
      teamInfo: {
        id: team.id,
        teamName: team.teamName,
        owner: `${team.owner.firstName} ${team.owner.lastName}`,
        currency: team.currency,
        budget: Number(team.budget)
      },
      financial: {
        totalIncome,
        totalExpense,
        balance,
        budgetRemaining,
        budgetUsagePercentage: Math.round(budgetUsagePercentage * 100) / 100
      },
      statistics: {
        transactionCount: transactions.length,
        avgTransactionAmount: transactions.length > 0 
          ? Math.round((totalIncome + totalExpense) / transactions.length * 100) / 100 
          : 0,
        categoryBreakdown
      }
    }
  }

  static async updateTeam(id, updateData) {
    const { teamName, currency, budget, categories } = updateData

    const data = {}
    if (teamName !== undefined) data.teamName = teamName
    if (currency !== undefined) data.currency = currency
    if (budget !== undefined) data.budget = parseFloat(budget)
    if (categories !== undefined) data.categories = categories

    return await prisma.team.update({
      where: { id: parseInt(id) },
      data,
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
  }

  static async deleteTeam(id) {
    return await prisma.team.delete({
      where: { id: parseInt(id) }
    })
  }

  static async getTeamsByOwner(ownerId) {
    return await prisma.team.findMany({
      where: { ownerId: parseInt(ownerId) },
      include: {
        transactions: {
          select: {
            amount: true,
            transactionType: true
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
  }
}

module.exports = TeamService
