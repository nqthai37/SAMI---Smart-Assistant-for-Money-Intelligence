const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @desc    update Profile
 * @route   POST /api/users/profile
 * @access  Private (req.user.userId must be set by auth middleware)
 */

exports.updateMyProfile = async (req, res) => {
	const userId = req.user.userId;
	const { firstName, lastName, email, phone, dob, gender } = req.body;

	if (!firstName || !lastName || !email || !phone || !dob || !gender) {
		return res.status(400).json({ message: 'Please fill in all fields' });
	}

	try {
		const user = await prisma.user.update({
			where: { id: userId },
			data: { firstName, lastName, email, phone, dob, gender },
		});
		res.status(200).json({ message: 'Profile updated successfully', user });
	} catch (error) {
		res.status(500).json({ message: 'Error updating profile', error });
	}

	 if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

};

/**
* @desc View user profile
* @route GET /api/user/profile
* @access Private
 */
const express = require('express');
const userService = require('../services/userService'); // Assuming you have a userService to handle user-related logic
const router = express.Router();

exports.getMyProfile = async (req, res) => {
    try{
        const userID = req.user.id;
        const profile = await userService.getUserProfile(userID);
        res.json(profile);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

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