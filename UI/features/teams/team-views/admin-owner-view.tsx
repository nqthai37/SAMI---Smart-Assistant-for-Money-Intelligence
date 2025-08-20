"use client"

import type React from "react"

import {
  DollarSign,
  TrendingUp,
  Trash2,
  BarChart3,
  Edit,
  AlertTriangle,
  Target,
  Calendar,
  Filter,
  ChevronDown,
  Send,
  Bot,
  Eye,
  EyeOff,
} from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleSwitcher } from "../components/role-switcher"
import { expenseCategories, incomeCategories } from "../../../data/categories"
import type { Team, Transaction } from "../../../types/user"
import { DateFilterDialog } from "../../transactions/components/date-filter-dialog"
import { TransactionFilterDialog } from "../../transactions/components/transaction-filter-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth"
import { toast } from "react-hot-toast"
import { requestEditTransactionAPI, requestDeleteTransactionAPI } from "../../lib/api.js"

type FilterType = "daily" | "weekly" | "monthly" | "annual" | "all-time"

interface AdminOwnerViewProps {
  team: Team
  onModeChange: (mode: any) => void
  onUpdateTeam: (updatedTeam: Team) => void // New prop for updating team properties
  allTransactions: Transaction[] // All transactions from homepage
  onUpdateTransaction: (updatedTransaction: Transaction) => void // New prop for updating a single transaction
  onDeleteTransaction: (transactionId: string) => void // New prop for deleting a transaction
}

