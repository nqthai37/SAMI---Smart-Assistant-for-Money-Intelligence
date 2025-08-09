import { Request, Response } from 'express';
import * as teamService from '../services/teamService';

/**
 * @desc    Rename a workspace (team)
 * @route   PATCH /api/teams/:workspaceId/rename
 * @access  Private (must have permission)
 * Body: { name: string }
 */
export const renameWorkspace = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId: number | undefined = req.user?.userId;
    const workspaceId: number = parseInt(req.params.workspaceId, 10);
    const { name }: { name?: string } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Invalid workspace name' });
    }

    const updated = await teamService.renameWorkspace(userId, workspaceId, name.trim());

    return res.json({ message: 'Workspace renamed', data: updated });
  } catch (error: any) {
    console.error('renameWorkspace error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Permit a member to view reports (grant or revoke)
 * @route   POST /api/teams/:workspaceId/members/:memberId/permission/report
 * @access  Private (must be admin/owner)
 * Body: { permit: boolean }
 */
export const permitMemberViewReport = async (req: Request, res: Response): Promise<Response> => {
  try {
    const actorId: number | undefined = req.user?.userId;
    const workspaceId: number = parseInt(req.params.workspaceId, 10);
    const memberId: number = parseInt(req.params.memberId, 10);
    const { permit }: { permit?: boolean } = req.body;

    if (typeof permit !== 'boolean') {
      return res.status(400).json({ message: 'permit must be boolean' });
    }

    const result = await teamService.permitMemberViewReport(actorId, workspaceId, memberId, permit);

    return res.json({
      message: permit ? 'Permission granted' : 'Permission revoked',
      data: result
    });
  } catch (error: any) {
    console.error('permitMemberViewReport error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Get transactions for a workspace (with pagination)
 * @route   GET /api/teams/:workspaceId/transactions
 * @access  Private (member of workspace)
 */
export const getTransactions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId: number | undefined = req.user?.userId;
    const workspaceId: number = parseInt(req.params.workspaceId, 10);
    const { page = '1', limit = '20', sort } = req.query;

    const result = await teamService.getTransactions(userId, workspaceId, {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: sort as string | undefined
    });

    return res.json(result);
  } catch (error: any) {
    console.error('getTransactions error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Search transactions in a workspace
 * @route   GET /api/teams/:workspaceId/transactions/search
 * @access  Private
 */
export const searchTransaction = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId: number | undefined = req.user?.userId;
    const workspaceId: number = parseInt(req.params.workspaceId, 10);
    const q: string = (req.query.q as string || '').trim();
    const page: number = parseInt(req.query.page as string || '1', 10);
    const limit: number = parseInt(req.query.limit as string || '25', 10);

    if (!q) {
      return res.status(400).json({ message: 'Query param q is required' });
    }

    const result = await teamService.searchTransaction(userId, workspaceId, { q, page, limit });

    return res.json(result);
  } catch (error: any) {
    console.error('searchTransaction error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

/**
 * @desc    Filter transactions by criteria
 * @route   POST /api/teams/:workspaceId/transactions/filter
 * @access  Private
 */
export const filterTransaction = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId: number | undefined = req.user?.userId;
    const workspaceId: number = parseInt(req.params.workspaceId, 10);
    const filter = req.body || {};

    filter.page = Math.max(1, parseInt(filter.page || 1, 10));
    filter.limit = Math.min(500, Math.max(5, parseInt(filter.limit || 50, 10)));

    const result = await teamService.filterTransaction(userId, workspaceId, filter);

    return res.json(result);
  } catch (error: any) {
    console.error('filterTransaction error', error);
    return res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};
