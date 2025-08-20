import type { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id?: number;
    };
}
/**
 * @desc Get my profile
 * @route PATCH /api/user/getProfile
 * @access Private
 */
export declare const getMyProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
/**
 * @desc Update my profile
 * @route PATCH /api/user/updateProfile
 * @access Private
 */
export declare const updateMyProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
/**
 * @desc Change user password
 * @route POST /api/user/change-password
 * @access Private
 */
export declare const changePassword: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
/**
 * @desc Show team list
 * @route GET /api/user/teams
 * @access Private
 */
export declare const showTeamList: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
/**
 * @desc Search Teams
 * @route GET /api/user/workspaces/search
 * @access Private
 */
export declare const searchTeam: (req: Request, res: Response) => Promise<Response>;
/**
 * @desc Get notifications
 * @route GET /api/user/notifications
 * @access Private
 */
export declare const getNotification: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export {};
//# sourceMappingURL=userController.d.ts.map