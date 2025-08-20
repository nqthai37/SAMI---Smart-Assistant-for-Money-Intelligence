// services/teamService.ts
import { TeamModel } from '../model/teamModel.js';

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


const ALLOWED_CURRENCIES = ['VND', 'USD', 'EUR', 'JPY'];
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
  if (name.trim().length > 50) {
    bad('Tên nhóm không được dài quá 50 ký tự.', 400);
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
};
