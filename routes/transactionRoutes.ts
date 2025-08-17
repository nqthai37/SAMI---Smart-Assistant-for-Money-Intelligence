// routes/transactionRoutes.ts
import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController.js';
import { authMiddleware } from '../middlewares/authMiddlewares.js';

const router = Router();

// Áp dụng middleware xác thực cho TẤT CẢ các route trong file này
router.use(authMiddleware);

router.post('/', TransactionController.addTransaction);
router.put('/:id', TransactionController.editTransaction);
router.delete('/:id', TransactionController.deleteTransaction);
router.post('/:id/requests/edit', TransactionController.requestEditTransaction);
router.post('/:id/requests/delete', TransactionController.requestDeleteTransaction);
router.post('/requests/:requestId/confirm', TransactionController.confirmChange);

export default router;
