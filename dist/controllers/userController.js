import * as userService from '../services/userService.js';
/**
 * @desc Get my profile
 * @route PATCH /api/user/getProfile
 * @access Private
 */
export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user?.id; // Sửa thành req.user.id
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await userService.getUserProfile(userId);
        return res.json(user);
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(error.status || 500).json({ message: error.message || 'Server error' });
    }
};
/**
 * @desc Update my profile
 * @route PATCH /api/user/updateProfile
 * @access Private
 */
export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user?.id; // Sửa thành req.user.id
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updatedUser = await userService.updateUserProfile(userId, req.body);
        return res.json({ message: 'Profile updated', user: updatedUser });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        return res.status(error.status || 500).json({ message: error.message || 'Server error' });
    }
};
/**
 * @desc Change user password
 * @route POST /api/user/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
    try {
        const userID = req.user?.id; // LẤY ID TỪ TOKEN ĐÃ XÁC THỰC
        if (!userID) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { oldPassword, newPassword } = req.body;
        await userService.changePassword(userID, oldPassword, newPassword);
        return res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Error changing password:', error);
        return res.status(400).json({ message: error.message });
    }
};
/**
 * @desc Show team list
 * @route GET /api/user/teams
 * @access Private
 */
export const showTeamList = async (req, res) => {
    try {
        const userId = req.user?.id; // Sửa thành req.user.id
        const { page, limit } = req.query;
        const options = {};
        if (page)
            options.page = Number(page);
        if (limit)
            options.limit = Number(limit);
        const teamList = await userService.showTeamList(userId, options);
        return res.json(teamList);
    }
    catch (error) {
        console.error('Error fetching team list:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
/**
 * @desc Search Teams
 * @route GET /api/user/workspaces/search
 * @access Private
 */
export const searchTeam = async (req, res) => {
    try {
        const { query } = req.query;
        const teams = await userService.searchTeam(query);
        return res.json(teams);
    }
    catch (error) {
        console.error('Error searching teams:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
/**
 * @desc Get notifications
 * @route GET /api/user/notifications
 * @access Private
 */
export const getNotification = async (req, res) => {
    try {
        const userId = req.user?.id; // Sửa thành req.user.id
        const { page, limit, unreadOnly } = req.query;
        const options = {
            ...(page ? { page: Number(page) } : {}),
            ...(limit ? { limit: Number(limit) } : {}),
            ...(unreadOnly ? { unreadOnly: unreadOnly === 'true' } : {})
        };
        const notifications = await userService.getNotification(userId, options);
        return res.json(notifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
//# sourceMappingURL=userController.js.map