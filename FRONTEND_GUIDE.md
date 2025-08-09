# SAMI Frontend Integration Guide

## Current Setup: HTML/JavaScript ✅
- Location: `public/index.html`
- Access: http://localhost:3000
- Features: Full team creation workflow

## Alternative: React Frontend Setup

### 1. Create React App
```bash
# In a new terminal/directory
npx create-react-app sami-frontend
cd sami-frontend
npm install axios  # for API calls
```

### 2. Team Creation Component Example
```jsx
// src/components/TeamCreator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function TeamCreator() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({
    team_name: '',
    owner_id: '',
    currency: 'USD',
    budget: 0,
    categories: 'Food, Transport, Entertainment'
  });

  useEffect(() => {
    loadUsers();
    loadTeams();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const categories = teamForm.categories.split(',').map(c => c.trim());
      const teamData = {
        ...teamForm,
        owner_id: parseInt(teamForm.owner_id),
        budget: parseFloat(teamForm.budget),
        categories
      };

      await axios.post(`${API_BASE}/teams`, teamData);
      alert('Team created successfully!');
      setTeamForm({
        team_name: '',
        owner_id: '',
        currency: 'USD',
        budget: 0,
        categories: 'Food, Transport, Entertainment'
      });
      loadTeams();
    } catch (error) {
      alert('Error creating team: ' + error.response?.data?.error);
    }
  };

  return (
    <div>
      <h2>Create Team</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Team Name"
          value={teamForm.team_name}
          onChange={(e) => setTeamForm({...teamForm, team_name: e.target.value})}
          required
        />
        
        <select
          value={teamForm.owner_id}
          onChange={(e) => setTeamForm({...teamForm, owner_id: e.target.value})}
          required
        >
          <option value="">Select Owner</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name}
            </option>
          ))}
        </select>
        
        <input
          type="number"
          placeholder="Budget"
          value={teamForm.budget}
          onChange={(e) => setTeamForm({...teamForm, budget: e.target.value})}
        />
        
        <button type="submit">Create Team</button>
      </form>

      <h3>Existing Teams</h3>
      {teams.map(team => (
        <div key={team.id}>
          <h4>{team.team_name}</h4>
          <p>Budget: {team.currency} {team.budget}</p>
        </div>
      ))}
    </div>
  );
}

export default TeamCreator;
```

### 3. Run React App
```bash
npm start  # Runs on http://localhost:3001
```

## Alternative: Vue.js Frontend

### 1. Create Vue App
```bash
npm create vue@latest sami-frontend
cd sami-frontend
npm install axios
```

### 2. Team Component Example
```vue
<template>
  <div>
    <h2>Create Team</h2>
    <form @submit.prevent="createTeam">
      <input v-model="teamForm.team_name" placeholder="Team Name" required>
      <select v-model="teamForm.owner_id" required>
        <option value="">Select Owner</option>
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.first_name }} {{ user.last_name }}
        </option>
      </select>
      <input v-model="teamForm.budget" type="number" placeholder="Budget">
      <button type="submit">Create Team</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      users: [],
      teamForm: {
        team_name: '',
        owner_id: '',
        budget: 0
      }
    };
  },
  async mounted() {
    const response = await axios.get('http://localhost:3000/api/users');
    this.users = response.data;
  },
  methods: {
    async createTeam() {
      try {
        await axios.post('http://localhost:3000/api/teams', this.teamForm);
        alert('Team created!');
      } catch (error) {
        alert('Error: ' + error.response.data.error);
      }
    }
  }
};
</script>
```

## Mobile App Options

### React Native
```bash
npx react-native init SAMIMobile
# Use same API calls with axios
```

### Flutter
```dart
// Use http package to call your APIs
import 'package:http/http.dart' as http;

Future<void> createTeam(Map<String, dynamic> teamData) async {
  final response = await http.post(
    Uri.parse('http://localhost:3000/api/teams'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode(teamData),
  );
}
```

## API Integration Tips

### JavaScript/TypeScript
```javascript
// API service class
class SAMIApiService {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  async createTeam(teamData) {
    const response = await fetch(`${this.baseURL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData)
    });
    return response.json();
  }

  async getTeams() {
    const response = await fetch(`${this.baseURL}/teams`);
    return response.json();
  }
}
```

### Error Handling
```javascript
try {
  const team = await api.createTeam(teamData);
  showSuccess(`Team "${team.team_name}" created!`);
} catch (error) {
  if (error.response?.status === 400) {
    showError('Invalid team data');
  } else {
    showError('Network error');
  }
}
```
