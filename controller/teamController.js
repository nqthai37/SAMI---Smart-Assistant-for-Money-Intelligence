
const teamService = require('../services/teamService');

/**
 * @desc    Rename a workspace (team)
 * @route   PATCH /api/teams/:workspaceId/rename
 * @access  Private (must have permission)
 * Body: { name: string }
 */
exports.renameWorkspace = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const workspaceId = parseInt(req.params.workspaceId, 10);
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Invalid workspace name' });
    }

    const updated = await teamService.renameWorkspace(userId, workspaceId, name.trim());

    return res.json({ message: 'Workspace renamed', data: updated });
  } catch (error) {
    console.error('renameWorkspace error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Permit a member to view reports (grant or revoke)
 * @route   POST /api/teams/:workspaceId/members/:memberId/permission/report
 * @access  Private (must be admin/owner)
 * Body: { permit: boolean }  // true = grant, false = revoke
 */
exports.permitMemberViewReport = async (req, res) => {
  try {
    const actorId = req.user && req.user.userId;
    const workspaceId = parseInt(req.params.workspaceId, 10);
    const memberId = parseInt(req.params.memberId, 10);
    const { permit } = req.body;

    if (typeof permit !== 'boolean') {
      return res.status(400).json({ message: 'permit must be boolean' });
    }

    const result = await teamService.permitMemberViewReport(actorId, workspaceId, memberId, permit);

    return res.json({
      message: permit ? 'Permission granted' : 'Permission revoked',
      data: result
    });
  } catch (error) {
    console.error('permitMemberViewReport error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Get transactions for a workspace (with pagination)
 * @route   GET /api/teams/:workspaceId/transactions
 * @access  Private (member of workspace)
 */
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const workspaceId = parseInt(req.params.workspaceId, 10);
    const { page = 1, limit = 20, sort } = req.query;

    const result = await teamService.getTransactions(userId, workspaceId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort
    });

    return res.json(result);
  } catch (error) {
    console.error('getTransactions error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Search transactions in a workspace (text search on note, title, tags, etc.)
 * @route   GET /api/teams/:workspaceId/transactions/search
 * @access  Private
 */
exports.searchTransaction = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const workspaceId = parseInt(req.params.workspaceId, 10);
    const q = (req.query.q || '').trim();
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '25', 10);

    if (!q) {
      return res.status(400).json({ message: 'Query param q is required' });
    }

    const result = await teamService.searchTransaction(userId, workspaceId, { q, page, limit });

    return res.json(result);
  } catch (error) {
    console.error('searchTransaction error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Filter transactions by criteria: date range, amount range, category, member, type, tag...
 * @route   POST /api/teams/:workspaceId/transactions/filter
 * @access  Private
 * Body: {
 *   fromDate?: '2025-01-01',
 *   toDate?: '2025-01-31',
 *   minAmount?: number,
 *   maxAmount?: number,
 *   categoryIds?: [1,2],
 *   memberIds?: [3,4],
 *   type?: 'income'|'expense',
 *   tags?: ['food', 'travel'],
 *   page?: 1,
 *   limit?: 50,
 *   sort?: 'amount_desc'|'date_asc'
 * }
 */
exports.filterTransaction = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    const workspaceId = parseInt(req.params.workspaceId, 10);
    const filter = req.body || {};

    // Basic validation for pagination defaults
    filter.page = Math.max(1, parseInt(filter.page || 1, 10));
    filter.limit = Math.min(500, Math.max(5, parseInt(filter.limit || 50, 10)));

    const result = await teamService.filterTransaction(userId, workspaceId, filter);

    return res.json(result);
  } catch (error) {
    console.error('filterTransaction error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};
