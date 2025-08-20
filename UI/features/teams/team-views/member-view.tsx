"use client"

import {
  Plus,
  FileText,
  TrendingUp,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Target,
  ChevronDown,
  Edit,
  Trash2,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleSwitcher } from "../components/role-switcher"
import type { Team, Transaction } from "../../../types/user"
import { expenseCategories, incomeCategories } from "../../../data/categories"
import { useMemo, useState } from "react"
import { DateFilterDialog } from "../../transactions/components/date-filter-dialog"
import { TransactionFilterDialog } from "../../transactions/components/transaction-filter-dialog"
import { Progress } from "@/components/ui/progress"
import { AddTransactionDialog } from "../../transactions/components/add-transaction-dialog"
import { EditTransactionDialog } from "../../transactions/components/edit-transaction-dialog"
import { QuickAddTransactionDialog } from "../../transactions/components/quick-add-transaction-dialog" // Import new dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type FilterType = "daily" | "weekly" | "monthly" | "annual" | "all-time"

interface MemberViewProps {
  team: Team
  onModeChange: (mode: any) => void
  allTransactions: Transaction[] // Pass all transactions for group reports
  onUpdateTransaction: (updatedTransaction: Transaction) => void // New prop
  onDeleteTransaction: (transactionId: string) => void // New prop
}

