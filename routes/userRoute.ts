import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

// Public test route
router.get('/test', userController.testController);

// Private user routes
router.patch('/profile', userController.updateMyProfile);
router.get('/teams', userController.showTeamList);
router.get('/notifications', userController.getNotification);
router.post('/change-password', userController.changePassword);
router.get('/teams/search', userController.searchTeam);

export default router;
