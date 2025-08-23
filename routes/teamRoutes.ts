import { Router } from 'express';
import * as TeamController from '../controllers/teamController.js';
import { TransactionController } from '../controllers/transactionController.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';

const router = Router();

router.use(authMiddleware);

/**
 * Định nghĩa các routes cho resource 'team'.
 * @route /api/teams
 */

// POST /api/teams - Tạo một team mới
router.post('/', TeamController.createTeam);

// DELETE /api/teams/:id - Xóa team
router.delete('/:id', TeamController.deleteTeam);

// GET /api/teams/:id/details - Lấy chi tiết team
router.get('/:id/details', TeamController.getTeamDetails);

// PATCH /api/teams/:id/budget - Cập nhật ngân sách
router.patch('/:id/budget', TeamController.setBudget);

// PATCH /api/teams/:id/income-goal - Cập nhật mục tiêu thu nhập
router.patch('/:id/income-goal', TeamController.setIncomeGoal);

// PATCH /api/teams/:id/currency - Cập nhật đơn vị tiền tệ
router.patch('/:id/currency', TeamController.setCurrency);

// PATCH /api/teams/:id/categories - Cập nhật danh mục tài chính
router.patch('/:id/categories', TeamController.setCategories);

// PATCH /api/teams/:id/name - Đổi tên workspace/team
router.patch('/:id/name', TeamController.renameWorkspace);

// PATCH /api/teams/:id/report-permission - Cập nhật quyền xem báo cáo của member
router.patch('/:id/report-permission', TeamController.permitMemberViewReport);

// POST /api/teams/:id/send-invite - Gửi lời mời tham gia team
router.post('/:id/send-invite', TeamController.sendInviteEmail);

// POST /api/teams/:id/send-invite/response - Xử lý phản hồi lời mời
router.post('/:id/send-invite/response', TeamController.handleInviteResponse);

// GET /api/teams/:teamId/transactions - Lấy danh sách giao dịch của một team
router.get('/:teamId/transactions', TransactionController.getTeamTransactions);

export default router;
