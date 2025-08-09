import type { Request, Response } from 'express';
import * as userService from '../services/userService.js';

// Định nghĩa kiểu Request mở rộng để có `user`
interface AuthenticatedRequest extends Request {
  user?: {
    userId?: number;
    id?: number; // Một số chỗ bạn dùng req.user.id thay vì userId
  };
}

/**
 * @desc Update my profile
 * @route PATCH /api/user/profile
 * @access Private
 */
export const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedUser = await userService.updateMyProfile(userId, req.body);
    return res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc Show team list
 * @route GET /api/user/teams
 * @access Private
 */
export const showTeamList = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { page, limit } = req.query;

    const options: { page?: number; limit?: number } = {}
    if (page) options.page = Number(page)
    if (limit) options.limit = Number(limit)

    const teamList = await userService.showTeamList(userId, options);

    return res.json(teamList);
  } catch (error: any) {
    console.error('Error fetching team list:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get notifications
 * @route GET /api/user/notifications
 * @access Private
 */
export const getNotification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { page, limit, unreadOnly } = req.query;

    const options: { page?: number; limit?: number; unreadOnly?: boolean } = {
      ...(page ? { page: Number(page) } : {}),
      ...(limit ? { limit: Number(limit) } : {}),
      ...(unreadOnly ? { unreadOnly: unreadOnly === 'true' } : {})
    };
    
    const notifications = await userService.getNotification(userId, options);


    return res.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Change user password
 * @route POST /api/user/change-password
 * @access Private
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userID = req.user?.id;
    if (!userID) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { oldPassword, newPassword }: { oldPassword: string; newPassword: string } = req.body;
    await userService.changePassword(userID, oldPassword, newPassword);

    return res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Error changing password:', error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Search Teams
 * @route GET /api/user/workspaces/search
 * @access Private
 */
export const searchTeam = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { query } = req.query;
    const teams = await userService.searchTeam(query as string);
    return res.json(teams);
  } catch (error: any) {
    console.error('Error searching teams:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// test Controller
export const testController = (req: Request, res: Response) => {
  res.json({ message: 'Controller works!', data: [1, 2, 3] });
};

