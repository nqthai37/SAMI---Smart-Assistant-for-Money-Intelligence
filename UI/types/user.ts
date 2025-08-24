export type UserRole = "Owner" | "Admin" | "Deputy" | "Member"
export type UserMode = UserRole

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  firstName: string
  lastName: string
  phoneNumber: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  status: "online" | "offline"
  joinedAt: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  categoryName: string
  createdBy: string
  status: "approved" | "edit_requested" | "delete_requested"
  createdAt: string
  requestedBy?: string
  requestReason?: string
  requestedAt?: string
}

// Dùng cho danh sách team tóm tắt
export interface Team {
  id: number;
  teamName: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  color?: string;
  allowMemberViewReport: boolean;
  
  // SỬA Ở ĐÂY: Thêm dấu '?' để các trường này là optional
  // Điều này sẽ giúp danh sách team hiển thị lại ngay lập tức
  members?: { length: number };
  totalExpenses?: number;
  totalIncome?: number;
  balance?: number;
  currency?: string;
  currentUserRole?: string;
  currentUserMode?: string;
}

// Dùng cho trang chi tiết của một team (sẽ cần sau này)
export interface TeamDetails extends Team {
  name?:string;
  // Khi xem chi tiết, chúng ta yêu cầu phải có danh sách thành viên đầy đủ
  members: TeamMember[]; 
  // Và các trường này cũng là bắt buộc
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  currentUserRole: UserRole; // Đảm bảo đây là UserRole, không phải string
  currentUserMode: UserMode; // THÊM DÒNG NÀY
  currency: string;
  categories: { name: string; icon: string }[]; 
}
