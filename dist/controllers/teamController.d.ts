import type { RequestHandler } from 'express';
/**
 * @desc Create a new team
 * @route POST /api/team
 * @access Private
 */
declare const createTeam: RequestHandler;
/**
 * @desc Delete a team
 * @route DELETE /api/team/:id
 * @access Private
 */
declare const deleteTeam: RequestHandler;
declare const setBudget: RequestHandler;
/** PATCH /api/teams/:id/income-goal  (owner) */
declare const setIncomeGoal: RequestHandler;
/** PATCH /api/teams/:id/currency  (owner + admin) */
declare const setCurrency: RequestHandler;
/** PATCH /api/teams/:id/categories  (admin) */
declare const setCategories: RequestHandler;
declare const renameWorkspace: RequestHandler;
/** PATCH /api/teams/:id/report-permission (owner + admin) */
declare const permitMemberViewReport: RequestHandler;
declare const sendInviteEmail: RequestHandler;
declare const handleInviteResponse: RequestHandler;
declare const getTeamDetails: RequestHandler;
declare const removeMember: RequestHandler;
declare const changeMemberRole: RequestHandler;
export { createTeam, deleteTeam, setBudget, setIncomeGoal, setCurrency, setCategories, renameWorkspace, permitMemberViewReport, sendInviteEmail, handleInviteResponse, getTeamDetails, removeMember, changeMemberRole, };
//# sourceMappingURL=teamController.d.ts.map