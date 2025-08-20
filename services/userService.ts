import { UserModel } from "../model/UserModel.js";
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middlewares/authMiddlewares.js';

// search teams by keyword
const searchTeams = async (userId: number, keyword: string) => {
  try {
    // Validate keyword
    if (!keyword || keyword.trim() === '') {
      throw new Error('Keyword is required for search');
    }

    // Call the model method to search teams
    const teams = await UserModel.findByKeyWord(userId, keyword);
    
    // Return the found teams
    return teams;
  } catch (error) {
    console.error('Error in userService.searchTeams:', error);
    throw new Error('Failed to search teams');
  }
}

export {
  searchTeams,
}
