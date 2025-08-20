"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState } from "react"
import {
  Search,
  Users,
  Settings,
  Plus,
  DollarSign,
  Calendar,
  ArrowLeft,
  LogOut,
  Bell,
  CheckCircle,
  AlertTriangle,
  Check,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import type { Team, UserMode, Transaction } from "@/types/user"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Import the updated view components
import { AdminOwnerView } from "../features/teams/team-views/admin-owner-view"
import { DeputyView } from "../features/teams/team-views/deputy-view"
import { MemberView } from "../features/teams/team-views/member-view"
import { CreateTeamDialog } from "../features/teams/components/create-team-dialog"
import { ProfileSettings } from "@/features/users/components/profile-settings"
import { SecuritySettings } from "@/features/users/components/security-settings"
import { LanguageSettings } from "@/features/users/components/language-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ExpenseManagementHomepage() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [currentView, setCurrentView] = useState<"list" | "team">("list")
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false)
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false) // New state for notifications dialog
  const [searchTerm, setSearchTerm] = useState("") // New state for search term
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    toast.success("Đăng xuất thành công!")
  }

  // All transactions - moved from admin-owner-view.tsx
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([
    {
      id: "1",
      description: "Mua thiết bị văn phòng",
      amount: 500000,
      type: "expense",
      category: "Thiết bị",
      createdBy: "Nguyễn A",
      status: "approved",
      createdAt: "2024-12-12",
    },
    {
      id: "2",
      description: "Thu nhập từ dự án X",
      amount: 2000000,
      type: "income",
      category: "Dịch vụ",
      createdBy: "Trần B",
      status: "approved",
      createdAt: "2024-12-11",
    },
    {
      id: "3",
      description: "Chi phí đi lại",
      amount: 200000,
      type: "expense",
      category: "Di chuyển",
      createdBy: "Lê C",
      status: "edit_requested",
      createdAt: "2024-12-10",
      requestedBy: "Admin",
      requestReason: "Cần bổ sung hóa đơn",
      requestedAt: "2024-12-12",
    },
    {
      id: "4",
      description: "Lương tháng 12",
      amount: 15000000,
      type: "income",
      category: "Lương",
      createdBy: "Phạm D",
      status: "approved",
      createdAt: "2024-12-01",
    },
    {
      id: "5",
      description: "Ăn uống team building",
      amount: 800000,
      type: "expense",
      category: "Ăn uống",
      createdBy: "Hoàng E",
      status: "delete_requested",
      createdAt: "2024-12-09",
      requestedBy: "Admin",
      requestReason: "Không phù hợp ngân sách",
      requestedAt: "2024-12-12",
    },
    {
      id: "6",
      description: "Thanh toán hosting",
      amount: 300000,
      type: "expense",
      category: "Thiết bị",
      createdBy: "Minh F",
      status: "approved",
      createdAt: "2024-12-08",
    },
    {
      id: "7",
      description: "Bán sản phẩm",
      amount: 5000000,
      type: "income",
      category: "Bán hàng",
      createdBy: "Lan G",
      status: "approved",
      createdAt: "2024-12-07",
    },
    {
      id: "8",
      description: "Mua máy tính mới",
      amount: 25000000,
      type: "expense",
      category: "Thiết bị",
      createdBy: "Hùng H",
      status: "approved",
      createdAt: "2024-12-06",
    },
    {
      id: "9",
      description: "Thu từ khách hàng ABC",
      amount: 8000000,
      type: "income",
      category: "Dịch vụ",
      createdBy: "Mai I",
      status: "approved",
      createdAt: "2024-12-05",
    },
    {
      id: "10",
      description: "Chi phí quảng cáo Facebook",
      amount: 1200000,
      type: "expense",
      category: "Marketing",
      createdBy: "Tuấn J",
      status: "approved",
      createdAt: "2024-12-04",
    },
    {
      id: "11",
      description: "Ăn trưa công ty",
      amount: 450000,
      type: "expense",
      category: "Ăn uống",
      createdBy: "Linh K",
      status: "approved",
      createdAt: "2024-12-03",
    },
    {
      id: "12",
      description: "Taxi đi gặp khách",
      amount: 180000,
      type: "expense",
      category: "Di chuyển",
      createdBy: "Nam L",
      status: "edit_requested",
      createdAt: "2024-12-02",
      requestedBy: "Admin",
      requestReason: "Cần hóa đơn chi tiết",
      requestedAt: "2024-12-12",
    },
    {
      id: "13",
      description: "Bán dịch vụ tư vấn",
      amount: 3500000,
      type: "income",
      category: "Dịch vụ",
      createdBy: "Oanh M",
      status: "approved",
      createdAt: "2024-12-01",
    },
    {
      id: "14",
      description: "Mua văn phòng phẩm",
      amount: 320000,
      type: "expense",
      category: "Thiết bị",
      createdBy: "Phúc N",
      status: "approved",
      createdAt: "2024-11-30",
    },
    {
      id: "15",
      description: "Chi phí Google Ads",
      amount: 2100000,
      type: "expense",
      category: "Marketing",
      createdBy: "Quỳnh O",
      status: "approved",
      createdAt: "2024-11-29",
    },
  ])

  const [teams, setTeams] = useState<Team[]>([
    {
      id: "1",
      name: "CLB Công Nghệ",
      description: "Quản lý chi tiêu hoạt động câu lạc bộ",
      color: "bg-green-500",
      members: [],
      expenses: [],
      totalExpenses: 2450000,
      totalIncome: 5000000,
      monthlyBudget: 5000000,
      createdAt: "2024-01-15",
      updatedAt: "2024-12-12",
      currentUserRole: "Admin",
      currentUserMode: "Admin",
      currentUserEmail: user?.email,
      canMembersViewReports: false, // Default to false
      incomeTarget: 50000000,
      budgetLimit: 40000000,
    },
    {
      id: "2",
      name: "Du lịch Vũng Tàu",
      description: "Chi tiêu chuyến du lịch nhóm bạn",
      color: "bg-orange-500",
      members: [],
      expenses: [],
      totalExpenses: 8750000,
      totalIncome: 60000000,
      monthlyBudget: 10000000,
      createdAt: "2024-11-20",
      updatedAt: "2024-12-12",
      currentUserRole: "Owner",
      currentUserMode: "Owner",
      currentUserEmail: user?.email,
      canMembersViewReports: true, // Default to true for this team
      incomeTarget: 70000000,
      budgetLimit: 30000000,
    },
    {
      id: "3",
      name: "Sinh nhật An",
      description: "Tổ chức tiệc sinh nhật",
      color: "bg-purple-500",
      members: [],
      expenses: [],
      totalExpenses: 1200000,
      totalIncome: 2500000,
      monthlyBudget: 2000000,
      createdAt: "2024-12-01",
      updatedAt: "2024-12-12",
      currentUserRole: "Deputy",
      currentUserMode: "Deputy",
      currentUserEmail: user?.email,
      canMembersViewReports: false, // Default to false
      incomeTarget: 10000000,
      budgetLimit: 5000000,
    },
  ])

  // Mock notifications
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      type: "info",
      message: "Thành viên Nguyễn A đã từ chối yêu cầu sửa giao dịch 'Mua thiết bị văn phòng'.",
      timestamp: "15:30",
      read: false,
    },
    {
      id: "n2",
      type: "warning",
      message: "Ngân sách nhóm 'CLB Công Nghệ' đã vượt 90% chỉ tiêu tháng này!",
      timestamp: "14:00",
      read: false,
    },
    {
      id: "n3",
      type: "success",
      message: "Giao dịch 'Thu nhập từ dự án X' đã được chấp thuận.",
      timestamp: "10:15",
      read: true,
    },
    {
      id: "n4",
      type: "info",
      message: "Có 2 yêu cầu giao dịch mới đang chờ bạn xem xét.",
      timestamp: "09:00",
      read: false,
    },
  ])

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const calculateBalance = (income: number, expenses: number) => {
    return income - expenses
  }

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team)
    setCurrentView("team")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedTeam(null)
  }

  const handleModeChange = (mode: UserMode) => {
    if (selectedTeam) {
      setTeams((prevTeams) => prevTeams.map((t) => (t.id === selectedTeam.id ? { ...t, currentUserMode: mode } : t)))
      setSelectedTeam((prev) => (prev ? { ...prev, currentUserMode: mode } : null))
    }
  }

  const handleUpdateTeam = (updatedTeam: Team) => {
    setTeams((prevTeams) => prevTeams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)))
    setSelectedTeam(updatedTeam)
  }

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setAllTransactions((prevTransactions) => {
      const existingIndex = prevTransactions.findIndex((t) => t.id === updatedTransaction.id)
      if (existingIndex > -1) {
        // Update existing transaction
        return prevTransactions.map((t, index) => (index === existingIndex ? updatedTransaction : t))
      } else {
        // Add new transaction
        return [...prevTransactions, updatedTransaction]
      }
    })
  }

  const handleDeleteTransaction = (transactionId: string) => {
    setAllTransactions((prevTransactions) => prevTransactions.filter((t) => t.id !== transactionId))
  }

  const handleCreateTeam = (newTeamName: string) => {
    // Check for duplicate team names
    const teamExists = teams.some((team) => team.name.toLowerCase() === newTeamName.toLowerCase())
    if (teamExists) {
      toast.error("Tên nhóm đã tồn tại. Vui lòng chọn tên khác.")
      return
    }

    // Generate a simple unique ID (for mock data)
    const newTeamId = `team-${Date.now()}`

    // Create the new team object
    const newTeam: Team = {
      id: newTeamId,
      name: newTeamName,
      description: "Quản lý chi tiêu nhóm mới của bạn",
      color: "bg-blue-500", // Default color for new teams
      members: [
        {
          id: user?.id || "mock-user-id", // Use actual user ID if available
          name: user?.name || "Người dùng",
          email: user?.email || "mock@example.com",
          role: "Owner",
          avatar: user?.avatar || "U",
          status: "online",
          joinedAt: new Date().toISOString().split("T")[0], // Current date
        },
      ],
      expenses: [],
      totalExpenses: 0,
      totalIncome: 0,
      monthlyBudget: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      currentUserRole: "Owner",
      currentUserMode: "Owner",
      currentUserEmail: user?.email,
      canMembersViewReports: true, // Default for new teams
      incomeTarget: 0,
      budgetLimit: 0,
    }

    // Update state
    setTeams((prevTeams) => [...prevTeams, newTeam])
    setSelectedTeam(newTeam) // Redirect to the new team's page
    setCurrentView("team")
    setShowCreateTeamDialog(false)
    toast.success(`Nhóm "${newTeamName}" đã được tạo thành công!`)
  }

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const renderTeamView = () => {
    if (!selectedTeam) return null

    // Admin and Owner share the same view (with Owner having delete team option)
    if (selectedTeam.currentUserMode === "Owner" || selectedTeam.currentUserMode === "Admin") {
      return (
        <AdminOwnerView
          team={selectedTeam}
          onModeChange={handleModeChange}
          onUpdateTeam={handleUpdateTeam}
          allTransactions={allTransactions}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )
    } else if (selectedTeam.currentUserMode === "Deputy") {
      return <DeputyView team={selectedTeam} onModeChange={handleModeChange} />
    } else {
      return (
        <MemberView
          team={selectedTeam}
          onModeChange={handleModeChange}
          allTransactions={allTransactions}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Always visible */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Sami</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${
                currentView === "list" ? "text-gray-700 bg-gray-100" : "text-gray-500"
              } hover:bg-gray-100`}
              onClick={handleBackToList}
            >
              <Users className="w-4 h-4" />
              Nhóm của tôi
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-500 hover:bg-gray-100"
              onClick={() => router.push("/settings")}
            >
              <Settings className="w-4 h-4" />
              Cài đặt
            </Button>
          </div>

          {/* My Teams Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">NHÓM CỦA TÔI</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowCreateTeamDialog(true)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {teams.map((team) => {
                const balance = calculateBalance(team.totalIncome, team.totalExpenses)
                return (
                  <div
                    key={team.id}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                      selectedTeam?.id === team.id ? "bg-blue-50 border border-blue-200" : ""
                    }`}
                    onClick={() => handleTeamClick(team)}
                  >
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 truncate">{team.name}</span>
                        <span className="text-xs text-gray-500">({team.currentUserRole})</span>
                      </div>
                      <span className={`text-xs ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentView === "list" ? (
          <>
            {/* Header for List View */}
            <header className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm nhóm..."
                      className="pl-10 bg-gray-50 border-gray-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Notification Bell */}
                  <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell className="w-4 h-4" />
                        {unreadNotificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
                      <DialogHeader>
                        <DialogTitle>Thông báo</DialogTitle>
                        <DialogDescription>Các thông báo gần đây của bạn.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">Không có thông báo nào.</p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`flex items-start gap-3 p-3 rounded-lg ${
                                notification.read ? "bg-gray-50" : "bg-blue-50 border border-blue-200"
                              }`}
                            >
                              <div className="flex-shrink-0 mt-1">
                                {notification.type === "info" && <Bell className="w-4 h-4 text-blue-600" />}
                                {notification.type === "warning" && (
                                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                                )}
                                {notification.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm ${notification.read ? "text-gray-700" : "font-medium"}`}>
                                  {notification.message}
                                </p>
                                <span className="text-xs text-gray-500">{notification.timestamp}</span>
                              </div>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                  onClick={() => handleMarkNotificationAsRead(notification.id)}
                                  aria-label="Mark as read"
                                >
                                  <Check className="w-4 h-4 text-gray-500" />
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                          <div className="text-xs text-gray-500">Việt Nam</div>
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback className="bg-blue-500 text-white text-xs">{user?.avatar}</AvatarFallback>
                        </Avatar>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* List View Content */}
            <main className="flex-1 p-6">
              <div className="max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Nhóm của tôi</h1>
                  <div className="flex items-center gap-3">
                    {/* Removed Filter button */}
                    <Button size="sm" onClick={() => setShowCreateTeamDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo nhóm mới
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {filteredTeams.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Không tìm thấy nhóm nào phù hợp.</p>
                  ) : (
                    filteredTeams.map((team) => {
                      const balance = calculateBalance(team.totalIncome, team.totalExpenses)

                      return (
                        <Card
                          key={team.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleTeamClick(team)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <div className={`w-4 h-4 rounded-full ${team.color} mt-1`}></div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                                    <Badge variant="secondary" className="text-xs">
                                      {team.currentUserRole}
                                    </Badge>
                                  </div>

                                  {team.description && <p className="text-sm text-gray-600 mb-3">{team.description}</p>}

                                  <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4 text-gray-400" />
                                      <span className="text-gray-600">8 thành viên</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4 text-gray-400" />
                                      <span className="text-gray-600">Cập nhật {team.updatedAt}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm text-gray-600 mb-1">Số dư</div>
                                <div
                                  className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {formatCurrency(balance)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            </main>
          </>
        ) : (
          <>
            {/* Header for Team View */}
            <header className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={handleBackToList} size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Notification Bell */}
                  <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell className="w-4 h-4" />
                        {unreadNotificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
                      <DialogHeader>
                        <DialogTitle>Thông báo</DialogTitle>
                        <DialogDescription>Các thông báo gần đây của bạn.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">Không có thông báo nào.</p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`flex items-start gap-3 p-3 rounded-lg ${
                                notification.read ? "bg-gray-50" : "bg-blue-50 border border-blue-200"
                              }`}
                            >
                              <div className="flex-shrink-0 mt-1">
                                {notification.type === "info" && <Bell className="w-4 h-4 text-blue-600" />}
                                {notification.type === "warning" && (
                                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                                )}
                                {notification.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm ${notification.read ? "text-gray-700" : "font-medium"}`}>
                                  {notification.message}
                                </p>
                                <span className="text-xs text-gray-500">{notification.timestamp}</span>
                              </div>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                  onClick={() => handleMarkNotificationAsRead(notification.id)}
                                  aria-label="Mark as read"
                                >
                                  <Check className="w-4 h-4 text-gray-500" />
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                          <div className="text-xs text-gray-500">Việt Nam</div>
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback className="bg-blue-500 text-white text-xs">{user?.avatar}</AvatarFallback>
                        </Avatar>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* Team View Content */}
            <main className="flex-1 overflow-auto">{renderTeamView()}</main>
          </>
        )}
      </div>
      {/* Create Team Dialog */}
      <CreateTeamDialog
        isOpen={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}
        onCreateTeam={handleCreateTeam}
      />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="language">Ngôn ngữ</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="language">
          <LanguageSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
