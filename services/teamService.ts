// services/teamService.ts
import { TeamModel } from '../model/teamModel.js';
import { UserModel } from '../model/UserModel.js'; // Giả sử bạn có một UserModel để tìm người dùng theo email
import EmailService from './emailService.js'; // Giả sử bạn có một EmailService để gửi email
import { v4 as uuidv4 } from 'uuid';
// ===== Validators (đặt ngay trong file cho đỡ thiếu import) =====
const bad = (msg: string, code = 400) => {
  const e: any = new Error(msg);
  e.statusCode = code;
  throw e;
};

const assertNum = (v: any, name: string) => {
  if (typeof v !== 'number' || Number.isNaN(v)) bad(`${name} phải là số`, 400);
};
const assertNonNegative = (v: number, name: string) => {
  if (v < 0) bad(`${name} không được âm`, 400);
};


const ALLOWED_CURRENCIES = ['VND', 'USD', 'EUR', 'JPY '];
const assertCurrency = (c: any) => {
  const upperC = String(c).toUpperCase();
  if (!ALLOWED_CURRENCIES.includes(upperC)) {
    bad(`Currency không hợp lệ. Chỉ chấp nhận: ${ALLOWED_CURRENCIES.join(', ')}`, 400);
  }
};

const assertCategory = (cat: any) => {
  if (!cat || typeof cat.name !== 'string' || !cat.name.trim() || typeof cat.icon !== 'string' || !cat.icon.trim()) {
    bad('Category phải là một object chứa "name" và "icon" là chuỗi không rỗng.', 400);
  }
};

const assertTeamName = (name: any) => {
  if (typeof name !== 'string' || name.trim().length === 0) {
    bad('Tên nhóm không được để trống.', 400);
  }
};

// ===== Helper kiểm tra quyền LINH ĐỘNG theo từng API =====
/**
 * allowedRoles: danh sách role trong teamMembers được phép thao tác (vd: ['owner'], ['owner','admin'])
 * includeOwnerId: nếu true, chủ team (teams.ownerId) cũng được phép mặc định
 */
const ensureAccessByRoles = async (
  teamId: number,
  userId: number,
  allowedRoles: string[],
  includeOwnerId = true
) => {
  const team = await TeamModel.getBasic(teamId);
  if (!team) bad('Team không tồn tại', 404);

  const hasRole = allowedRoles.length
    ? (await TeamModel.countMembershipByRoles(teamId, userId, allowedRoles)) > 0
    : false;

  const can =
    hasRole || (includeOwnerId && team.ownerId === userId);

  if (!can) bad(`Bạn không có quyền thực hiện thao tác này (cần role: ${allowedRoles.join(', ')})`, 403);
};

// ====== Public Service APIs ======
/** Create team (để bạn đã có sẵn trong code cũ, giữ nguyên) */
const createNewTeam = async (teamData: { name: string; ownerId: number }) => {
  const { name, ownerId } = teamData;
  if (!name || !ownerId) bad('Tên team và ID người tạo là bắt buộc', 400);
  return TeamModel.create({ name, ownerId });
};

/** Delete team: owner + admin */
const deleteTeam = async (teamId: number, userId: number) => {
  if (!teamId || !userId) bad('Thiếu teamId hoặc userId', 400);
  await ensureAccessByRoles(teamId, userId, ['owner', 'admin']); // <== quyền ở đây
  await TeamModel.removeRaw(teamId);
};

/** setBudget: owner + admin */
const setBudgetAmount = async (teamId: number, userId: number, amount: number) => {
  assertNum(amount, 'Budget'); assertNonNegative(amount, 'Budget');
  await ensureAccessByRoles(teamId, userId, ['owner', 'admin']);
  return TeamModel.updateBudget(teamId, amount);
};

/** setIncomeGoal: owner */
const setIncomeTarget = async (teamId: number, userId: number, target: number) => {
  assertNum(target, 'Income target'); assertNonNegative(target, 'Income target');
  await ensureAccessByRoles(teamId, userId, ['owner']);
  return TeamModel.updateIncomeGoal(teamId, target);
};

