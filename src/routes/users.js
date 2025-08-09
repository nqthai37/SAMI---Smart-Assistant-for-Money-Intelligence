const express = require('express')
const router = express.Router()
const UserService = require('../services/UserService')

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await UserService.getAllUsers()
    res.json(users)
  } catch (err) {
    console.error('Get users error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/search - Search users
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) {
      return res.status(400).json({ error: 'Search term is required' })
    }
    
    const users = await UserService.searchUsers(q)
    res.json(users)
  } catch (err) {
    console.error('Search users error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await UserService.getUserById(id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (err) {
    console.error('Get user by ID error:', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/users/:id/financial-summary - Get user financial summary
router.get('/:id/financial-summary', async (req, res) => {
  try {
    const { id } = req.params
    const summary = await UserService.getUserWithFinancialSummary(id)
    res.json(summary)
  } catch (err) {
    console.error('Get user financial summary error:', err)
    if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    console.log('=== USER CREATION WITH SERVICE ===')
    console.log('Request body:', JSON.stringify(req.body, null, 2))
    
    const { first_name, last_name, email, password_hash, gender } = req.body
    
    // Validate input
    if (!first_name || !last_name || !email || !password_hash) {
      return res.status(400).json({ 
        error: 'firstName, lastName, email, and passwordHash are required',
        received: { first_name, last_name, email, password_hash }
      })
    }

    const user = await UserService.createUser({
      firstName: first_name,
      lastName: last_name,
      email,
      passwordHash: password_hash,
      gender
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

    const user = await UserService.updateUser(id, {
      firstName: first_name,
      lastName: last_name,
      email,
      gender
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
    await UserService.deleteUser(id)
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
