import { Router } from 'express';
    import * as TeamController from '../controllers/teamController.js';
    import { authMiddleware } from '../middlewares/authMiddlewares.js'; // Giả sử bạn có một middleware để xác thực user

    const router = Router();

    /**
     * Định nghĩa các routes cho resource 'team'.
     * * @route /api/teams
     */

    // POST /api/teams - Tạo một team mới
    // `authMiddleware` sẽ được chạy trước để xác thực người dùng và đính kèm `req.user`
    router.post('/',authMiddleware, TeamController.createTeam);

    router.delete('/:id', authMiddleware, TeamController.deleteTeam);
    router.patch('/:id/budget',       authMiddleware, TeamController.setBudget);
    router.patch('/:id/income-goal',  authMiddleware, TeamController.setIncomeGoal);
    router.patch('/:id/currency',     authMiddleware, TeamController.setCurrency);
    router.patch('/:id/categories',   authMiddleware, TeamController.setCategories);
    router.patch('/:id/name',         authMiddleware, TeamController.renameWorkspace);
    router.patch('/:id/report-permission', authMiddleware, TeamController.permitMemberViewReport);

    router.post('/:id/send-invite', authMiddleware, TeamController.sendInviteEmail);
    router.post('/:id/send-invite/response', authMiddleware, TeamController.handleInviteResponse);

    router .get('/:id/details', authMiddleware, TeamController.getTeamDetails);

    export default router;
