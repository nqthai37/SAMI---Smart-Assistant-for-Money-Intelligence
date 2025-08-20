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
export { createTeam, deleteTeam, setBudget, setIncomeGoal, setCurrency, setCategories, renameWorkspace, permitMemberViewReport, };
//# sourceMappingURL=teamController.d.ts.map