// File: models/transaction.model.ts
import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

// Create a new transaction
const create = async (transactionData: Prisma.TransactionCreateInput) => {
  try {
    return await prisma.transaction.create({
      data: transactionData,
    });
  } catch (error) {
    console.error('Lỗi Model: không thể tạo giao dịch mới.', error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

// Find transaction by ID
const findById = async (id: number) => {
  try {
    return await prisma.transaction.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Lỗi Model: không thể tìm giao dịch với ID ${id}.`, error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

// Update transaction
const update = async (id: number, updates: Prisma.TransactionUpdateInput) => {
  try {
    return await prisma.transaction.update({
      where: { id },
      data: updates,
    });
  } catch (error) {
    console.error(`Lỗi Model: không thể cập nhật giao dịch với ID ${id}.`, error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

// Delete transaction
const remove = async (id: number) => {
  try {
    return await prisma.transaction.delete({
      where: { id },
    });
  } catch (error) {
    console.error(`Lỗi Model: không thể xóa giao dịch với ID ${id}.`, error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

// Create edit request
const createEditRequest = async (data: Prisma.EditRequestCreateInput) => {
  try {
    return await prisma.editRequest.create({
      data,
    });
  } catch (error) {
    console.error('Lỗi Model: không thể tạo yêu cầu chỉnh sửa.', error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

// Find edit request by ID
const findEditRequestById = async (id: number) => {
  try {
    return await prisma.editRequest.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Lỗi Model: không thể tìm yêu cầu chỉnh sửa với ID ${id}.`, error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

// Update edit request status
const updateEditRequestStatus = async (
  id: number,
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
) => {
  try {
    return await prisma.editRequest.update({
      where: { id },
      data: { status },
    });
  } catch (error) {
    console.error(`Lỗi Model: không thể cập nhật trạng thái yêu cầu chỉnh sửa ID ${id}.`, error);
    throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
  }
};

export const TransactionModel = {
  create,
  findById,
  update,
  remove,
  createEditRequest,
  findEditRequestById,
  updateEditRequestStatus,
};