/** setCurrency: owner + admin */
const setPreferredCurrency = async (teamId: number, userId: number, currency: string) => {
  const cur = String(currency).toUpperCase();
  assertCurrency(cur);
  await ensureAccessByRoles(teamId, userId, ['owner', 'admin']);
  return TeamModel.updateCurrency(teamId, cur);
};

/** setCategories: admin */
const setFinanceCategories = async (teamId: number, userId: number, newCategory: { name: string; icon: string }) => {
  assertCategory(newCategory);
  await ensureAccessByRoles(teamId, userId, ['admin']);

  const team = await TeamModel.getCategories(teamId);
  if (!team) bad('Team không tồn tại', 404);

  // Lấy mảng categories hiện tại, đảm bảo nó là một mảng
  const currentCategories = (Array.isArray(team.categories) ? team.categories : []) as { name: string; icon: string }[];

  // Kiểm tra xem category đã tồn tại chưa (dựa trên tên)
  if (currentCategories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
    bad(`Category với tên "${newCategory.name}" đã tồn tại.`, 409); // 409 Conflict
  }

  // Thêm category mới vào mảng
  const updatedCategories = [...currentCategories, newCategory];

  return TeamModel.updateCategories(teamId, updatedCategories);
};

const renameWorkspaceName = async (teamId: number, userId: number, newName: string) => {
  assertTeamName(newName);
  await ensureAccessByRoles(teamId, userId, ['owner', 'admin']);
  return TeamModel.updateName(teamId, newName.trim());
};

const permitReportAccess = async (teamId: number, userId: number, allow: boolean) => {
  if (typeof allow !== 'boolean') {
    bad('Giá trị cho phép phải là true hoặc false.', 400);
  }
  await ensureAccessByRoles(teamId, userId, ['owner', 'admin']);
  return TeamModel.updateReportPermission(teamId, allow);
};

const checkValidInvite = async (teamId: number, email: string, inviterID: number) => {
  //Kiểm tra email hợp lệ
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    bad('Email không hợp lệ.', 400);
    return false;
  }
  // Kiểm tra xem người dùng đã tồn tại trong team chưa
  const existingMember = await TeamModel.findMemberByEmail(teamId, email);
  if (existingMember) {
    bad('Người dùng đã là thành viên của team.', 409);
    return false;
  }
  //Kiểm tra đã có lời mời chưa
  const existingInvite = await TeamModel.findInviteByEmail(teamId, email);
  if (existingInvite) {
    // Nếu đã có lời mời, kiểm tra thời hạn
    const now = new Date();
    if (existingInvite.expiresAt > now) {
      bad('Lời mời đã được gửi trước đó và vẫn còn hiệu lực.', 409);
      return false;
    }
  }
  return true;
}

const sendInviteEmail=async (teamId: number, email: string, inviterID: number) => {
  if (!teamId || !email || !inviterID) bad('Thiếu teamId, email hoặc inviterID', 400);

  const team = await TeamModel.findById(teamId);
    if (!team) throw new Error('Team không tồn tại');

    const inviter = await UserModel.findById(inviterID);
    if (!inviter) throw new Error('Người mời không tồn tại');
  // 1) Kiểm tra tính hợp lệ của lời mời
  const isValid = await checkValidInvite(teamId, email, inviterID);
  if (!isValid) {
    return { success: false, message: 'Lời mời không hợp lệ hoặc đã được gửi trước đó.' };
  }

  // 2) Tạo token mời (nếu cần, có thể dùng JWT hoặc một token đơn giản)
  const inviteToken = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Hết hạn sau 7 ngày

  const invitation = await TeamModel.saveInvitation({
    inviteToken,
    teamId,
    inviterID,
    email,
    expiresAt,
  });
  if (!invitation) {
    bad('Không thể lưu lời mời.', 500);
  }

  // 3) Gửi email mời
  const inviterName = inviter.firstName || inviter.email || 'Người mời';
  const emailResult = await EmailService.sendTeamInvitation(teamId, email, team.teamName, inviterName, inviteToken);
  if (!emailResult.success) {
    bad('Không thể gửi email mời', 500);
  }

  return { success: true, message: 'Email mời đã được gửi.' };
}

