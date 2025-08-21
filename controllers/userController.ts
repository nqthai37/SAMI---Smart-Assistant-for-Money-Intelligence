import type { Request, RequestHandler, Response } from 'express';
import * as userService from '../services/userService.js';

// Định nghĩa kiểu Request mở rộng để có user
interface AuthenticatedRequest extends Request {
  user?: {
    id?: number; // Chuẩn hóa sử dụng 'id'
  };
}


export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id; // Sửa thành req.user.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await userService.getUserProfile(userId);
    return res.json(user);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
}
// search teams by keyword
export const searchTeams: RequestHandler = async (req, res) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const { keyword } = req.body;
  try {
    const teams = await userService.searchTeams(userId, keyword);
    const userId = req.user?.id; // Sửa thành req.user.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await userService.getUserProfile(userId);
    return res.json(user);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
}


/**
 * @desc Update my profile
 * @route PATCH /api/user/updateProfile
 * @access Private
 */
export const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id; // Sửa thành req.user.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedUser = await userService.updateUserProfile(userId, req.body);
    return res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc Change user password
 * @route POST /api/user/change-password
 * @access Private
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userID = req.user?.id; // LẤY ID TỪ TOKEN ĐÃ XÁC THỰC
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
 * @desc Show team list
 * @route GET /api/user/teams
 * @access Private
 */
export const showTeamList = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id; // Sửa thành req.user.id
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


export const getNotification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id; // Sửa thành req.user.id
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
