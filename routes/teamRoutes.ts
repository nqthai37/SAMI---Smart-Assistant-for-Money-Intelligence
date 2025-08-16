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
    router.post(
    '/',
    authMiddleware, // Bật dòng này khi bạn đã có middleware xác thực
    TeamController.createTeam   
    );

    router.delete('/:id', authMiddleware, TeamController.deleteTeam);

    // GET /api/teams/:id - Lấy chi tiết một team (sẽ được thêm sau)
    // router.get('/:id', authMiddleware, teamController.getTeamDetails);

    // PATCH /api/teams/:id - Cập nhật một team (sẽ được thêm sau)
    // router.patch('/:id', authMiddleware, teamController.updateTeam);

    // DELETE /api/teams/:id - Xóa một team (sẽ được thêm sau)
    // router.delete('/:id', authMiddleware, teamController.deleteTeam);
    router.patch('/:id/budget',       authMiddleware, TeamController.setBudget);
    router.patch('/:id/income-goal',  authMiddleware, TeamController.setIncomeGoal);
    router.patch('/:id/currency',     authMiddleware, TeamController.setCurrency);
    router.patch('/:id/categories',   authMiddleware, TeamController.setCategories);

    export default router;
