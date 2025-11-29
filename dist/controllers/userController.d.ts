import type { Request, RequestHandler, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id?: number;
    };
}
export declare const getMyProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export declare const searchTeams: RequestHandler;
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
export declare const getNotification: (req: AuthenticatedRequest, res: Response) => Promise<Response>;
export {};
//# sourceMappingURL=userController.d.ts.map