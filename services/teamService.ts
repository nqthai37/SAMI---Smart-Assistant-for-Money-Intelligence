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
const assertCurrency = (c: any) => {
  if (typeof c !== 'string' || !/^[A-Z]{3}$/.test(c)) {
    bad('Currency phải là mã ISO-4217 (VD: USD, VND, EUR)', 400);
  }
};
const assertCategories = (cats: any) => {
  if (!Array.isArray(cats) || cats.some((x) => typeof x !== 'string' || !x.trim())) {
    bad('Categories phải là mảng chuỗi không rỗng', 400);
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
export const createNewTeam = async (teamData: { name: string; ownerId: number }) => {
  const { name, ownerId } = teamData;
  if (!name || !ownerId) bad('Tên team và ID người tạo là bắt buộc', 400);
  return TeamModel.create({ name, ownerId });
};

/** Delete team: owner + admin */
export const deleteTeam = async (teamId: number, userId: number) => {
  if (!teamId || !userId) bad('Thiếu teamId hoặc userId', 400);
  await ensureAccessByRoles(teamId, userId, ['owner', 'admin']); // <== quyền ở đây
  await TeamModel.removeRaw(teamId);
};

/** setBudget: owner + admin */
export const setBudgetAmount = async (teamId: number, userId: number, amount: number) => {
  assertNum(amount, 'Budget'); assertNonNegative(amount, 'Budget');
  await ensureAccessByRoles(teamId, userId, ['owner', 'admin']);
  return TeamModel.updateBudget(teamId, amount);
};

/** setIncomeGoal: owner */
export const setIncomeTarget = async (teamId: number, userId: number, target: number) => {
  assertNum(target, 'Income target'); assertNonNegative(target, 'Income target');
  await ensureAccessByRoles(teamId, userId, ['owner']);
  return TeamModel.updateIncomeGoal(teamId, target);
};

/** setCurrency: owner + admin */
export const setPreferredCurrency = async (teamId: number, userId: number, currency: string) => {
  const cur = String(currency).toUpperCase();
  assertCurrency(cur);
  await ensureAccessByRoles(teamId, userId, ['owner', 'admin']);
  return TeamModel.updateCurrency(teamId, cur);
};

/** setCategories: admin */
export const setFinanceCategories = async (teamId: number, userId: number, categories: string[]) => {
  assertCategories(categories);
  await ensureAccessByRoles(teamId, userId, ['admin']);
  return TeamModel.updateCategories(teamId, categories);
};

// Gom export như code base của bạn
export const TeamService = {
  createNewTeam,
  deleteTeam,
  setBudgetAmount,
  setIncomeTarget,
  setPreferredCurrency,
  setFinanceCategories,
};