const handleInviteResponse = async (inviteToken: string, email: string) => {
  if (!inviteToken || !email) {
    bad('Thiếu inviteToken hoặc email', 400);
  }
  // 1) Tìm lời mời theo token
  const invitation = await TeamModel.findInviteByToken(inviteToken);
  if (!invitation) {
    bad('Lời mời không tồn tại hoặc đã hết hạn', 404);
  }
  // 2) Cập nhật trạng thái lời mời
    // Thêm người dùng vào team
  const user = await UserModel.findByEmail(email);
  if (!user) {
    bad('Người dùng không tồn tại', 404);
 }
  await TeamModel.addMember(invitation.teamId, user.id, 'member'); // Giả sử role là 'member'
  // Cập nhật trạng thái lời mời
  await TeamModel.updateInvitationStatus(invitation.id, 'accepted');
  return { success: true, message: 'Bạn đã chấp nhận lời mời tham gia team.' };
}

const calculateBalance = async (teamId: number) => {
  const transactions = await TeamModel.getTransactions(teamId);
  if (!transactions || transactions.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0
    };
  }
  
  // const balance = transactions.reduce((total, tx) => {
  //   // Convert amounts to numbers explicitly
  //   const currentAmount = Number(tx.amount || 0);
  //   const currentTotal = Number(total);

  //   if (tx.type === 'income') {
  //     return currentTotal + currentAmount;
  //   } else if (tx.type === 'expense') {
  //     return currentTotal - currentAmount;
  //   }
  //   return currentTotal;
  // }, 0);
  // return balance;

  const totals = transactions.reduce((acc, tx) => {
    const amount = Number(tx.amount || 0);
    
    if (tx.type === 'income') {
      acc.totalIncome += amount;
    } else if (tx.type === 'expense') {
      acc.totalExpenses += amount;
    }
    return acc;
  }, {
    totalIncome: 0,
    totalExpenses: 0
  });

  return {
    ...totals,
    balance: totals.totalIncome - totals.totalExpenses
  };

}

const getTeamDetails = async (teamId: number, userId: number) => {
  if (!teamId || !userId) bad('Thiếu teamId hoặc userId', 400);
  // SỬA LẠI QUYỀN: Cho phép cả 'deputy' truy cập
  await ensureAccessByRoles(teamId, userId, ['owner', 'admin', 'deputy', 'member'], false);
  const team = await TeamModel.getDetails(teamId, userId);
  if (!team) {
    bad('Team không tồn tại', 404);
  }
  const balance = await calculateBalance(teamId);
  const budgetProgress = team.budget ? (balance.totalExpenses / Number(team.budget)) * 100 : 0;
  const incomeProgress = team.incomeGoal ? (balance.totalIncome / Number(team.incomeGoal)) * 100 : 0;
  
  // Dữ liệu trả về đã tự động chứa teamMembers từ teamModel
  return {
    ...team,
    balance: balance.balance,
    budgetProgress: budgetProgress.toFixed(2) + '%',
    incomeProgress: incomeProgress.toFixed(2) + '%',
  };
}

const createTeam = async (req, res) => {
  try {
      const { name } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const newTeam = await TeamService.createNewTeam({ name, ownerId: userId });
      res.status(201).json(newTeam);
  } catch (error: any) { // Thêm kiểu 'any' cho error
      console.error('Error creating team:', error);
      // Trả về status code của lỗi nếu có, mặc định là 500
      res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

const removeMember = async (teamId: number, memberId: number, userId: number) => {
  const user = await UserModel.findById(userId);
  const team = await TeamModel.getBasic(teamId);
  await prisma?.teamMembers.findFirst({
    where: { teamId, userId },
    select: { role: true }
  });

}

// Gom export như code base của bạn
export const TeamService = {
  createNewTeam,
  deleteTeam,
  setBudgetAmount,
  setIncomeTarget,
  setPreferredCurrency,
  setFinanceCategories,
  renameWorkspaceName,
  permitReportAccess,
  sendInviteEmail,
  handleInviteResponse,
  getTeamDetails,
  removeMember,
};
