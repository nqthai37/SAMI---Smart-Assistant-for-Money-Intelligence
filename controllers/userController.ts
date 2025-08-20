import type { Request, RequestHandler, Response } from 'express';
import * as userService from '../services/userService.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: number; // Giả sử id là number, an toàn hơn string
  };
}

// search teams by keyword
const searchTeams: RequestHandler = async (req, res) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const { keyword } = req.body;
  try {
    const teams = await userService.searchTeams(userId, keyword);
    return res.json(teams);
  } catch (error) {
    console.error('Error searching teams:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export{
  searchTeams,
}