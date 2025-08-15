import { PrismaClient } from '@prisma/client';
import type { teams as Team } from '@prisma/client';

// Khởi tạo một instance của PrismaClient
const prisma = new PrismaClient();

// Định nghĩa kiểu dữ liệu cho đầu vào, chỉ lấy các trường cần thiết từ type của Prisma
// Điều này giúp hàm của chúng ta linh hoạt và an toàn hơn.
type TeamCreationData = {
  name: string;
  ownerId: number;
};

/**
 * TeamModel chịu trách nhiệm tương tác trực tiếp với database thông qua Prisma.
 */
const TeamModel = {
  /**
   * Tạo một team mới và đồng thời thêm người tạo làm owner trong một giao dịch duy nhất.
   * @param teamData - Dữ liệu của team cần tạo (name, description, ownerId).
   * @returns Team object đã được tạo, bao gồm cả id mới.
   */
  create: async (teamData: TeamCreationData): Promise<Team> => {
    const { name, ownerId } = teamData;
    console.log('MODEL: Bắt đầu tạo team và thêm owner trong một giao dịch...');

    // Sử dụng Prisma Client để thực hiện thao tác
    const newTeam = await prisma.teams.create({
      data: {
        teamName: name, // Đúng với tên cột mới trong DB
        ownerId: ownerId,

        teamMembers: { // Đúng với relation mới
          create: {
            userId: ownerId, 
            role: 'owner',
          },
        },
      },
    });

    console.log('MODEL: Giao dịch thành công, trả về team:', newTeam);
    return newTeam;
  },
};

export { TeamModel };