export function AdminOwnerView({
  team,
  onModeChange,
  onUpdateTeam,
  allTransactions,
  onUpdateTransaction,
  onDeleteTransaction,
}: AdminOwnerViewProps) {
  const { user } = useAuth()
  const isOwner = team.currentUserRole === "Owner"

  // State for Date Filtering
  const [showDateFilterDialog, setShowDateFilterDialog] = useState(false)
  const [currentDateFilterType, setCurrentDateFilterType] = useState<FilterType>("monthly")
  const [currentDateFilterValue, setCurrentDateFilterValue] = useState<
    Date | { month: number; year: number } | { year: number } | undefined
  >(undefined)

  // State for Transaction Filtering
  const [showTransactionFilterDialog, setShowTransactionFilterDialog] = useState(false)
  const [transactionFilters, setTransactionFilters] = useState({
    creators: [] as string[],
    categories: [] as string[],
    type: "all" as "all" | "income" | "expense",
  })

  // State for AI Chat Dialog
  const [showAIChatDialog, setShowAIChatDialog] = useState(false)
  const [aiChatInput, setAiChatInput] = useState("")
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: "user" | "ai"; text: string; timestamp: string }[]>([])

  // Plan and Budget states (using team props now)
  const [newIncomeTarget, setNewIncomeTarget] = useState("")
  const [newBudgetLimit, setNewBudgetLimit] = useState("")
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)

  // Delete Team Confirmation Dialog
  const [showDeleteTeamConfirmDialog, setShowDeleteTeamConfirmDialog] = useState(false)

  // Transaction Edit/Delete Request Dialogs
  const [showEditTransactionDialog, setShowEditTransactionDialog] = useState(false)
  const [showDeleteTransactionDialog, setShowDeleteTransactionDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editType, setEditType] = useState<"income" | "expense">("expense")
  const [editReason, setEditReason] = useState("")
  const [deleteReason, setDeleteReason] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Format short date
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  // Shorten name
  const shortenName = (name: string) => {
    const parts = name.split(" ")
    if (parts.length > 2) {
      return `${parts[0]} ${parts[parts.length - 1]}`
    }
    return name
  }

  const getCategoryIcon = (categoryName: string, type: "expense" | "income") => {
    const categories = type === "expense" ? expenseCategories : incomeCategories
    const category = categories.find((cat) => cat.name === categoryName)
    return category?.icon || "📦"
  }

  // Filter transactions based on date and transaction filters
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions

    // Apply date filter
    if (currentDateFilterType === "daily" && currentDateFilterValue instanceof Date) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.createdAt)
        return (
          transactionDate.getDate() === currentDateFilterValue.getDate() &&
          transactionDate.getMonth() === currentDateFilterValue.getMonth() &&
          transactionDate.getFullYear() === currentDateFilterValue.getFullYear()
        )
      })
    } else if (currentDateFilterType === "monthly" && currentDateFilterValue && "month" in currentDateFilterValue) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.createdAt)
        return (
          transactionDate.getMonth() === currentDateFilterValue.month &&
          transactionDate.getFullYear() === currentDateFilterValue.year
        )
      })
    } else if (currentDateFilterType === "annual" && currentDateFilterValue && "year" in currentDateFilterValue) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.createdAt)
        return transactionDate.getFullYear() === currentDateFilterValue.year
      })
    }
    // If "all-time", no date filtering is applied

    // Apply transaction filters
    if (transactionFilters.creators.length > 0) {
      filtered = filtered.filter((t) => transactionFilters.creators.includes(t.createdBy))
    }
    if (transactionFilters.categories.length > 0) {
      filtered = filtered.filter((t) => transactionFilters.categories.includes(t.category))
    }
    if (transactionFilters.type !== "all") {
      filtered = filtered.filter((t) => t.type === transactionFilters.type)
    }

    return filtered
  }, [allTransactions, currentDateFilterType, currentDateFilterValue, transactionFilters])

  const requestedTransactions = filteredTransactions.filter((t) => t.status !== "approved")
  const approvedTransactions = filteredTransactions.filter((t) => t.status === "approved")

  // Calculate current totals based on filtered transactions
  const currentTotalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const currentTotalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const currentBalance = currentTotalIncome - currentTotalExpenses

  // Monthly revenue calculation based on team data (hardcoded for now, but would use filtered data)
  const monthlyRevenue = 1500000 // Hardcoded from image
  const monthlyGrowth = 18 // Hardcoded from image

  // Calculate progress percentages
  const incomeProgress = (currentTotalIncome / (team.incomeTarget || 1)) * 100
  const budgetProgress = (currentTotalExpenses / (team.budgetLimit || 1)) * 100

  const handleRequestEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setEditDescription(transaction.description)
    setEditAmount(transaction.amount.toString())
    setEditCategory(transaction.category)
    setEditType(transaction.type)
    setEditReason("") // Clear previous reason
    setShowEditTransactionDialog(true)
  }

  const handleConfirmEditRequest = () => {
    if (selectedTransaction && editReason.trim()) {
      const updatedTransaction: Transaction = {
        ...selectedTransaction,
        description: editDescription,
        amount: Number.parseFloat(editAmount),
        category: editCategory,
        type: editType,
        status: "edit_requested",
        requestedBy: user?.name || "Admin/Owner",
        requestReason: editReason.trim(),
        requestedAt: new Date().toISOString(),
      }
      onUpdateTransaction(updatedTransaction)
      toast.success("Yêu cầu sửa giao dịch đã được gửi!")
      setShowEditTransactionDialog(false)
      setSelectedTransaction(null)
    } else {
      toast.error("Vui lòng nhập lý do sửa giao dịch.")
    }
  }

  const handleRequestDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDeleteReason("") // Clear previous reason
    setShowDeleteTransactionDialog(true)
  }

  const handleConfirmDeleteRequest = () => {
    if (selectedTransaction && deleteReason.trim()) {
      const updatedTransaction: Transaction = {
        ...selectedTransaction,
        status: "delete_requested",
        requestedBy: user?.name || "Admin/Owner",
        requestReason: deleteReason.trim(),
        requestedAt: new Date().toISOString(),
      }
      onUpdateTransaction(updatedTransaction)
      toast.success("Yêu cầu xóa giao dịch đã được gửi!")
      setShowDeleteTransactionDialog(false)
      setSelectedTransaction(null)
    } else {
      toast.error("Vui lòng nhập lý do xóa giao dịch.")
    }
  }

  const handleSetIncomeTarget = () => {
    if (newIncomeTarget) {
      onUpdateTeam({ ...team, incomeTarget: Number.parseInt(newIncomeTarget) })
      setNewIncomeTarget("")
      setShowPlanDialog(false)
    }
  }

  const handleSetBudgetLimit = () => {
    if (newBudgetLimit) {
      onUpdateTeam({ ...team, budgetLimit: Number.parseInt(newBudgetLimit) })
      setNewBudgetLimit("")
      setShowBudgetDialog(false)
    }
  }

  const handleToggleMemberReportsView = () => {
    onUpdateTeam({ ...team, canMembersViewReports: !team.canMembersViewReports })
  }

  const handleConfirmDeleteTeam = () => {
    console.log("Deleting team:", team.name)
    toast.success(`Nhóm "${team.name}" đã được xóa.`)
    // In a real app, you'd redirect to the team list or homepage
    setShowDeleteTeamConfirmDialog(false)
  }

  // Data for charts (matching image values) - these should ideally be derived from filteredTransactions
  const chartData = {
    generalIncome: currentTotalIncome, // Use filtered income
    generalExpense: currentTotalExpenses, // Use filtered expense
    incomeBreakdown: [
      { category: "Lương", percentage: 68, color: "#10B981" }, // Green
      { category: "Dịch vụ", percentage: 18, color: "#3B82F6" }, // Blue
      { category: "Bán hàng", percentage: 14, color: "#8B5CF6" }, // Purple
    ],
    expenseBreakdown: [
      { category: "Ăn uống", percentage: 50, color: "#EF4444" }, // Red
      { category: "Di chuyển", percentage: 25, color: "#F59E0B" }, // Orange
      { category: "Thiết bị", percentage: 15, color: "#06B6D4" }, // Teal
      { category: "Marketing", percentage: 10, color: "#84CC16" }, // Green
    ],
    yearlyTrend: [
      { month: "T1", income: 12000000, expense: 8000000 },
      { month: "T2", income: 15000000, expense: 10000000 },
      { month: "T3", income: 18000000, expense: 12000000 },
      { month: "T4", income: 14000000, expense: 9000000 },
      { month: "T5", income: 16000000, expense: 11000000 },
      { month: "T6", income: 20000000, expense: 13000000 },
      { month: "T7", income: 22000000, expense: 15000000 },
      { month: "T8", income: 19000000, expense: 12000000 },
      { month: "T9", income: 17000000, expense: 11000000 },
      { month: "T10", income: 21000000, expense: 14000000 },
      { month: "T11", income: 18000000, expense: 13000000 },
      { month: "T12", income: 25000000, expense: 16000000 },
    ],
  }

  // Helper to create Bar Chart SVG for General
  const createBarChart = (income: number, expense: number) => {
    const maxVal = Math.max(income, expense)
    const incomeHeight = (income / maxVal) * 96 // Max height 96px
    const expenseHeight = (expense / maxVal) * 96 // Max height 96px

    return (
      <div className="flex items-end justify-center gap-8 h-32 mb-4">
        <div className="flex flex-col items-center">
          <div className="w-12 rounded-t-lg bg-green-500" style={{ height: `${incomeHeight}px` }}></div>
          <span className="text-sm text-gray-600 mt-2">Income</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 rounded-t-lg bg-red-500" style={{ height: `${expenseHeight}px` }}></div>
          <span className="text-sm text-gray-600 mt-2">Expense</span>
        </div>
      </div>
    )
  }

  // Helper to create Donut Chart SVG
  const createDonutChart = (data: { category: string; percentage: number; color: string }[], size = 120) => {
    const radius = 40
    const strokeWidth = 20
    const center = size / 2
    let cumulativePercentage = 0

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
          {data.map((item, index) => {
            const strokeDasharray = `${(item.percentage / 100) * 2 * Math.PI * radius} ${2 * Math.PI * radius}`
            const strokeDashoffset = (-cumulativePercentage * 2 * Math.PI * radius) / 100
            cumulativePercentage += item.percentage

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
      </div>
    )
  }

  // Helper to create Line Chart SVG
  const createLineChart = () => {
    const width = 700
    const height = 250
    const padding = 60
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Fixed Y-axis values from image
    const yAxisValues = [0, 6250000, 12500000, 18750000, 25000000]
    const maxChartValue = yAxisValues[yAxisValues.length - 1]

    const incomePoints = chartData.yearlyTrend
      .map((d, i) => {
        const x = padding + (i * chartWidth) / (chartData.yearlyTrend.length - 1)
        const y = padding + chartHeight - (d.income / maxChartValue) * chartHeight
        return `${x},${y}`
      })
      .join(" ")

    const expensePoints = chartData.yearlyTrend
      .map((d, i) => {
        const x = padding + (i * chartWidth) / (chartData.yearlyTrend.length - 1)
        const y = padding + chartHeight - (d.expense / maxChartValue) * chartHeight
        return `${x},${y}`
      })
      .join(" ")

    return (
      <div className="w-full overflow-x-auto">
        <svg width={width} height={height} className="min-w-full">
          {/* Grid lines */}
          {yAxisValues.map((_, i) => {
            if (i === 0) return null // Don't draw line for 0
            const y = padding + chartHeight - (i / (yAxisValues.length - 1)) * chartHeight
            return (
              <line
                key={`grid-y-${i}`}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            )
          })}

          {/* Y-axis line */}
          <line x1={padding} y1={padding} x2={padding} y2={padding + chartHeight} stroke="#6B7280" strokeWidth="2" />

          {/* X-axis line */}
          <line
            x1={padding}
            y1={padding + chartHeight}
            x2={width - padding}
            y2={padding + chartHeight}
            stroke="#6B7280"
            strokeWidth="2"
          />

          {/* Y-axis labels */}
          {yAxisValues.map((value, i) => {
            const label = value === 0 ? "0K" : value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}K`
            const y = padding + chartHeight - (i / (yAxisValues.length - 1)) * chartHeight
            return (
              <text
                key={`y-label-${i}`}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-600 font-medium"
              >
                {label}
              </text>
            )
          })}

          {/* Income line */}
          <polyline
            points={incomePoints}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Expense line */}
          <polyline
            points={expensePoints}
            fill="none"
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Income points */}
          {chartData.yearlyTrend.map((d, i) => {
            const x = padding + (i * chartWidth) / (chartData.yearlyTrend.length - 1)
            const y = padding + chartHeight - (d.income / maxChartValue) * chartHeight
            return <circle key={`income-${i}`} cx={x} cy={y} r="4" fill="#10B981" />
          })}

          {/* Expense points */}
          {chartData.yearlyTrend.map((d, i) => {
            const x = padding + (i * chartWidth) / (chartData.yearlyTrend.length - 1)
            const y = padding + chartHeight - (d.expense / maxChartValue) * chartHeight
            return <circle key={`expense-${i}`} cx={x} cy={y} r="4" fill="#EF4444" />
          })}

          {/* X-axis labels */}
          {chartData.yearlyTrend.map((d, i) => {
            const x = padding + (i * chartWidth) / (chartData.yearlyTrend.length - 1)
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={height - 15}
                textAnchor="middle"
                className="text-xs fill-gray-600 font-medium"
              >
                {d.month}
              </text>
            )
          })}

          {/* Y-axis title */}
          <text
            x={20}
            y={padding + chartHeight / 2}
            textAnchor="middle"
            className="text-xs fill-gray-600 font-medium"
            transform={`rotate(-90, 20, ${padding + chartHeight / 2})`}
          >
            Số tiền (VNĐ)
          </text>

          {/* X-axis title */}
          <text
            x={padding + chartWidth / 2}
            y={height - 5}
            textAnchor="middle"
            className="text-xs fill-gray-600 font-medium"
          >
            Tháng
          </text>
        </svg>
      </div>
    )
  }

  const getDateFilterLabel = () => {
    if (currentDateFilterType === "all-time") return "Tất cả thời gian"
    if (currentDateFilterType === "daily" && currentDateFilterValue instanceof Date) {
      return `Ngày ${currentDateFilterValue.getDate()}/${currentDateFilterValue.getMonth() + 1}/${currentDateFilterValue.getFullYear()}`
    }
    if (currentDateFilterType === "monthly" && currentDateFilterValue && "month" in currentDateFilterValue) {
      const monthNames = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ]
      return `${monthNames[currentDateFilterValue.month]}, ${currentDateFilterValue.year}`
    }
    if (currentDateFilterType === "annual" && currentDateFilterValue && "year" in currentDateFilterValue) {
      return `Năm ${currentDateFilterValue.year}`
    }
    return "Chọn thời gian"
  }

  const handleAIChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (aiChatInput.trim()) {
      setAiChatMessages((prev) => [
        ...prev,
        { sender: "user", text: aiChatInput, timestamp: new Date().toLocaleTimeString() },
        {
          sender: "ai",
          text: "Tính năng này đang được phát triển. Vui lòng thử lại sau!",
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
      setAiChatInput("")
    }
  }

  const availableEditCategories = editType === "expense" ? expenseCategories : incomeCategories

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-y-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-4 h-4 rounded-full ${team.color} flex-shrink-0`}></div>
            <h1 className="text-2xl font-bold text-gray-900 truncate flex-1">{team.name}</h1>
            <Badge variant="secondary" className="flex-shrink-0">
              {team.currentUserRole}
            </Badge>
            <div className="flex-shrink-0">
              <RoleSwitcher
                teamName={team.name}
                actualRole={team.currentUserRole}
                currentMode={team.currentUserMode}
                onModeChange={onModeChange}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <Button
            size="sm"
            variant="outline"
            className={team.canMembersViewReports ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
            onClick={handleToggleMemberReportsView}
          >
            {team.canMembersViewReports ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {team.canMembersViewReports ? "Cho phép thành viên xem báo cáo" : "Không cho phép thành viên xem báo cáo"}
          </Button>

          <Dialog open={showAIChatDialog} onOpenChange={setShowAIChatDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Tạo báo cáo bằng AI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
              <DialogHeader>
                <DialogTitle>Chat với AI</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col h-[400px] border rounded-lg overflow-hidden">
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                  {aiChatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      <Bot className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                      <p>Chào bạn! Tôi là AI trợ lý của bạn. Hãy hỏi tôi bất cứ điều gì về chi tiêu của nhóm.</p>
                    </div>
                  ) : (
                    aiChatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : ""}`}
                      >
                        {msg.sender === "ai" && (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-lg max-w-[80%] ${
                            msg.sender === "user"
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-gray-200 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <span className="text-xs opacity-75 mt-1 block text-right">{msg.timestamp}</span>
                        </div>
                        {msg.sender === "user" && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-gray-700">Bạn</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleAIChatSubmit} className="p-4 border-t bg-white flex gap-2">
                  <Input
                    placeholder="Nhập tin nhắn của bạn..."
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
              <div className="text-center text-sm text-gray-500 mt-2">Tính năng này đang được phát triển.</div>
            </DialogContent>
          </Dialog>

          {isOwner && (
            <Dialog open={showDeleteTeamConfirmDialog} onOpenChange={setShowDeleteTeamConfirmDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa nhóm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận xóa nhóm</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn xóa nhóm "{team.name}"? Hành động này không thể hoàn tác.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 pt-4">
                  <Button variant="destructive" onClick={handleConfirmDeleteTeam} className="flex-1">
                    Xác nhận xóa
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteTeamConfirmDialog(false)} className="flex-1">
                    Hủy
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Financial Overview - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Số dư hiện tại</p>
                <p className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(currentBalance)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Tổng tích lũy</p>
              </div>
              <DollarSign className={`w-8 h-8 ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentTotalIncome)}</p>
                <p className="text-xs text-green-600 mt-1">+{monthlyGrowth}% so với tháng trước</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yêu cầu đang chờ</p>
                <p className="text-2xl font-bold text-orange-600">{requestedTransactions.length}</p>
                <p className="text-xs text-gray-600 mt-1">Phản hồi từ member</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan and Budget Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Income Target Card */}
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-700 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Mục tiêu thu nhập
            </CardTitle>
            <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Đặt mục tiêu thu nhập</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="income-target">Mục tiêu thu nhập (VNĐ)</Label>
                    <Input
                      id="income-target"
                      type="number"
                      placeholder="Nhập số tiền mục tiêu"
                      value={newIncomeTarget}
                      onChange={(e) => setNewIncomeTarget(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSetIncomeTarget} className="flex-1">
                      Lưu mục tiêu
                    </Button>
                    <Button variant="outline" onClick={() => setShowPlanDialog(false)} className="flex-1">
                      Hủy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mục tiêu:</span>
                <span className="font-semibold text-green-600">{formatCurrency(team.incomeTarget || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hiện tại:</span>
                <span className="font-semibold">{formatCurrency(currentTotalIncome)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tiến độ:</span>
                  <span className={`text-sm font-medium text-gray-700`}>{incomeProgress.toFixed(0)}%</span>
                </div>
                <Progress value={incomeProgress} className="h-3" />
              </div>
              <div className="text-sm text-gray-600">
                Còn thiếu: {formatCurrency((team.incomeTarget || 0) - currentTotalIncome)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Limit Card */}
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Ngân sách chi tiêu
            </CardTitle>
            <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Đặt ngân sách chi tiêu</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget-limit">Ngân sách tối đa (VNĐ)</Label>
                    <Input
                      id="budget-limit"
                      type="number"
                      placeholder="Nhập số tiền ngân sách"
                      value={newBudgetLimit}
                      onChange={(e) => setNewBudgetLimit(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSetBudgetLimit} className="flex-1">
                      Lưu ngân sách
                    </Button>
                    <Button variant="outline" onClick={() => setShowBudgetDialog(false)} className="flex-1">
                      Hủy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ngân sách:</span>
                <span className="font-semibold text-red-600">{formatCurrency(team.budgetLimit || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đã chi:</span>
                <span className="font-semibold">{formatCurrency(currentTotalExpenses)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sử dụng:</span>
                  <span className={`text-sm font-medium text-gray-700`}>{budgetProgress.toFixed(0)}%</span>
                </div>
                <Progress value={budgetProgress} className="h-3" />
              </div>
              <div className="text-sm text-gray-600">
                Còn lại: {formatCurrency((team.budgetLimit || 0) - currentTotalExpenses)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Reports and Transactions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Báo cáo & Lịch sử giao dịch</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => setShowDateFilterDialog(true)}
            >
              {getDateFilterLabel()}
              <ChevronDown className="w-4 h-4" />
            </Button>
            <DateFilterDialog
              isOpen={showDateFilterDialog}
              onOpenChange={setShowDateFilterDialog}
              onConfirm={(type, value) => {
                setCurrentDateFilterType(type)
                setCurrentDateFilterValue(value)
              }}
              initialFilterType={currentDateFilterType}
              initialDate={currentDateFilterValue instanceof Date ? currentDateFilterValue : new Date()}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Monthly Income/Expense Trend Chart (Moved to top) */}
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-purple-800">Biểu đồ thu chi 12 tháng gần đây</CardTitle>
            </CardHeader>
            <CardContent>{createLineChart()}</CardContent>
          </Card>

          {/* Analytics and Charts - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* General Bar Chart */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-800">Tổng quan</CardTitle>
              </CardHeader>
              <CardContent>
                {createBarChart(chartData.generalIncome, chartData.generalExpense)}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thu nhập</span>
                    <span className="font-semibold text-green-600">{formatCurrency(chartData.generalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chi tiêu</span>
                    <span className="font-semibold text-red-600">{formatCurrency(chartData.generalExpense)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Donut Chart */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-800">Thu nhập theo danh mục</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center md:flex-row md:items-start gap-4">
                {createDonutChart(chartData.incomeBreakdown, 120)}
                <div className="flex-1 space-y-2">
                  {chartData.incomeBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span>{item.category}</span>
                      <span className="text-gray-600">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expenses Donut Chart */}
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-800">Chi tiêu theo danh mục</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center md:flex-row md:items-start gap-4">
                {createDonutChart(chartData.expenseBreakdown, 120)}
                <div className="flex-1 space-y-2">
                  {chartData.expenseBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span>{item.category}</span>
                      <span className="text-gray-600">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lịch sử giao dịch</CardTitle>
              <div className="flex items-center gap-2">
                <Input placeholder="Tìm kiếm..." className="w-60" />
                <Button variant="outline" size="sm" onClick={() => setShowTransactionFilterDialog(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Lọc
                </Button>
                <TransactionFilterDialog
                  isOpen={showTransactionFilterDialog}
                  onOpenChange={setShowTransactionFilterDialog}
                  onApplyFilters={setTransactionFilters}
                  initialFilters={transactionFilters}
                  allTransactions={allTransactions}
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">Tất cả ({filteredTransactions.length})</TabsTrigger>
                  <TabsTrigger value="requests">Đã yêu cầu ({requestedTransactions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`p-3 border rounded-lg ${
                        transaction.status === "edit_requested"
                          ? "bg-yellow-50 border-yellow-200"
                          : transaction.status === "delete_requested"
                            ? "bg-red-50 border-red-200"
                            : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-xl">{getCategoryIcon(transaction.category, transaction.type)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{transaction.description}</h4>
                              {transaction.type === "income" ? (
                                <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                                  Thu
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Chi</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">
                              {transaction.category} • {shortenName(transaction.createdBy)} •{" "}
                              {formatShortDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <p
                            className={`font-semibold text-sm ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                          {transaction.status === "edit_requested" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent p-1 h-auto w-auto text-orange-500 hover:text-orange-600"
                              onClick={() => handleRequestEdit(transaction)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {transaction.status === "delete_requested" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent p-1 h-auto w-auto text-red-500 hover:text-red-600"
                              onClick={() => handleRequestDelete(transaction)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {transaction.status === "approved" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-transparent p-1 h-auto w-auto text-gray-500 hover:text-gray-600"
                                onClick={() => handleRequestEdit(transaction)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-transparent p-1 h-auto w-auto text-gray-500 hover:text-gray-600"
                                onClick={() => handleRequestDelete(transaction)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {transaction.requestReason && transaction.status !== "approved" && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-xs font-medium text-orange-800 mb-1">
                            Yêu cầu từ {transaction.requestedBy}:
                          </p>
                          <p className="text-xs text-orange-700">{transaction.requestReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="requests" className="space-y-4 mt-4">
                  {requestedTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`p-3 border rounded-lg ${
                        transaction.status === "edit_requested"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-xl">{getCategoryIcon(transaction.category, transaction.type)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{transaction.description}</h4>
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  transaction.status === "edit_requested"
                                    ? "border-yellow-500 text-yellow-700"
                                    : "border-red-500 text-red-700"
                                }`}
                              >
                                {transaction.status === "edit_requested" ? "Yêu cầu sửa" : "Yêu cầu xóa"}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              {transaction.category} • Yêu cầu từ {transaction.requestedBy} •{" "}
                              {formatShortDate(transaction.requestedAt || transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <p
                            className={`font-semibold text-sm ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent p-1 h-auto w-auto text-orange-500 hover:text-orange-600"
                            onClick={() => handleRequestEdit(transaction)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent p-1 h-auto w-auto text-red-500 hover:text-red-600"
                            onClick={() => handleRequestDelete(transaction)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {transaction.requestReason && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-xs font-medium text-orange-800 mb-1">Lý do yêu cầu:</p>
                          <p className="text-xs text-orange-700">{transaction.requestReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditTransactionDialog} onOpenChange={setShowEditTransactionDialog}>
        <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle>Yêu cầu sửa giao dịch</DialogTitle>
            <DialogDescription>
              Gửi yêu cầu sửa giao dịch cho người đã tạo. Thay đổi sẽ có hiệu lực sau khi được chấp nhận.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-description">Mô tả</Label>
                <Input
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-amount">Số tiền (VNĐ)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Loại giao dịch</Label>
                <Select value={editType} onValueChange={(value: "income" | "expense") => setEditType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Chi tiêu</SelectItem>
                    <SelectItem value="income">Thu nhập</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Danh mục</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEditCategories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-reason">Lý do sửa</Label>
                <Textarea
                  id="edit-reason"
                  placeholder="Ví dụ: Sai danh mục, số tiền không đúng..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConfirmEditRequest} className="flex-1">
                  Gửi yêu cầu sửa
                </Button>
                <Button variant="outline" onClick={() => setShowEditTransactionDialog(false)} className="flex-1">
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <Dialog open={showDeleteTransactionDialog} onOpenChange={setShowDeleteTransactionDialog}>
        <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle>Yêu cầu xóa giao dịch</DialogTitle>
            <DialogDescription>
              Gửi yêu cầu xóa giao dịch này cho người đã tạo. Giao dịch sẽ bị xóa sau khi được chấp nhận.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Bạn đang yêu cầu xóa giao dịch: <span className="font-semibold">{selectedTransaction.description}</span>{" "}
                ({formatCurrency(selectedTransaction.amount)})
              </p>
              <div>
                <Label htmlFor="delete-reason">Lý do xóa</Label>
                <Textarea
                  id="delete-reason"
                  placeholder="Ví dụ: Giao dịch trùng lặp, không hợp lệ..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleConfirmDeleteRequest} className="flex-1">
                  Gửi yêu cầu xóa
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteTransactionDialog(false)} className="flex-1">
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
