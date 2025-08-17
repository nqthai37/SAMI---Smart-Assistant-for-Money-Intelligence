// controllers/transactionController.ts
import type { Request, Response } from 'express';
import * as TransactionService from '../services/transactionService.js';
// import '../types/express';



const addTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
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

const editTransaction = async (  req: Request<{ id: string }>, 
  res: Response) => {
  try {
    const userId = req.user?.userId;
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

const deleteTransaction = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const transactionId = parseInt(req.params.id, 10);

    await TransactionService.deleteTransactionItem(transactionId, userId);

    return res.json({ message: 'Transaction deleted' });
  } catch (error: any) {
    console.error('deleteTransaction error', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

const requestEditTransaction = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
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

const requestDeleteTransaction = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
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

const confirmChange = async (req: Request<{ requestId: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
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

export const TransactionController = {
  addTransaction,
  editTransaction,
  deleteTransaction,
  requestEditTransaction,
  requestDeleteTransaction,
  confirmChange,
};
