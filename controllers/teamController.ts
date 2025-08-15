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

// /**
//  * @desc Get the details of a team
//  * @route GET /api/team/:id
//  * @access Private
//  */
// export const getTeamDetails = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const teamId: string = req.params.id;
//         const userId: string = (req as any).user.id;
//         const teamDetails = await teamService.getTeamDetails(teamId, userId);
//         res.status(200).json(teamDetails);
//     } catch (error) {
//         console.error('Error fetching team details:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// /**
//  * @desc Delete a team
//  * @route DELETE /api/team/:id
//  * @access Private
//  */
// export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const teamId: string = req.params.id;
//         const userId: string = (req as any).user.id;
//         await teamService.removeTeam(teamId, userId);
//         res.status(204).send();
//     } catch (error: any) {
//         console.error('Error deleting team:', error);
//         if (error.message === 'You do not have permission to delete this team') {
//             res.status(403).json({ message: error.message });
//         } else {
//             res.status(500).json({ message: 'Server error' });
//         }
//     }
// };

// /**
//  * @desc Invite a member to a team
//  * @route POST /api/team/invite
//  * @access Private
//  */
// export const inviteMember = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { teamId, email }: { teamId: string; email: string } = req.body;
//         const token = await teamService.generateInvitationToken(teamId);
//         await teamService.sendInvitationEmail(email, token);
//         res.status(200).json({ message: 'Invitation sent successfully' });
//     } catch (error) {
//         console.error('Error sending invitation:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// /**
//  * @desc Kick a member from a team
//  * @route POST /api/team/kick
//  * @access Private
//  */
// export const kickMember = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { teamId, memberId }: { teamId: string; memberId: string } = req.body;
//         const userId: string = (req as any).user.id;
//         await teamService.kickMemberFromTeam(teamId, memberId, userId);
//         res.status(200).json({ message: 'Member kicked successfully' });
//     } catch (error) {
//         console.error('Error kicking member:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// /**
//  * @desc Update member role in a team
//  * @route POST /api/team/update-role
//  * @access Private
//  */
// export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { teamId, memberId, newRole }: { teamId: string; memberId: string; newRole: string } = req.body;
//         const userId: string = (req as any).user.id;
//         await teamService.updateMemberRole(teamId, memberId, newRole, userId);
//         res.status(200).json({ message: 'Member role updated successfully' });
//     } catch (error) {
//         console.error('Error updating member role:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// /**
//  * @desc Set budget for a team
//  * @route POST /api/team/set-budget
//  */
// export const setTeamBudget = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { teamId, budget }: { teamId: string; budget: number } = req.body;
//         const userId: string = (req as any).user.id;
//         await teamService.setTeamBudget(teamId, budget, userId);
//         res.status(200).json({ message: 'Team budget set successfully' });
//     } catch (error) {
//         console.error('Error setting team budget:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// /**
//  * @desc Set income goal for a team
//  * @route POST /api/team/set-income-goal
//  */
// export const setTeamIncomeGoal = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { teamId, incomeGoal }: { teamId: string; incomeGoal: number } = req.body;
//         const userId: string = (req as any).user.id;
//         await teamService.setTeamIncomeGoal(teamId, incomeGoal, userId);
//         res.status(200).json({ message: 'Team income goal set successfully' });
//     } catch (error) {
//         console.error('Error setting team income goal:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// /**
//  * @desc Set/change currency for a team
//  * @route POST /api/team/set-currency
//  */
// export const setCurrency = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { teamId, currency }: { teamId: string; currency: string } = req.body;
//         const userId: string = (req as any).user.id;
//         await teamService.setTeamCurrency(teamId, currency, userId);
//         res.status(200).json({ message: 'Team currency set successfully' });
//     } catch (error) {
//         console.error('Error setting team currency:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// /**
//  * @desc Set income/expense category for a team
//  * @route POST /api/team/set-category
//  */
// export const setCategory = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { teamId, category }: { teamId: string; category: string } = req.body;
//         const userId: string = (req as any).user.id;
//         await teamService.setTeamCategory(teamId, category, userId);
//         res.status(200).json({ message: 'Team category set successfully' });
//     } catch (error) {
//         console.error('Error setting team category:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

export {
    createTeam,
};
