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
  id: string
  name: string
  description?: string
  color: string
  members: TeamMember[]
  expenses: Transaction[]
  totalExpenses: number
  totalIncome: number
  monthlyBudget?: number
  createdAt: string
  updatedAt: string
  currentUserRole: UserRole
  currentUserMode: UserMode
  currentUserEmail?: string
  canMembersViewReports?: boolean // New property
  incomeTarget?: number // New property
  budgetLimit?: number // New property
}
