const express = require('express')
const cors = require('cors')
const path = require('path')
const prisma = require('./lib/prisma')
const apiRoutes = require('./routes/index')

const app = express()

// Middleware
app.use(express.json())
app.use(cors());


// Use API routes
app.use('/api', apiRoutes);

// Test route to serve frontend
app.get('/frontend', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAMI - Team Management</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #4CAF50; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #4CAF50; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #45a049; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 SAMI - Team Management</h1>
            <p>Smart Assistant for Money Intelligence</p>
        </div>
        
        <h2>👤 Create User</h2>
        <form id="userForm">
            <div class="form-group">
                <label>First Name:</label>
                <input type="text" id="firstName" required>
            </div>
            <div class="form-group">
                <label>Last Name:</label>
                <input type="text" id="lastName" required>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="email" required>
            </div>
            <div class="form-group">
                <label>Password:</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit">Create User</button>
        </form>
        
        <h2>👥 Create Team</h2>
        <form id="teamForm">
            <div class="form-group">
                <label>Team Name:</label>
                <input type="text" id="teamName" required>
            </div>
            <div class="form-group">
                <label>Owner (User ID):</label>
                <select id="ownerId" required>
                    <option value="">Select Owner</option>
                </select>
            </div>
            <div class="form-group">
                <label>Currency:</label>
                <select id="currency">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="VND">VND</option>
                </select>
            </div>
            <div class="form-group">
                <label>Budget:</label>
                <input type="number" id="budget" value="0">
            </div>
            <button type="submit">Create Team</button>
        </form>
        
        <h2>📋 Teams</h2>
        <button onclick="loadTeams()">Refresh Teams</button>
        <div id="teamsList"></div>
    </div>

    <script>
        const API_BASE = '/api';
        
        // Load users
        async function loadUsers() {
            try {
                const response = await fetch(API_BASE + '/users');
                const users = await response.json();
                const select = document.getElementById('ownerId');
                select.innerHTML = '<option value="">Select Owner</option>';
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = user.first_name + ' ' + user.last_name;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading users:', error);
            }
        }
        
        // Load teams
        async function loadTeams() {
            try {
                const response = await fetch(API_BASE + '/teams');
                const teams = await response.json();
                const container = document.getElementById('teamsList');
                container.innerHTML = teams.map(team => 
                    '<div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px;">' +
                    '<h3>' + team.team_name + '</h3>' +
                    '<p>Owner ID: ' + team.owner_id + '</p>' +
                    '<p>Budget: ' + team.currency + ' ' + team.budget + '</p>' +
                    '</div>'
                ).join('');
            } catch (error) {
                console.error('Error loading teams:', error);
            }
        }
        
        // User form
        document.getElementById('userForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(API_BASE + '/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: document.getElementById('firstName').value,
                        last_name: document.getElementById('lastName').value,
                        email: document.getElementById('email').value,
                        password_hash: document.getElementById('password').value
                    })
                });
                const result = await response.json();
                if (response.ok) {
                    alert('User created: ' + result.first_name + ' ' + result.last_name);
                    e.target.reset();
                    loadUsers();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
        
        // Team form
        document.getElementById('teamForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(API_BASE + '/teams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        team_name: document.getElementById('teamName').value,
                        owner_id: parseInt(document.getElementById('ownerId').value),
                        currency: document.getElementById('currency').value,
                        budget: parseFloat(document.getElementById('budget').value),
                        categories: ['General']
                    })
                });
                const result = await response.json();
                if (response.ok) {
                    alert('Team created: ' + result.team_name);
                    e.target.reset();
                    loadTeams();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
        
        // Load initial data
        loadUsers();
        loadTeams();
    </script>
</body>
</html>
  `);
});

// Frontend route - serve frontend at /app
app.get('/app', (req, res) => {
  const filePath = path.join(__dirname, '../public/index.html');
  console.log('Serving frontend from:', filePath);
  res.sendFile(filePath);
});

// Root route - serve frontend
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../public/index.html');
  console.log('Attempting to serve file from:', filePath);
  res.sendFile(filePath);
});

// Serve static files from public directory
const publicPath = path.join(__dirname, '../public');
console.log('Static files served from:', publicPath);
app.use(express.static(publicPath));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
});

// Khởi động server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API documentation available at: http://localhost:${PORT}/api`)
});
