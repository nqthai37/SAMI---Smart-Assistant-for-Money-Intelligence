import type { Request, Response, RequestHandler } from 'express';
import { TeamService } from '../services/teamService.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: number; // Giả sử id là number, an toàn hơn string
  };
}                                                                           

/**
 * @desc Create a new team
 * @route POST /api/team
 * @access Private
 */
const createTeam :  RequestHandler = async (req, res) => {
    try {
        const { name } = req.body;
        
        // CẢI TIẾN: Bây giờ bạn có thể truy cập req.user.id một cách an toàn
        const userId = (req as AuthenticatedRequest).user.id;

        const newTeam = await TeamService.createNewTeam({ name, ownerId: userId });
        res.status(201).json(newTeam);
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc Delete a team
 * @route DELETE /api/team/:id
 * @access Private
 */
const deleteTeam: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;

    if (Number.isNaN(teamId)) {
      return res.status(400).json({ message: 'Invalid team id' });
    }

    await TeamService.deleteTeam(teamId, userId);
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting team:', error);

    const status = error?.statusCode ?? 500;
    const msg =
      error?.message ??
      (status === 500 ? 'Server error' : 'Unable to delete team');
    return res.status(status).json({ message: msg });
  }
};

const setBudget: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;
    const { amount } = req.body;
    const result = await TeamService.setBudgetAmount(teamId, userId, Number(amount));
    return res.status(200).json({ message: 'Budget updated', ...result });
  } catch (err: any) {
    return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
  }
};

/** PATCH /api/teams/:id/income-goal  (owner) */
const setIncomeGoal: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;
    const { target } = req.body;
    const result = await TeamService.setIncomeTarget(teamId, userId, Number(target));
    return res.status(200).json({ message: 'Income goal updated', ...result });
  } catch (err: any) {
    return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
  }
};

/** PATCH /api/teams/:id/currency  (owner + admin) */
const setCurrency: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;
    const { currency } = req.body;
    const result = await TeamService.setPreferredCurrency(teamId, userId, String(currency));
    return res.status(200).json({ message: 'Currency updated', ...result });
  } catch (err: any) {
    return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
  }
};

/** PATCH /api/teams/:id/categories  (admin) */
const setCategories: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;
    const { categories } = req.body as { categories: { name: string; icon: string }[] };
    const result = await TeamService.setFinanceCategories(teamId, userId, categories);
    return res.status(200).json({ message: 'Categories updated', ...result });
  } catch (err: any) {
    return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
  }
};

const renameWorkspace: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;
    const { name } = req.body;
    const result = await TeamService.renameWorkspaceName(teamId, userId, name);
    return res.status(200).json({ message: 'Tên nhóm đã được cập nhật', ...result });
  } catch (err: any) {
    return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
  }
};

/** PATCH /api/teams/:id/report-permission (owner + admin) */
const permitMemberViewReport: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;
    const { allow } = req.body;
    const result = await TeamService.permitReportAccess(teamId, userId, Boolean(allow));
    return res.status(200).json({ message: 'Quyền xem báo cáo đã được cập nhật', ...result });
  } catch (err: any) {
    return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
  }
};


const sendInviteEmail: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const { email } = req.body;

    // Gửi email mời tham gia team
    await TeamService.sendInviteEmail(teamId, email, (req as AuthenticatedRequest).user.id);

    return res.status(200).json({ message: 'Email mời đã được gửi thành công' });
  } catch (error) {
    console.error('Error sending invite email:', error);
    return res.status(500).json({ message: 'Lỗi khi gửi email mời' });
  }
}

const handleInviteResponse: RequestHandler = async (req, res) => {
  try {
    const { inviteToken, email } = req.body;
    
    // Xử lý phản hồi lời mời
    const result = await TeamService.handleInviteResponse(inviteToken, email);
    
    return res.status(200).json(result);
  }
  catch (error) {
    console.error('Error handling invite response:', error);
    return res.status(500).json({ message: 'Lỗi khi xử lý phản hồi lời mời' });
  }
}

const getTeamDetails: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;

    if (Number.isNaN(teamId)) {
      return res.status(400).json({ message: 'Invalid team id' });
    }

    const teamDetails = await TeamService.getTeamDetails(teamId, userId);
    return res.status(200).json(teamDetails);
  } catch (error: any) {
    console.error('Error getting team details:', error);
    return res.status(error?.statusCode ?? 500).json({ message: error?.message ?? 'Server error' });
  }
}

const removeMember: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const memberId = Number(req.params.memberId);
    const userId = (req as AuthenticatedRequest).user.id;

    if (Number.isNaN(teamId) || Number.isNaN(memberId)) {
      return res.status(400).json({ message: 'Invalid team id or member id' });
    }

    await TeamService.removeMember(teamId, memberId, userId);
    return res.status(200).json({ message: 'Thành viên đã được xóa khỏi nhóm.' });
  } catch (error: any) {
    console.error('Error removing member from team:', error);

    const status = error?.statusCode ?? 500;
    const msg =
      error?.message ??
      (status === 500 ? 'Server error' : 'Unable to remove member');
    return res.status(status).json({ message: msg });
  }
}

const changeMemberRole: RequestHandler = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const memberId = Number(req.params.memberId);
    const userId = (req as AuthenticatedRequest).user.id;
    const { role } = req.body;

    console.log('Changing member role:', { teamId, memberId, userId, role });

    if (Number.isNaN(teamId) || Number.isNaN(memberId) || !role) {
      return res.status(400).json({ message: 'Invalid team id, member id, or role' });
    }

    await TeamService.changeMemberRole(teamId, memberId, userId, role);
    return res.status(200).json({ message: 'Member role updated successfully' });
  } catch (error: any) {
    console.error('Error changing member role:', error);

    const status = error?.statusCode ?? 500;
    const msg =
      error?.message ??
      (status === 500 ? 'Server error' : 'Unable to change member role');
    return res.status(status).json({ message: msg });
  }
}

export {
    createTeam,
    deleteTeam,
    setBudget,
    setIncomeGoal,
    setCurrency,
    setCategories,
    renameWorkspace,
    permitMemberViewReport,
    sendInviteEmail,
    handleInviteResponse,
    getTeamDetails,
    removeMember,
    changeMemberRole,
};
