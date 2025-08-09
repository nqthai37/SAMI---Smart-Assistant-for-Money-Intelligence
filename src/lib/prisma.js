const { PrismaClient } = require('@prisma/client')

// Create a global instance to avoid multiple connections
const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

module.exports = prisma
