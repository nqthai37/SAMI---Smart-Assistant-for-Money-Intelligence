const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
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
    
    res.json(users)
  } catch (err) {
    console.error('Get users error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const user = await prisma.user.findUnique({
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
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (err) {
    console.error('Get user by ID error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    console.log('=== PRISMA USER CREATION ===')
    console.log('Request body:', JSON.stringify(req.body, null, 2))
    
    const { first_name, last_name, email, password_hash, gender } = req.body
    
    console.log('Extracted fields:', { first_name, last_name, email, password_hash, gender })
    
    // Validate input
    if (!first_name || !last_name || !email || !password_hash) {
      console.log('VALIDATION FAILED - Missing required fields')
      return res.status(400).json({ 
        error: 'firstName, lastName, email, and passwordHash are required',
        received: { first_name, last_name, email, password_hash }
      })
    }

    console.log('Creating user with Prisma...')
    const user = await prisma.user.create({
      data: {
        firstName: first_name,
        lastName: last_name,
        email,
        passwordHash: password_hash,
        gender: gender || null
      }
    })
    
    console.log('User created successfully:', user)
    res.status(201).json(user)
  } catch (err) {
    console.error('Create user error:', err)
    
    // Handle unique constraint violation (duplicate email)
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' })
    }
    
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { first_name, last_name, email, gender } = req.body

    const updateData = {}
    if (first_name !== undefined) updateData.firstName = first_name
    if (last_name !== undefined) updateData.lastName = last_name
    if (email !== undefined) updateData.email = email
    if (gender !== undefined) updateData.gender = gender

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    res.json(user)
  } catch (err) {
    console.error('Update user error:', err)
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' })
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' })
    }
    
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('Delete user error:', err)
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
