import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';

const router = Router();

// Private user routes
router.post('/search-teams', authMiddleware, userController.searchTeams);


// Private user routes
// All routes below this will be protected by the authMiddleware
router.use(authMiddleware);
router.get('/profile', userController.getMyProfile);
router.patch('/updateprofile', userController.updateMyProfile);
router.get('/teams', userController.showTeamList);
router.get('/notifications', userController.getNotification);
router.post('/change-password', userController.changePassword);

export default router;
