// File: services/transaction.service.ts
import { TransactionModel } from '../model/transactionModel.js';
import { TeamModel } from '../model/teamModel.js';
// Bỏ import MemberModel vì đã tích hợp vào TeamModel
import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client'; // THÊM DÒNG NÀY
const prisma = new PrismaClient(); 

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

  // Check if user is a member of the team using the updated TeamModel
  const member = await TeamModel.findMember(transactionData.teamId, userId);
  if (!member) {
    const error = new Error('Bạn không thuộc team này.');
    (error as any).statusCode = 403;
    throw error;
  }

  // Dữ liệu để tạo transaction mới, kết nối với team và user
  const newTransactionData: Prisma.transactionsCreateInput = {
    amount: transactionData.amount,
    type: transactionData.type as 'income' | 'expense', // Đảm bảo type hợp lệ
    categoryName: transactionData.categoryName,
    categoryIcon: transactionData.categoryIcon,
    description: transactionData.description,
    transactionDate: transactionData.transactionDate,
    // Kết nối với các bảng liên quan bằng ID
    teams: {
      connect: { id: transactionData.teamId },
    },
    User: {
      connect: { id: userId },
    },
  };

  return await TransactionModel.create(newTransactionData);
};

// List transactions for a specific team with pagination
export const listTransactionsByTeam = async (
  teamId: number,
  userId: number,
  options: { page: number; limit: number }
) => {
  // 1. Kiểm tra xem người dùng có phải là thành viên của team không
  const member = await TeamModel.findMember(teamId, userId);
  if (!member) {
    const error = new Error('Bạn không có quyền xem các giao dịch của team này.');
    (error as any).statusCode = 403;
    throw error;
  }

  const { page, limit } = options;
  const skip = (page - 1) * limit;

  // 2. Lấy các giao dịch và tổng số lượng để phân trang
  const [transactions, totalTransactions] = await prisma.$transaction([
    prisma.transactions.findMany({
      where: { teamId: teamId },
      skip: skip,
      take: limit,
      orderBy: {
        transactionDate: 'desc', // Sắp xếp giao dịch mới nhất lên đầu
      },
    }),
    prisma.transactions.count({
      where: { teamId: teamId },
    }),
  ]);

  return {
    data: transactions,
    pagination: {
      page,
      limit,
      totalItems: totalTransactions,
      totalPages: Math.ceil(totalTransactions / limit),
    },
  };
};


// Permission checks
export const hasPermissionToChangeOtherTransaction = async (teamId: number, userId: number) => {
  // SỬA LỖI: Sử dụng TeamModel thay vì MemberModel đã bị xóa
  const member = await TeamModel.findMember(teamId, userId);
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

  // SỬA LẠI CÁCH TẠO YÊU CẦU CHỈNH SỬA
  return await TransactionModel.createChangeRequest({
    targetTransactionId: transactionId, // Sửa: transactionId -> targetTransactionId
    requesterId: userId,
    type: 'EDIT',
    status: 'PENDING',
    reason: JSON.stringify(updates), // Sửa: updates -> reason
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

  // SỬA LẠI CÁCH TẠO YÊU CẦU XÓA
  return await TransactionModel.createChangeRequest({
    targetTransactionId: transactionId, // Sửa: transactionId -> targetTransactionId
    requesterId: userId,
    type: 'DELETE',
    status: 'PENDING',
    reason: 'Yêu cầu xóa giao dịch', // Cung cấp lý do
  });
};

// Approve/reject edit request
export const confirmTransactionChange = async (
  requestId: number,
  approverId: number,
  action: 'approve' | 'reject'
) => {
  const request = await TransactionModel.findChangeRequestById(requestId);
  if (!request) {
    const error = new Error('Yêu cầu không tồn tại.');
    (error as any).statusCode = 404;
    throw error;
  }

  // SỬA LỖI: Sử dụng đúng tên trường từ schema
  const transaction = await TransactionModel.findById(request.targetTransactionId);
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
    if (request.type === 'DELETE') {
      await TransactionModel.remove(transaction.id);
    } else {
      // SỬA LỖI: Cần kiểm tra reason có phải là JSON hợp lệ không
      let updatesFromRequest = {};
      try {
        if (request.reason) {
          updatesFromRequest = JSON.parse(request.reason);
        }
      } catch {
        // Bỏ qua nếu reason không phải là JSON, tránh làm sập server
      }
      await TransactionModel.update(transaction.id, {
        ...updatesFromRequest,
        updatedAt: new Date(),
      });
    }
    await TransactionModel.updateChangeRequestStatus(requestId, 'APPROVED');
  } else {
    await TransactionModel.updateChangeRequestStatus(requestId, 'REJECTED');
  }

  return true;
};