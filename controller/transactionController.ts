
const transactionService = require('../services/transactionService');

/**
 * @desc    Add a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
exports.addTransaction = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const payload = req.body; // expected { amount, type, date, categoryId, note, ... }

    const created = await transactionService.addTransaction(userId, payload);

    // 201 Created
    return res.status(201).json({
      message: 'Transaction created',
      data: created
    });
  } catch (error) {
    console.error('addTransaction error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Edit an existing transaction (direct edit if permitted)
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
exports.editTransaction = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const transactionId = parseInt(req.params.id, 10);
    const updates = req.body;

    const updated = await transactionService.editTransaction(userId, transactionId, updates);

    return res.json({
      message: 'Transaction updated',
      data: updated
    });
  } catch (error) {
    console.error('editTransaction error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Delete a transaction (direct delete if permitted)
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const transactionId = parseInt(req.params.id, 10);

    await transactionService.deleteTransaction(userId, transactionId);

    return res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('deleteTransaction error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Request edit for a transaction (creates a pending edit request)
 * @route   POST /api/transactions/:id/requests/edit
 * @access  Private
 *
 * Body: { proposedChanges: { ... } , reason?: string }
 */
exports.requestEditTransaction = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const transactionId = parseInt(req.params.id, 10);
    const { proposedChanges, reason } = req.body;

    const requestRecord = await transactionService.requestEditTransaction(userId, transactionId, {
      proposedChanges,
      reason
    });

    return res.status(201).json({
      message: 'Edit request created',
      data: requestRecord
    });
  } catch (error) {
    console.error('requestEditTransaction error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Request delete for a transaction (creates a pending delete request)
 * @route   POST /api/transactions/:id/requests/delete
 * @access  Private
 *
 * Body: { reason?: string }
 */
exports.requestDeleteTransaction = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const transactionId = parseInt(req.params.id, 10);
    const { reason } = req.body;

    const requestRecord = await transactionService.requestDeleteTransaction(userId, transactionId, { reason });

    return res.status(201).json({
      message: 'Delete request created',
      data: requestRecord
    });
  } catch (error) {
    console.error('requestDeleteTransaction error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Confirm or reject a pending change (edit/delete)
 * @route   POST /api/transactions/requests/:requestId/confirm
 * @access  Private (should be authorized user who can confirm)
 *
 * Body: { action: 'approve' | 'reject', note?: string }
 */
exports.confirmChange = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const requestId = parseInt(req.params.requestId, 10);
    const { action, note } = req.body; // action = 'approve' or 'reject'

    const result = await transactionService.confirmChange(userId, requestId, { action, note });

    return res.json({
      message: `Request ${action}ed`,
      data: result
    });
  } catch (error) {
    console.error('confirmChange error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};