export function MemberView({
  team,
  onModeChange,
  allTransactions,
  onUpdateTransaction,
  onDeleteTransaction,
}: MemberViewProps) {
  // State for Group Date Filtering
  const [showDateFilterDialog, setShowDateFilterDialog] = useState(false)
  const [currentDateFilterType, setCurrentDateFilterType] = useState<FilterType>("monthly")
  const [currentDateFilterValue, setCurrentDateFilterValue] = useState<
    Date | { month: number; year: number } | { year: number } | undefined
  >(undefined)

  // State for Personal Date Filtering (NEW)
  const [showPersonalDateFilterDialog, setShowPersonalDateFilterDialog] = useState(false)
  const [personalDateFilterType, setPersonalDateFilterType] = useState<FilterType>("monthly")
  const [personalDateFilterValue, setPersonalDateFilterValue] = useState<
    Date | { month: number; year: number } | { year: number } | undefined
  >(undefined)

  // State for Transaction Filtering
  const [showTransactionFilterDialog, setShowTransactionFilterDialog] = useState(false)
  const [transactionFilters, setTransactionFilters] = useState({
    creators: [] as string[],
    categories: [] as string[],
    type: "all" as "all" | "income" | "expense",
  })
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("") // New state for transaction search
  const [myTransactionSearchTerm, setMyTransactionSearchTerm] = useState("") // New state for personal transaction search

  const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false)
  const [showEditTransactionDialog, setShowEditTransactionDialog] = useState(false) // New state for edit dialog
  const [selectedTransactionToEdit, setSelectedTransactionToEdit] = useState<Transaction | null>(null) // New state for selected transaction
  const [showQuickAddTransactionDialog, setShowQuickAddTransactionDialog] = useState(false) // New state for quick add dialog

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

  // Helper function to apply date filter to a given array of transactions
  const applyDateFilter = (
    transactions: Transaction[],
    filterType: FilterType,
    filterValue: Date | { month: number; year: number } | { year: number } | undefined,
  ) => {
    if (filterType === "all-time") return transactions

    return transactions.filter((t) => {
      const transactionDate = new Date(t.createdAt)
      if (filterType === "daily" && filterValue instanceof Date) {
        return (
          transactionDate.getDate() === filterValue.getDate() &&
          transactionDate.getMonth() === filterValue.getMonth() &&
          transactionDate.getFullYear() === filterValue.getFullYear()
        )
      } else if (filterType === "monthly" && filterValue && "month" in filterValue) {
        return transactionDate.getMonth() === filterValue.month && transactionDate.getFullYear() === filterValue.year
      } else if (filterType === "annual" && filterValue && "year" in filterValue) {
        return transactionDate.getFullYear() === filterValue.year
      }
      return true // Should not happen if filterType is not 'all-time'
    })
  }

  // Filter transactions based on date, transaction filters, and search term (for Group Reports)
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions

    // Apply group date filter
    filtered = applyDateFilter(filtered, currentDateFilterType, currentDateFilterValue)

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

    // Apply transaction search term
    if (transactionSearchTerm) {
      const lowerCaseSearchTerm = transactionSearchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          t.category.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }

    return filtered
  }, [allTransactions, currentDateFilterType, currentDateFilterValue, transactionFilters, transactionSearchTerm])

  // My transactions (for "Giao dịch của tôi" section and Personal Reports)
  const myTransactions = useMemo(() => {
    let personalFiltered = allTransactions.filter((t) => t.createdBy === "Phùng Đình") // Assuming "Phùng Đình" is the current user for this mock

    // Apply personal date filter
    personalFiltered = applyDateFilter(personalFiltered, personalDateFilterType, personalDateFilterValue)

    // Apply personal transaction search term
    if (myTransactionSearchTerm) {
      const lowerCaseSearchTerm = myTransactionSearchTerm.toLowerCase()
      personalFiltered = personalFiltered.filter(
        (t) =>
          t.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          t.category.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }

    return personalFiltered
  }, [allTransactions, personalDateFilterType, personalDateFilterValue, myTransactionSearchTerm])

  const myPendingRequests = myTransactions.filter((t) => t.status !== "approved")

  // Calculate personal financial data
  const myPersonalIncome = myTransactions
    .filter((t) => t.type === "income" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0)

  const myPersonalExpenses = myTransactions
    .filter((t) => t.type === "expense" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate personal income breakdown by category
  const myIncomeByCategory = myTransactions
    .filter((t) => t.type === "income" && t.status === "approved")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const myIncomeBreakdown = Object.entries(myIncomeByCategory)
    .map(([category, amount], index) => {
      const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"]
      return {
        category,
        percentage: Math.round((amount / myPersonalIncome) * 100),
        color: colors[index % colors.length],
      }
    })
    .filter((item) => item.percentage > 0)

  // Calculate personal expense breakdown by category
  const myExpensesByCategory = myTransactions
    .filter((t) => t.type === "expense" && t.status === "approved")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const myExpenseBreakdown = Object.entries(myExpensesByCategory)
    .map(([category, amount], index) => {
      const colors = ["#EF4444", "#F59E0B", "#06B6D4", "#84CC16", "#8B5CF6"]
      return {
        category,
        percentage: Math.round((amount / myPersonalExpenses) * 100),
        color: colors[index % colors.length],
      }
    })
    .filter((item) => item.percentage > 0)

  // Group totals based on filtered transactions (for group reports)
  const groupTotalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const groupTotalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const groupBalance = groupTotalIncome - groupTotalExpenses

  // Monthly revenue calculation based on team data (hardcoded for now, but would use filtered data)
  const monthlyGrowth = 18 // Hardcoded from image

  // Calculate progress percentages for group targets
  const incomeTarget = team.incomeTarget || 50000000 // Use team's target or default
  const budgetLimit = team.budgetLimit || 40000000 // Use team's budget or default
  const incomeProgress = (groupTotalIncome / incomeTarget) * 100
  const budgetProgress = (groupTotalExpenses / budgetLimit) * 100

  const handleAcceptRequest = (transactionId: string, requestType: "edit" | "delete") => {
    console.log(`Accept ${requestType} request for transaction:`, transactionId)
    toast.success(`Đã chấp nhận yêu cầu ${requestType} cho giao dịch ${transactionId}.`)
    // In a real app, you'd update the transaction status in your backend
    // For now, we'll just remove it from pending requests if it's a delete request
    // or mark it as approved if it's an edit request.
    if (requestType === "delete") {
      onDeleteTransaction(transactionId)
    } else {
      const transactionToUpdate = allTransactions.find((t) => t.id === transactionId)
      if (transactionToUpdate) {
        onUpdateTransaction({
          ...transactionToUpdate,
          status: "approved",
          requestedBy: undefined,
          requestReason: undefined,
          requestedAt: undefined,
        })
      }
    }
  }

  const handleRejectRequest = (transactionId: string) => {
    console.log("Reject request for transaction:", transactionId)
    toast.info(`Đã từ chối yêu cầu cho giao dịch ${transactionId}.`)
    // In a real app, you'd update the transaction status in your backend
    // For now, we'll just revert its status or remove the request details
    const transactionToUpdate = allTransactions.find((t) => t.id === transactionId)
    if (transactionToUpdate) {
      onUpdateTransaction({
        ...transactionToUpdate,
        status: "approved",
        requestedBy: undefined,
        requestReason: undefined,
        requestedAt: undefined,
      })
    }
  }

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransactionToEdit(transaction)
    setShowEditTransactionDialog(true)
  }

  const handleDeleteClick = (transactionId: string) => {
    // This will trigger the AlertDialog
    // The actual deletion logic is in handleConfirmDelete
  }

  const handleConfirmDelete = (transactionId: string) => {
    onDeleteTransaction(transactionId)
    toast.success("Giao dịch đã được xóa thành công!")
  }

  const handleAddTransaction = (transactionData: {
    type: "income" | "expense"
    date: Date
    description: string
    amount: number
    category: string
    note?: string
  }) => {
    console.log("Adding new transaction:", transactionData)
    // Simulate adding a new transaction
    const newTransaction: Transaction = {
      id: `temp-${Date.now()}`, // Generate a temporary ID
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      category: transactionData.category,
      createdBy: "Phùng Đình", // Mock current user
      status: "approved", // New transactions are approved by default
      createdAt: transactionData.date.toISOString().split("T")[0],
      note: transactionData.note,
    }
    onUpdateTransaction(newTransaction) // Use onUpdateTransaction to add it to the list
    toast.success("Giao dịch đã được thêm thành công!")
  }

  // Data for charts (matching image values) - these should ideally be derived from filteredTransactions
  const chartData = {
    generalIncome: groupTotalIncome, // Use filtered income
    generalExpense: groupTotalExpenses, // Use filtered expense
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

  const getDateFilterLabel = (
    filterType: FilterType,
    filterValue: Date | { month: number; year: number } | { year: number } | undefined,
  ) => {
    if (filterType === "all-time") return "Tất cả thời gian"
    if (filterType === "daily" && filterValue instanceof Date) {
      return `Ngày ${filterValue.getDate()}/${filterValue.getMonth() + 1}/${filterValue.getFullYear()}`
    }
    if (filterType === "monthly" && filterValue && "month" in filterValue) {
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
      return `${monthNames[filterValue.month]}, ${filterValue.year}`
    }
    if (filterType === "annual" && filterValue && "year" in filterValue) {
      return `Năm ${filterValue.year}`
    }
    return "Chọn thời gian"
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${team.color}`}></div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <Badge variant="secondary">{team.currentUserRole}</Badge>
            <RoleSwitcher
              teamName={team.name}
              actualRole={team.currentUserRole}
              currentMode={team.currentUserMode}
              onModeChange={onModeChange}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => setShowQuickAddTransactionDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhanh
          </Button>
          <Button size="sm" onClick={() => setShowAddTransactionDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm giao dịch
          </Button>
        </div>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu của tôi</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(myPersonalIncome)}</p>
                <p className="text-xs text-green-600 mt-1">Tháng này</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yêu cầu từ Admin</p>
                <p className="text-2xl font-bold text-orange-600">{myPendingRequests.length}</p>
                <p className="text-xs text-gray-600 mt-1">Cần xử lý</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Giao dịch bình thường</p>
                <p className="text-2xl font-bold text-blue-600">
                  {myTransactions.filter((t) => t.status === "approved").length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Đã được duyệt</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {team.canMembersViewReports && ( // Conditionally render "Số dư của nhóm"
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Số dư của nhóm</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(groupBalance)}</p>
                  <p className="text-xs text-gray-600 mt-1">Chỉ xem</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Personal Financial Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {" "}
          {/* Added flex container */}
          <h2 className="text-xl font-bold text-gray-900">Báo cáo tài chính cá nhân</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => setShowPersonalDateFilterDialog(true)}
            >
              {getDateFilterLabel(personalDateFilterType, personalDateFilterValue)}
              <ChevronDown className="w-4 h-4" />
            </Button>
            <DateFilterDialog
              isOpen={showPersonalDateFilterDialog}
              onOpenChange={setShowPersonalDateFilterDialog}
              onConfirm={(type, value) => {
                setPersonalDateFilterType(type)
                setPersonalDateFilterValue(value)
              }}
              initialFilterType={personalDateFilterType}
              initialDate={personalDateFilterValue instanceof Date ? personalDateFilterValue : new Date()}
            />
          </div>
        </div>

        {/* Personal Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Overview Bar Chart */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">Tổng quan</CardTitle>
            </CardHeader>
            <CardContent>
              {createBarChart(myPersonalIncome, myPersonalExpenses)}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Thu nhập</span>
                  <span className="font-semibold text-green-600">{formatCurrency(myPersonalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chi tiêu</span>
                  <span className="font-semibold text-red-600">{formatCurrency(myPersonalExpenses)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Income Donut Chart */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">Thu nhập theo danh mục</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center md:flex-row md:items-start gap-4">
              {createDonutChart(myIncomeBreakdown, 120)}
              <div className="flex-1 space-y-2">
                {myIncomeBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.category}</span>
                    <span className="text-gray-600">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Expenses Donut Chart */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">Chi tiêu theo danh mục</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center md:flex-row md:items-start gap-4">
              {createDonutChart(myExpenseBreakdown, 120)}
              <div className="flex-1 space-y-2">
                {myExpenseBreakdown.map((item, index) => (
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
      </div>

      {/* My Transactions with Requests */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Giao dịch của tôi</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm..."
                className="w-40 pl-10"
                value={myTransactionSearchTerm}
                onChange={(e) => setMyTransactionSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Lọc
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">Tất cả ({myTransactions.length})</TabsTrigger>
              <TabsTrigger value="requests">Yêu cầu ({myPendingRequests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {myTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-4 border rounded-lg ${
                    transaction.status === "edit_requested"
                      ? "bg-yellow-50 border-yellow-200"
                      : transaction.status === "delete_requested"
                        ? "bg-red-50 border-red-200"
                        : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{transaction.description}</h4>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                        {transaction.status !== "approved" && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              transaction.status === "edit_requested"
                                ? "border-yellow-500 text-yellow-700"
                                : "border-red-500 text-red-700"
                            }`}
                          >
                            {transaction.status === "edit_requested" ? "Yêu cầu sửa" : "Yêu cầu xóa"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{transaction.createdAt}</p>
                      {transaction.status === "approved" && (
                        <p className="text-xs text-green-600">Giao dịch bình thường</p>
                      )}
                      {transaction.requestReason && (
                        <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-sm font-medium text-orange-800 mb-1">
                            Yêu cầu từ {transaction.requestedBy}:
                          </p>
                          <p className="text-sm text-orange-700">{transaction.requestReason}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <p
                        className={`font-semibold text-lg ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.status === "approved" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                            onClick={() => handleEditClick(transaction)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn giao dịch này khỏi hệ
                                  thống.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleConfirmDelete(transaction.id)}>
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                  {transaction.status !== "approved" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleAcceptRequest(
                            transaction.id,
                            transaction.status === "edit_requested" ? "edit" : "delete",
                          )
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Chấp nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleRejectRequest(transaction.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Từ chối
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4 mt-4">
              {myPendingRequests.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-4 border rounded-lg ${
                    transaction.status === "edit_requested"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{transaction.description}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            transaction.status === "edit_requested"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-red-500 text-red-700"
                          }`}
                        >
                          {transaction.status === "edit_requested" ? "Yêu cầu sửa" : "Yêu cầu xóa"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Yêu cầu từ {transaction.requestedBy} • {transaction.requestedAt}
                      </p>
                      <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-sm font-medium text-orange-800 mb-1">Lý do yêu cầu:</p>
                        <p className="text-sm text-orange-700">{transaction.requestReason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-red-600">-{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        handleAcceptRequest(transaction.id, transaction.status === "edit_requested" ? "edit" : "delete")
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Chấp nhận {transaction.status === "edit_requested" ? "sửa" : "xóa"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleRejectRequest(transaction.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Group Reports Section (Conditional) */}
      {team.canMembersViewReports && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Báo cáo nhóm</h2>
          {/* Financial Overview - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Số dư hiện tại</p>
                    <p className={`text-2xl font-bold ${groupBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(groupBalance)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Tổng tích lũy</p>
                  </div>
                  <DollarSign className={`w-8 h-8 ${groupBalance >= 0 ? "text-green-600" : "text-red-600"}`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(groupTotalIncome)}</p>
                    <p className="text-xs text-green-600 mt-1">+{monthlyGrowth}% so với tháng trước</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* Removed "Yêu cầu đang chờ" card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(groupTotalExpenses)}</p>
                    <p className="text-xs text-gray-600 mt-1">Tháng này</p>
                  </div>
                  <Calendar className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan and Budget Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Target Card */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Mục tiêu thu nhập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mục tiêu:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(incomeTarget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hiện tại:</span>
                    <span className="font-semibold">{formatCurrency(groupTotalIncome)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tiến độ:</span>
                      <span className={`text-sm font-medium text-gray-700`}>{incomeProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={incomeProgress} className="h-3" />
                  </div>
                  <div className="text-sm text-gray-600">
                    Còn thiếu: {formatCurrency(incomeTarget - groupTotalIncome)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Limit Card */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Ngân sách chi tiêu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ngân sách:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(budgetLimit)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Đã chi:</span>
                    <span className="font-semibold">{formatCurrency(groupTotalExpenses)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sử dụng:</span>
                      <span className={`text-sm font-medium text-gray-700`}>{budgetProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={budgetProgress} className="h-3" />
                  </div>
                  <div className="text-sm text-gray-600">
                    Còn lại: {formatCurrency(budgetLimit - groupTotalExpenses)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Unified Reports and Transactions Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Báo cáo & Lịch sử giao dịch nhóm</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => setShowDateFilterDialog(true)}
                >
                  {getDateFilterLabel(currentDateFilterType, currentDateFilterValue)}
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
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm giao dịch..."
                        className="w-60 pl-10"
                        value={transactionSearchTerm}
                        onChange={(e) => setTransactionSearchTerm(e.target.value)}
                      />
                    </div>
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
                    <TabsList className="grid w-full grid-cols-1">
                      {" "}
                      {/* Changed to grid-cols-1 */}
                      <TabsTrigger value="all">
                        Tất cả ({filteredTransactions.filter((t) => t.status === "approved").length})
                      </TabsTrigger>
                      {/* Removed "Đã yêu cầu" tab */}
                    </TabsList>

                    <TabsContent value="all" className="space-y-4 mt-4">
                      {filteredTransactions
                        .filter((t) => t.status === "approved")
                        .map((transaction) => (
                          <div key={transaction.id} className={`p-3 border rounded-lg bg-white hover:bg-gray-50`}>
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
                                      <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                                        Chi
                                      </Badge>
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                                  onClick={() => handleEditClick(transaction)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn giao dịch này
                                        khỏi hệ thống.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleConfirmDelete(transaction.id)}>
                                        Xóa
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        ))}
                    </TabsContent>

                    {/* Removed "requests" tab content */}
                  </Tabs>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        isOpen={showAddTransactionDialog}
        onOpenChange={setShowAddTransactionDialog}
        onAddTransaction={handleAddTransaction}
      />
      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        isOpen={showEditTransactionDialog}
        onOpenChange={setShowEditTransactionDialog}
        transaction={selectedTransactionToEdit}
        onSaveTransaction={onUpdateTransaction}
      />
      {/* Quick Add Transaction Dialog */}
      <QuickAddTransactionDialog
        isOpen={showQuickAddTransactionDialog}
        onOpenChange={setShowQuickAddTransactionDialog}
        onQuickAddTransaction={handleAddTransaction} // Re-use existing add transaction logic
      />
    </div>
  )
}
