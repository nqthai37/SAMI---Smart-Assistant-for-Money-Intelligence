const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

// Update my profile
exports.updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updatedUser = await userService.updateMyProfile(userId, req.body);
        res.json({ message: 'Profile updated', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(error.status || 500).json({ message: error.message || 'Server error' });
    }
};

// Show team list
exports.showTeamList = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page, limit } = req.query;
        const teamList = await userService.showTeamList(userId, { page, limit });
        res.json(teamList);
    } catch (error) {
        console.error('Error fetching team list:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get notifications
exports.getNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page, limit, unreadOnly } = req.query;
        const notifications = await userService.getNotification(userId, { page, limit, unreadOnly });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


/**
 * @desc Change user password
 * @route POST /api/user/change-password
 * @access Private
*/
exports.changePassword = async (req, res) => {
    try{
        const userID = req.user.id;
        const { oldPassword, newPassword } = req.body;
        await userService.changePassword(userID, oldPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(400).json({ message: error.message }); 
        // // Validate old password
        // const isMatch = await userService.comparePasswords(oldPassword, userID);
        // if (!isMatch) {
        //     return res.status(400).json({ message: 'Old password is incorrect' });
        // }

        // // Update password
        // await userService.updatePassword(userID, newPassword);
        // res.json({ message: 'Password updated successfully' });
    }
}

exports.searchWorkspaces = async (req, res) => {
    try {
        const { query } = req.query;
        const workspaces = await userService.searchWorkspaces(query);
        res.json(workspaces);
    } catch (error) {
        console.error('Error searching workspaces:', error);
        res.status(500).json({ message: 'Server error' });
    }
}