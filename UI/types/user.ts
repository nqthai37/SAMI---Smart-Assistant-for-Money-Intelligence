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
  category: string
  createdBy: string
  status: "approved" | "edit_requested" | "delete_requested"
  createdAt: string
  requestedBy?: string
  requestReason?: string
  requestedAt?: string
}

export interface Team {
  id: number; // Sửa từ string thành number
  teamName: string;
  description?: string; // Giữ optional
  color?: string; // Sửa thành optional
  members: { length: number };
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
  currentUserRole: string; // Hoặc UserRole nếu đã định nghĩa
  currentUserMode: string; // Hoặc UserMode nếu đã định nghĩa
}
