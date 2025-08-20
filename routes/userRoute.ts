import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';

const router = Router();

// Private user routes
router.post('/search-teams', authMiddleware, userController.searchTeams);


export default router;
