import { TeamService } from '../services/teamService.js';
/**
 * @desc Create a new team
 * @route POST /api/team
 * @access Private
 */
const createTeam = async (req, res) => {
    try {
        const { name } = req.body;
        // CẢI TIẾN: Bây giờ bạn có thể truy cập req.user.id một cách an toàn
        const userId = req.user.id;
        const newTeam = await TeamService.createNewTeam({ name, ownerId: userId });
        res.status(201).json(newTeam);
    }
    catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
/**
 * @desc Delete a team
 * @route DELETE /api/team/:id
 * @access Private
 */
const deleteTeam = async (req, res) => {
    try {
        const teamId = Number(req.params.id);
        const userId = req.user.id;
        if (Number.isNaN(teamId)) {
            return res.status(400).json({ message: 'Invalid team id' });
        }
        await TeamService.deleteTeam(teamId, userId);
        return res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting team:', error);
        const status = error?.statusCode ?? 500;
        const msg = error?.message ??
            (status === 500 ? 'Server error' : 'Unable to delete team');
        return res.status(status).json({ message: msg });
    }
};
const setBudget = async (req, res) => {
    try {
        const teamId = Number(req.params.id);
        const userId = req.user.id;
        const { amount } = req.body;
        const result = await TeamService.setBudgetAmount(teamId, userId, Number(amount));
        return res.status(200).json({ message: 'Budget updated', ...result });
    }
    catch (err) {
        return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
    }
};
/** PATCH /api/teams/:id/income-goal  (owner) */
const setIncomeGoal = async (req, res) => {
    try {
        const teamId = Number(req.params.id);
        const userId = req.user.id;
        const { target } = req.body;
        const result = await TeamService.setIncomeTarget(teamId, userId, Number(target));
        return res.status(200).json({ message: 'Income goal updated', ...result });
    }
    catch (err) {
        return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
    }
};
/** PATCH /api/teams/:id/currency  (owner + admin) */
const setCurrency = async (req, res) => {
    try {
        const teamId = Number(req.params.id);
        const userId = req.user.id;
        const { currency } = req.body;
        const result = await TeamService.setPreferredCurrency(teamId, userId, String(currency));
        return res.status(200).json({ message: 'Currency updated', ...result });
    }
    catch (err) {
        return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
    }
};
/** PATCH /api/teams/:id/categories  (admin) */
const setCategories = async (req, res) => {
    try {
        const teamId = Number(req.params.id);
        const userId = req.user.id;
        const { name, icon } = req.body;
        const result = await TeamService.setFinanceCategories(teamId, userId, { name, icon });
        return res.status(200).json({ message: 'Categories updated', ...result });
    }
    catch (err) {
        return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
    }
};
const renameWorkspace = async (req, res) => {
    try {
        const teamId = Number(req.params.id);
        const userId = req.user.id;
        const { name } = req.body;
        const result = await TeamService.renameWorkspaceName(teamId, userId, name);
        return res.status(200).json({ message: 'Tên nhóm đã được cập nhật', ...result });
    }
    catch (err) {
        return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
    }
};
/** PATCH /api/teams/:id/report-permission (owner + admin) */
const permitMemberViewReport = async (req, res) => {
    try {
        const teamId = Number(req.params.id);
        const userId = req.user.id;
        const { allow } = req.body;
        const result = await TeamService.permitReportAccess(teamId, userId, Boolean(allow));
        return res.status(200).json({ message: 'Quyền xem báo cáo đã được cập nhật', ...result });
    }
    catch (err) {
        return res.status(err?.statusCode ?? 500).json({ message: err?.message ?? 'Server error' });
    }
};
export { createTeam, deleteTeam, setBudget, setIncomeGoal, setCurrency, setCategories, renameWorkspace, permitMemberViewReport, };
//# sourceMappingURL=teamController.js.map