import { Router } from 'express';
import * as TeamController from '../controllers/teamController.js';
import { TransactionController } from '../controllers/transactionController.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';

const router = Router();

router.use(authMiddleware);

/**
 * Định nghĩa các routes cho resource 'team'.
 * * @route /api/teams
 */

// POST /api/teams - Tạo một team mới
router.post('/', TeamController.createTeam);
router.delete('/:id', TeamController.deleteTeam);

router.post('/:id/send-invite', authMiddleware, TeamController.sendInviteEmail);
router.post('/:id/send-invite/response', authMiddleware, TeamController.handleInviteResponse);

router.get('/:id/details', authMiddleware, TeamController.getTeamDetails);

// GET /api/teams/:teamId/transactions - Lấy danh sách giao dịch của một team
router.get('/:teamId/transactions', TransactionController.getTeamTransactions);

export default router;
