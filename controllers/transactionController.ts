// controllers/transactionController.ts
import type { Request, Response } from 'express';
import * as TransactionService from '../services/transactionService.js';

const addTransaction = async (req: Request, res: Response) => {
  try {
    // Lấy id người dùng từ token đã được xác thực
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }

    const payload = req.body;

    const created = await TransactionService.addTransactionRecord(payload, userId);

    return res.status(201).json({
      message: 'Transaction created',
      data: created,
    });
  } catch (error: any) {
    console.error('addTransaction error', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

const editTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // SỬA LỖI: từ userId thành id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }
    const transactionId = parseInt(req.params.id, 10);
    const updates = req.body;

    const updated = await TransactionService.editTransactionItem(transactionId, updates, userId);

    return res.json({
      message: 'Transaction updated',
      data: updated,
    });
  } catch (error: any) {
    console.error('editTransaction error', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // SỬA LỖI: từ userId thành id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }
    const transactionId = parseInt(req.params.id, 10);

    await TransactionService.deleteTransactionItem(transactionId, userId);

    return res.json({ message: 'Transaction deleted' });
  } catch (error: any) {
    console.error('deleteTransaction error', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

const requestEditTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // SỬA LỖI: từ userId thành id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }
    const transactionId = parseInt(req.params.id, 10);
    const { proposedChanges } = req.body;

    const requestRecord = await TransactionService.requestEditOtherTransaction(transactionId, userId, proposedChanges);

    return res.status(201).json({
      message: 'Edit request created',
      data: requestRecord,
    });
  } catch (error: any) {
    console.error('requestEditTransaction error', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

const requestDeleteTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // SỬA LỖI: từ userId thành id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }
    const transactionId = parseInt(req.params.id, 10);

    const requestRecord = await TransactionService.requestDeleteOtherTransaction(transactionId, userId);

    return res.status(201).json({
      message: 'Delete request created',
      data: requestRecord,
    });
  } catch (error: any) {
    console.error('requestDeleteTransaction error', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

const confirmChange = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // SỬA LỖI: từ userId thành id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
    }
    const requestId = parseInt(req.params.requestId, 10);
    const { action } = req.body; // 'approve' or 'reject'

    const result = await TransactionService.confirmTransactionChange(requestId, userId, action);

    return res.json({
      message: `Request ${action}ed`,
      data: result,
    });
  } catch (error: any) {
    console.error('confirmChange error', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

const getTeamTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const teamId = parseInt(req.params.teamId, 10);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Team ID không hợp lệ.' });
    }

    const result = await TransactionService.listTransactionsByTeam(teamId, userId, { page, limit });

    return res.json(result);
  } catch (error: any) {
    console.error('getTeamTransactions error:', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

export const TransactionController = {
  addTransaction,
  editTransaction,
  deleteTransaction,
  requestEditTransaction,
  requestDeleteTransaction,
  confirmChange,
  getTeamTransactions, // Thêm hàm mới vào export
};
