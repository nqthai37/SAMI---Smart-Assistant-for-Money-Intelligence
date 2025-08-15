import { TeamModel } from '../model/teamModel.js';
import type { teams as Team } from '@prisma/client';

// Định nghĩa kiểu dữ liệu cho các tham số đầu vào
interface CreateTeamData {
  name: string;
  ownerId: number;
}

/**
 * Xử lý logic tạo một team mới.
 * @param teamData - Dữ liệu cần thiết để tạo team.
 * @returns Team object hoàn chỉnh đã được tạo.
 */
const createNewTeam = async (teamData: CreateTeamData): Promise<Team> => {
  const { name, ownerId } = teamData;

  // 1) Validate dữ liệu đầu vào
  if (!name || !ownerId) {
    const error = new Error('Tên team và ID người tạo là bắt buộc.');
    // Gán statusCode để middleware xử lý lỗi có thể sử dụng
    (error as any).statusCode = 400; // Bad Request
    throw error;
  }

  // 2) Gọi đến Model để thực hiện thao tác với database
  // Toàn bộ logic giao dịch (tạo team và thêm owner) đã được Model xử lý.
  console.log('SERVICE: Gọi đến Model để tạo team...');
  const newTeam = await TeamModel.create(teamData);
  console.log('SERVICE: Model đã tạo team thành công.');

  // 3) Trả về kết quả
  return newTeam;
};

// ... các hàm service khác như getTeamDetails, updateTeam, etc. sẽ được định nghĩa ở đây
// const getTeamDetails = async (teamId: number, userId: number) => { ... };


// Export tất cả các hàm trong một đối tượng service duy nhất
export const TeamService = {
  createNewTeam,
  // getTeamDetails,
};
