import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();


// Private user routes
router.patch('/updateprofile', userController.updateMyProfile);
router.get('/teams', userController.showTeamList);
router.get('/notifications', userController.getNotification);
router.post('/change-password', userController.changePassword);
router.get('/teams/search', userController.searchTeam);

export default router;
