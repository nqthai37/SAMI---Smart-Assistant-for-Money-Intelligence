const prisma = require('../lib/prisma')

class UserService {
  // Basic CRUD operations
  static async createUser(userData) {
    const { firstName, lastName, email, passwordHash, gender } = userData
    
    return await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        gender
      }
    })
  }

  static async getUserById(id) {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        ownedTeams: true,
        transactions: {
          include: {
            team: {
              select: {
                teamName: true
              }
            }
          }
        }
      }
    })
  }

  static async getAllUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ownedTeams: {
          select: {
            id: true,
            teamName: true,
            budget: true,
            currency: true
          }
        }
      }
    })
  }

  // Business Logic Methods
  static async getUserWithFinancialSummary(userId) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        transactions: true,
        ownedTeams: {
          include: {
            transactions: true
          }
        }
      }
    })

    if (!user) throw new Error('User not found')

    // Calculate financial summary
    const personalTransactions = user.transactions
    const personalIncome = personalTransactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const personalExpense = personalTransactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Calculate team financial data
    const teamSummaries = user.ownedTeams.map(team => {
      const teamIncome = team.transactions
        .filter(t => t.transactionType === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const teamExpense = team.transactions
        .filter(t => t.transactionType === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        teamId: team.id,
        teamName: team.teamName,
        income: teamIncome,
        expense: teamExpense,
        balance: teamIncome - teamExpense,
        budget: Number(team.budget),
        budgetRemaining: Number(team.budget) - teamExpense
      }
    })

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      personalFinance: {
        income: personalIncome,
        expense: personalExpense,
        balance: personalIncome - personalExpense
      },
      teamFinance: teamSummaries,
      totalBalance: personalIncome - personalExpense + 
                   teamSummaries.reduce((sum, t) => sum + t.balance, 0)
    }
  }

  static async updateUser(id, updateData) {
    const { firstName, lastName, email, gender } = updateData
    
    const data = {}
    if (firstName !== undefined) data.firstName = firstName
    if (lastName !== undefined) data.lastName = lastName
    if (email !== undefined) data.email = email
    if (gender !== undefined) data.gender = gender

    return await prisma.user.update({
      where: { id: parseInt(id) },
      data
    })
  }

  static async deleteUser(id) {
    return await prisma.user.delete({
      where: { id: parseInt(id) }
    })
  }

  // Advanced queries
  static async searchUsers(searchTerm) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      include: {
        ownedTeams: {
          select: {
            id: true,
            teamName: true
          }
        }
      }
    })
  }

  static async getUsersWithTeamCount() {
    return await prisma.user.findMany({
      include: {
        _count: {
          select: {
            ownedTeams: true,
            transactions: true
          }
        }
      }
    })
  }
}

module.exports = UserService
