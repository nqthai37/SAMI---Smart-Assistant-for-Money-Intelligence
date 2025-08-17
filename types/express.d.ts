// Dòng này để đảm bảo file được coi là một module
export {};

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: number; // Định nghĩa id luôn là number
        // Bạn có thể thêm các thuộc tính khác của user ở đây nếu cần
        // email?: string;
      };
    }
  }
}