// File: models/transaction.model.ts
import { prisma } from '../lib/prisma.js';
// Create a new transaction
const create = async (transactionData) => {
    try {
        return await prisma.transactions.create({
            data: transactionData,
        });
    }
    catch (error) {
        console.error('Lỗi Model: không thể tạo giao dịch mới.', error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
// Find transaction by ID
const findById = async (id) => {
    try {
        return await prisma.transactions.findUnique({
            where: { id },
        });
    }
    catch (error) {
        console.error(`Lỗi Model: không thể tìm giao dịch với ID ${id}.`, error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
// Update transaction
const update = async (id, updates) => {
    try {
        return await prisma.transactions.update({
            where: { id },
            data: updates,
        });
    }
    catch (error) {
        console.error(`Lỗi Model: không thể cập nhật giao dịch với ID ${id}.`, error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
// Delete transaction
const remove = async (id) => {
    try {
        return await prisma.transactions.delete({
            where: { id },
        });
    }
    catch (error) {
        console.error(`Lỗi Model: không thể xóa giao dịch với ID ${id}.`, error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
// Create edit request
const createChangeRequest = async (data) => {
    try {
        return await prisma.changeRequests.create({
            data,
        });
    }
    catch (error) {
        console.error('Lỗi Model: không thể tạo yêu cầu chỉnh sửa.', error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
// Find edit request by ID
const findChangeRequestById = async (id) => {
    try {
        return await prisma.changeRequests.findUnique({
            where: { id },
        });
    }
    catch (error) {
        console.error(`Lỗi Model: không thể tìm yêu cầu chỉnh sửa với ID ${id}.`, error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
// Update edit request status
const updateChangeRequestStatus = async (id, status) => {
    try {
        return await prisma.changeRequests.update({
            where: { id },
            data: { status },
        });
    }
    catch (error) {
        console.error(`Lỗi Model: không thể cập nhật trạng thái yêu cầu chỉnh sửa ID ${id}.`, error);
        throw new Error('Lỗi tương tác với cơ sở dữ liệu.');
    }
};
export const TransactionModel = {
    create,
    findById,
    update,
    remove,
    createChangeRequest,
    findChangeRequestById,
    updateChangeRequestStatus,
};
//# sourceMappingURL=transactionModel.js.map