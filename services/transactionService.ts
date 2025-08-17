// File: services/transaction.service.ts
import { TransactionModel } from '../models/transaction.model.js';
import { TeamModel } from '../models/teamModel.js';
import { MemberModel } from '../models/memberModel.js';
import type { Prisma } from '@prisma/client';

interface AddTransactionData {
  teamId: number;
  amount: number;
  type: string;
  categoryName: string;
  categoryIcon?: string;
  description?: string;
  transactionDate: Date;
}

// Add new transaction
export const addTransactionRecord = async (
  transactionData: AddTransactionData,
  userId: number
) => {
  if (
    !transactionData.teamId ||
    !transactionData.amount ||
    !transactionData.type ||
    !transactionData.categoryName ||
    !transactionData.transactionDate
  ) {
    const error = new Error('teamId, amount, type, categoryName, transactionDate là bắt buộc.');
    (error as any).statusCode = 400;
    throw error;
  }

  const member = await MemberModel.findByTeamAndUser(transactionData.teamId, userId);
  if (!member) {
    const error = new Error('Bạn không thuộc team này.');
    (error as any).statusCode = 403;
    throw error;
  }

  return await TransactionModel.create({
    teamId: transactionData.teamId,
    userId,
    amount: transactionData.amount,
    type: transactionData.type,
    categoryName: transactionData.categoryName,
    categoryIcon: transactionData.categoryIcon,
    description: transactionData.description,
    transactionDate: transactionData.transactionDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

// Permission checks
export const hasPermissionToChangeOtherTransaction = async (teamId: number, userId: number) => {
  const member = await MemberModel.findByTeamAndUser(teamId, userId);
  return member && (member.role === 'OWNER' || member.role === 'ADMIN');
};

export const hasPermissionToEdit = async (transactionId: number, userId: number) => {
  const transaction = await TransactionModel.findById(transactionId);
  if (!transaction) return false;
  if (transaction.userId === userId) return true;
  return hasPermissionToChangeOtherTransaction(transaction.teamId, userId);
};

// Edit transaction directly
export const editTransactionItem = async (
  transactionId: number,
  updates: Partial<AddTransactionData>,
  userId: number
) => {
  const canEdit = await hasPermissionToEdit(transactionId, userId);
  if (!canEdit) {
    const error = new Error('Bạn không có quyền chỉnh sửa giao dịch này.');
    (error as any).statusCode = 403;
    throw error;
  }

  return await TransactionModel.update(transactionId, {
    ...updates,
    updatedAt: new Date(),
  });
};

// Delete transaction directly
export const hasPermissionToDelete = async (transactionId: number, userId: number) => {
  const transaction = await TransactionModel.findById(transactionId);
  if (!transaction) return false;
  if (transaction.userId === userId) return true;
  return hasPermissionToChangeOtherTransaction(transaction.teamId, userId);
};

export const deleteTransactionItem = async (transactionId: number, userId: number) => {
  const canDelete = await hasPermissionToDelete(transactionId, userId);
  if (!canDelete) {
    const error = new Error('Bạn không có quyền xóa giao dịch này.');
    (error as any).statusCode = 403;
    throw error;
  }
  await TransactionModel.remove(transactionId);
  return true;
};

// Request edit from others
export const requestEditOtherTransaction = async (
  transactionId: number,
  userId: number,
  updates: Partial<AddTransactionData>
) => {
  const transaction = await TransactionModel.findById(transactionId);
  if (!transaction) {
    const error = new Error('Giao dịch không tồn tại.');
    (error as any).statusCode = 404;
    throw error;
  }
  if (transaction.userId === userId) {
    const error = new Error('Bạn có thể chỉnh sửa giao dịch của mình trực tiếp.');
    (error as any).statusCode = 400;
    throw error;
  }

  return await TransactionModel.createEditRequest({
    transactionId,
    requesterId: userId,
    updates: JSON.stringify(updates),
    createdAt: new Date(),
    status: 'PENDING',
  });
};

// Request delete from others
export const requestDeleteOtherTransaction = async (transactionId: number, userId: number) => {
  const transaction = await TransactionModel.findById(transactionId);
  if (!transaction) {
    const error = new Error('Giao dịch không tồn tại.');
    (error as any).statusCode = 404;
    throw error;
  }
  if (transaction.userId === userId) {
    const error = new Error('Bạn có thể xóa giao dịch của mình trực tiếp.');
    (error as any).statusCode = 400;
    throw error;
  }

  return await TransactionModel.createDeleteRequest({
    transactionId,
    requesterId: userId,
    createdAt: new Date(),
    status: 'PENDING',
  });
};

// Approve/reject edit request
export const confirmTransactionChange = async (
  requestId: number,
  approverId: number,
  action: 'approve' | 'reject'
) => {
  const request = await TransactionModel.findEditRequestById(requestId);
  if (!request) {
    const error = new Error('Yêu cầu không tồn tại.');
    (error as any).statusCode = 404;
    throw error;
  }

  const transaction = await TransactionModel.findById(request.transactionId);
  if (!transaction) {
    const error = new Error('Giao dịch không tồn tại.');
    (error as any).statusCode = 404;
    throw error;
  }
  if (transaction.userId !== approverId) {
    const error = new Error('Chỉ chủ sở hữu giao dịch mới có thể xác nhận thay đổi.');
    (error as any).statusCode = 403;
    throw error;
  }

  if (action === 'approve') {
    await TransactionModel.update(transaction.id, {
      ...JSON.parse(request.updates),
      updatedAt: new Date(),
    });
    await TransactionModel.updateEditRequestStatus(requestId, 'APPROVED');
  } else {
    await TransactionModel.updateEditRequestStatus(requestId, 'REJECTED');
  }

  return true;
};
