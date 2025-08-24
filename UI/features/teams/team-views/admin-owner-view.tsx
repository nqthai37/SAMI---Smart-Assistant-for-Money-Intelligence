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
  Banknote,
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
import { toast } from "sonner"
// Giả định bạn có một client API đã được cấu hình
import { api } from "@/lib/api" 
import { useRouter } from "next/navigation"

type FilterType = "daily" | "weekly" | "monthly" | "annual" | "all-time"

interface TeamWithCategories extends Team {
  categories?: { name: string; icon: string }[];
}

interface AdminOwnerViewProps {
  team: TeamWithCategories
  onModeChange: (mode: any) => void
  onUpdateTeam: (updatedTeam: Team) => void
  allTransactions: Transaction[]
  onUpdateTransaction: (updatedTransaction: Transaction) => void
  onDeleteTransaction: (transactionId: string) => void
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
  const isOwner = team.currentUserRole === "owner"
  const router = useRouter()

  // States
  const [showDateFilterDialog, setShowDateFilterDialog] = useState(false)
  const [currentDateFilterType, setCurrentDateFilterType] = useState<FilterType>("monthly")
  const [currentDateFilterValue, setCurrentDateFilterValue] = useState<
    Date | { month: number; year: number } | { year: number } | undefined
  >({ month: new Date().getMonth(), year: new Date().getFullYear() })
  const [showTransactionFilterDialog, setShowTransactionFilterDialog] = useState(false)
  const [transactionFilters, setTransactionFilters] = useState({
    creators: [] as string[],
    categories: [] as string[],
    type: "all" as "all" | "income" | "expense",
  })
  const [showAIChatDialog, setShowAIChatDialog] = useState(false)
  const [aiChatInput, setAiChatInput] = useState("")
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: "user" | "ai"; text: string; timestamp: string }[]>([])
  const [newIncomeTarget, setNewIncomeTarget] = useState("")
  const [newBudgetLimit, setNewBudgetLimit] = useState("")
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [showDeleteTeamConfirmDialog, setShowDeleteTeamConfirmDialog] = useState(false)
  const [showEditTransactionDialog, setShowEditTransactionDialog] = useState(false)
  const [showDeleteTransactionDialog, setShowDeleteTransactionDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editType, setEditType] = useState<"income" | "expense">("expense")
  const [editReason, setEditReason] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  // --- UTILS ---
  const getTeamCategories = (type: "income" | "expense") => {
    if (!team?.categories || team.categories.length === 0) {
      // SỬA: Fallback categories nếu team chưa có
      const defaultExpense = [
        { name: "Ăn uống", icon: "🍽️" },
        { name: "Di chuyển", icon: "🚗" },
        { name: "Mua sắm", icon: "🛒" },
        { name: "Giải trí", icon: "🎬" },
        { name: "Sức khỏe", icon: "🏥" },
        { name: "Khác", icon: "📦" }
      ];
      
      const defaultIncome = [
        { name: "Lương", icon: "💰" },
        { name: "Thưởng", icon: "🎁" },
        { name: "Đầu tư", icon: "📈" },
        { name: "Bán hàng", icon: "🛍️" },
        { name: "Khác", icon: "💵" }
      ];
      
      return type === "expense" ? defaultExpense : defaultIncome;
    }

    // SỬA: Parse team categories nếu là JSON string
    let categories;
    try {
      categories = typeof team.categories === 'string' 
        ? JSON.parse(team.categories) 
        : team.categories;
    } catch {
      categories = [];
    }

    // SỬA: Filter theo type nếu có
    return categories.filter(cat => {
      if ('type' in cat) {
        return cat.type === type;
      }
      return true; // Show all if no type specified
    });
  };
  const formatCurrency = (amount: number, currencyCode: string = "VND") => {
    console.log({amount, currencyCode})
    return new Intl.NumberFormat("vi-VN", { 
      style: "currency", 
      currency: currencyCode 
    }).format(amount);
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const shortenName = (name: string) => {
    const parts = (name || "").split(" ")
    if (parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`
    return name
  }

  const getCategoryIcon = (categoryName: string, type: "expense" | "income") => {
    const categories = getTeamCategories(type);
    const category = categories.find((cat) => cat.name === categoryName);
    return category?.icon || "📦";
  };

  // --- DATA PROCESSING ---
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions
    if (currentDateFilterType === "daily" && currentDateFilterValue instanceof Date) {
      filtered = filtered.filter((t) => new Date(t.createdAt).toDateString() === currentDateFilterValue.toDateString())
    } else if (currentDateFilterType === "monthly" && currentDateFilterValue && "month" in currentDateFilterValue) {
      filtered = filtered.filter((t) => {
        const d = new Date(t.createdAt)
        return d.getMonth() === currentDateFilterValue.month && d.getFullYear() === currentDateFilterValue.year
      })
    } else if (currentDateFilterType === "annual" && currentDateFilterValue && "year" in currentDateFilterValue) {
      filtered = filtered.filter((t) => new Date(t.createdAt).getFullYear() === currentDateFilterValue.year)
    }

    if (transactionFilters.creators.length > 0) {
      filtered = filtered.filter((t) => transactionFilters.creators.includes(t.createdBy))
    }
    if (transactionFilters.categories.length > 0) {
      filtered = filtered.filter((t) => transactionFilters.categories.includes(t.categoryName))
    }
    if (transactionFilters.type !== "all") {
      filtered = filtered.filter((t) => t.type === transactionFilters.type)
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((t) => {
        return (
          t.description?.toLowerCase().includes(query) ||
          t.categoryName?.toLowerCase().includes(query) ||
          t.createdBy?.toLowerCase().includes(query) ||
          t.amount.toString().includes(query)
      )
    })
    }

    return filtered
  }, [allTransactions, currentDateFilterType, currentDateFilterValue, transactionFilters, searchQuery])

  const requestedTransactions = filteredTransactions.filter((t) => t.status !== "approved")

  const currentTotalIncome = useMemo(() => 
    filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [filteredTransactions]
  )
  
  const currentTotalExpenses = useMemo(() =>
    filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0),
    [filteredTransactions]
  )

  const currentBalance = currentTotalIncome - currentTotalExpenses

  const unfilteredTotalIncome = useMemo(() => 
    allTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
    [allTransactions]
 );

 const unfilteredTotalExpenses = useMemo(() =>
    allTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
    [allTransactions]
 );
  const { currentMonthIncome, monthlyGrowth } = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // SỬA: Tạo object Date mới cho lastMonth thay vì modify `now`
    const lastMonthDate = new Date(now) // Clone object
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
    const lastMonth = lastMonthDate.getMonth()
    const lastMonthYear = lastMonthDate.getFullYear()
  
    console.log('📅 Date calculation:', {
      currentMonth: currentMonth + 1, // +1 để hiển thị human-readable
      currentYear,
      lastMonth: lastMonth + 1,
      lastMonthYear
    });
  
    const currentMonthIncome = allTransactions
      .filter(t => {
        const d = new Date(t.createdAt)
        const tMonth = d.getMonth()
        const tYear = d.getFullYear()
        
        // SỬA: Debug từng transaction
        const isCurrentMonth = t.type === "income" && tMonth === currentMonth && tYear === currentYear;
        if (isCurrentMonth) {
          console.log('💰 Current month income transaction:', {
            description: t.description,
            amount: t.amount,
            date: t.createdAt,
            month: tMonth + 1,
            year: tYear
          });
        }
        
        return isCurrentMonth;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0)
      
    const lastMonthIncome = allTransactions
      .filter(t => {
        const d = new Date(t.createdAt)
        const tMonth = d.getMonth()
        const tYear = d.getFullYear()
        
        // SỬA: Debug last month transactions
        const isLastMonth = t.type === "income" && tMonth === lastMonth && tYear === lastMonthYear;
        if (isLastMonth) {
          console.log('💰 Last month income transaction:', {
            description: t.description,
            amount: t.amount,
            date: t.createdAt,
            month: tMonth + 1,
            year: tYear
          });
        }
        
        return isLastMonth;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0)
  
    console.log('📊 Monthly income calculation:', {
      currentMonthIncome,
      lastMonthIncome,
      currentMonthTransactionCount: allTransactions.filter(t => {
        const d = new Date(t.createdAt)
        return t.type === "income" && d.getMonth() === currentMonth && d.getFullYear() === currentYear
      }).length,
      lastMonthTransactionCount: allTransactions.filter(t => {
        const d = new Date(t.createdAt)
        return t.type === "income" && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
      }).length
    });
  
    const growth = lastMonthIncome === 0 
      ? (currentMonthIncome > 0 ? 100 : 0)
      : ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
      
    return { currentMonthIncome, monthlyGrowth: growth }
  }, [allTransactions])

  const incomeProgress = Math.min((unfilteredTotalIncome / (team.incomeGoal || 1)) * 100, 100)
  const budgetProgress = Math.min((unfilteredTotalExpenses / (team.budget || 1)) * 100, 100)

  // --- DYNAMIC CHART DATA CALCULATION ---

  const calculateCategoryBreakdown = (transactions: Transaction[], type: "income" | "expense") => {
    const total = transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    if (total === 0) return []

    const categoryMap = new Map<string, number>()
    transactions
      .filter(t => t.type === type)
      .forEach(t => {
        const categoryKey = t.categoryName || 'Không phân loại';
      categoryMap.set(categoryKey, (categoryMap.get(categoryKey) || 0) + Number(t.amount))
      })
    
    const colors = ["#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#F59E0B", "#06B6D4"]
    let colorIndex = 0

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        percentage: (amount / total) * 100,
        color: colors[colorIndex++ % colors.length]
      }))
      .sort((a, b) => b.percentage - a.percentage)
  }

  const incomeBreakdown = useMemo(() => calculateCategoryBreakdown(filteredTransactions, "income"), [filteredTransactions])
  const expenseBreakdown = useMemo(() => calculateCategoryBreakdown(filteredTransactions, "expense"), [filteredTransactions])
  
  const yearlyTrend = useMemo(() => {
    const trend: { month: string; income: number; expense: number }[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = d.getMonth()
      const year = d.getFullYear()
      
      const monthTransactions = allTransactions.filter(t => {
        const tDate = new Date(t.createdAt)
        return tDate.getMonth() === month && tDate.getFullYear() === year
      })

      const income = monthTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)
      const expense = monthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)
      
      trend.push({ month: `T${month + 1}`, income, expense })
    }
    return trend
  }, [allTransactions])

  // --- HANDLERS ---
  
  const handleRequestEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setEditDescription(transaction.description)
    setEditAmount(transaction.amount.toString())
    setEditCategory(transaction.category)
    setEditType(transaction.type)
    setEditReason("")
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
      onUpdateTransaction(updatedTransaction) // Optimistic update
      // await requestEditTransactionAPI(...) // Call real API
      toast.success("Yêu cầu sửa giao dịch đã được gửi!")
      setShowEditTransactionDialog(false)
    } else {
      toast.error("Vui lòng nhập lý do sửa giao dịch.")
    }
  }

  const handleRequestDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDeleteReason("")
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
      onUpdateTransaction(updatedTransaction) // Optimistic update
      // await requestDeleteTransactionAPI(...) // Call real API
      toast.success("Yêu cầu xóa giao dịch đã được gửi!")
      setShowDeleteTransactionDialog(false)
    } else {
      toast.error("Vui lòng nhập lý do xóa giao dịch.")
    }
  }
  
  // Các hàm này cần client API thực tế
  const handleSetIncomeTarget = async () => {
    if (newIncomeTarget) {
      try {
        await api.patch(`/teams/${team.id}/income-goal`, { target: Number(newIncomeTarget) });
        onUpdateTeam({ ...team, incomeGoal: Number(newIncomeTarget) });
        toast.success("Mục tiêu thu nhập đã được cập nhật!");
        setShowPlanDialog(false)
        setNewIncomeTarget("")
      } catch (error: any) {
        toast.error("Lỗi: " + (error.response?.data?.message || error.message));
      }
    }
  }

  const handleSetBudgetLimit = async () => {
    if (newBudgetLimit) {
      try {
        await api.patch(`/teams/${team.id}/budget`, { amount: Number(newBudgetLimit) });
        onUpdateTeam({ ...team, budget: Number(newBudgetLimit) });
        toast.success("Ngân sách đã được cập nhật!");
        setShowBudgetDialog(false)
        setNewBudgetLimit("")
      } catch (error: any) {
        toast.error("Lỗi: " + (error.response?.data?.message || error.message));
      }
    }
  }

  const handleToggleMemberReportsView = async () => {
    try {
      const newPermission = !team.allowMemberViewReport;
      await api.patch(`/teams/${team.id}/report-permission`, { allow: newPermission });
      onUpdateTeam({ ...team, allowMemberViewReport: newPermission });
      toast.success(newPermission ? "Đã cho phép thành viên xem báo cáo" : "Đã thu hồi quyền xem báo cáo");
    } catch (error: any) {
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    }
  }

  const handleConfirmDeleteTeam = async () => {
    try {
      const tmpName = team.teamName;
      await api.delete(`/teams/${team.id}`);
      
      setShowDeleteTeamConfirmDialog(false);
      toast.success(`Nhóm "${tmpName}" đã được xóa.`, {
        duration: 2000,
      });
      setTimeout(() => {
        window.location.replace('/'); // Replace history entry
      }, 2000);
      
    } catch (error: any) {
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    }
  }

  const handleAIChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (aiChatInput.trim()) {
      setAiChatMessages((prev) => [
        ...prev,
        { sender: "user", text: aiChatInput, timestamp: new Date().toLocaleTimeString() },
        { sender: "ai", text: "Tính năng này đang được phát triển. Vui lòng thử lại sau!", timestamp: new Date().toLocaleTimeString() },
      ])
      setAiChatInput("")
    }
  }

  // --- CHART RENDERING ---
  // Các hàm create...Chart không thay đổi vì chúng chỉ là helper để render SVG
  // Chúng sẽ nhận dữ liệu động đã được tính toán ở trên.
  
    // Helper to create Bar Chart SVG for General
    const createBarChart = (income: number, expense: number) => {
        const maxVal = Math.max(income, expense, 1) // Tránh chia cho 0
        const incomeHeight = (income / maxVal) * 96 // Max height 96px
        const expenseHeight = (expense / maxVal) * 96 // Max height 96px

        return (
          <div className="flex items-end justify-center gap-8 h-32 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-12 rounded-t-lg bg-green-500" style={{ height: `${incomeHeight}px` }}></div>
              <span className="text-sm text-gray-600 mt-2">Thu nhập</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 rounded-t-lg bg-red-500" style={{ height: `${expenseHeight}px` }}></div>
              <span className="text-sm text-gray-600 mt-2">Chi tiêu</span>
            </div>
          </div>
        )
    }

    // Helper to create Donut Chart SVG
    const createDonutChart = (data: { category: string; percentage: number; color: string }[], size = 120) => {
        if (!data || data.length === 0) {
            return <div style={{width: size, height: size}} className="flex items-center justify-center text-gray-400 text-sm">Không có dữ liệu</div>
        }
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
        const width = 1100
        const height = 300
        const padding = 60
        const chartWidth = width - padding * 2
        const chartHeight = height - padding * 2

        const maxIncome = Math.max(...yearlyTrend.map(d => d.income))
        const maxExpense = Math.max(...yearlyTrend.map(d => d.expense))
        const maxChartValue = Math.max(maxIncome, maxExpense, 1) // Lấy giá trị lớn nhất, tránh 0

        const yAxisSteps = 4
        const yAxisValues = Array.from({ length: yAxisSteps + 1 }, (_, i) => (maxChartValue / yAxisSteps) * i)
        
        const incomePoints = yearlyTrend
        .map((d, i) => {
            const x = padding + (i * chartWidth) / (yearlyTrend.length - 1)
            const y = padding + chartHeight - (d.income / maxChartValue) * chartHeight
            return `${x},${y}`
        })
        .join(" ")

        const expensePoints = yearlyTrend
        .map((d, i) => {
            const x = padding + (i * chartWidth) / (yearlyTrend.length - 1)
            const y = padding + chartHeight - (d.expense / maxChartValue) * chartHeight
            return `${x},${y}`
        })
        .join(" ")

        return (
        <div className="w-full overflow-x-auto">
            <svg width={width} height={height} className="min-w-full">
            {/* Grid lines & Y-axis labels */}
            {yAxisValues.map((value, i) => {
                const y = padding + chartHeight - (i / yAxisSteps) * chartHeight
                const label = value === 0 ? "0" : value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`
                return (
                <g key={`y-grid-label-${i}`}>
                    { i > 0 && <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E5E7EB" strokeWidth="1" />}
                    <text x={padding - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-600 font-medium">
                    {label}
                    </text>
                </g>
                )
            })}
            
            <line x1={padding} y1={padding} x2={padding} y2={padding + chartHeight} stroke="#6B7280" strokeWidth="2" />
            <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="#6B7280" strokeWidth="2" />

            {/* Lines and Points */}
            <polyline points={incomePoints} fill="none" stroke="#10B981" strokeWidth="3" />
            <polyline points={expensePoints} fill="none" stroke="#EF4444" strokeWidth="3" />
            {yearlyTrend.map((d, i) => {
                const x = padding + (i * chartWidth) / (yearlyTrend.length - 1)
                const yIncome = padding + chartHeight - (d.income / maxChartValue) * chartHeight
                const yExpense = padding + chartHeight - (d.expense / maxChartValue) * chartHeight
                return (
                <g key={`points-${i}`}>
                    <circle cx={x} cy={yIncome} r="4" fill="#10B981" />
                    <circle cx={x} cy={yExpense} r="4" fill="#EF4444" />
                </g>
                )
            })}
            
            {/* X-axis labels */}
            {yearlyTrend.map((d, i) => {
                const x = padding + (i * chartWidth) / (yearlyTrend.length - 1)
                return (
                <text key={`label-${i}`} x={x} y={height - 15} textAnchor="middle" className="text-xs fill-gray-600 font-medium">
                    {d.month}
                </text>
                )
            })}
            {/* Axis titles */}
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

  const availableEditCategories = editType === "expense" ? expenseCategories : incomeCategories

  // --- JSX RETURN ---
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 space-y-4">
        {/* SỬA: Dòng 1 - Chỉ team info */}
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full bg-blue-500 flex-shrink-0`}></div>
          <h1 className="text-2xl font-bold text-gray-900">{team.teamName}</h1>
          <Badge variant="secondary" className="flex-shrink-0">{team.currentUserRole}</Badge>
        </div>
        
        {/* SỬA: Dòng 2 - RoleSwitcher + Action buttons cùng dòng */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* RoleSwitcher bên trái */}
          <div className="flex-shrink-0">
            <RoleSwitcher
              teamName={team.teamName}
              actualRole={team.currentUserRole}
              currentMode={team.currentUserMode || team.currentUserRole}
              onModeChange={onModeChange}
            />
          </div>
          
          {/* Action buttons bên phải */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className={team.allowMemberViewReport ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
              onClick={handleToggleMemberReportsView}
            >
              {team.allowMemberViewReport ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              {team.allowMemberViewReport ? "Cho phép xem báo cáo" : "Không cho phép xem"}
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
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa nhóm
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Xác nhận xóa nhóm</DialogTitle>
                    <DialogDescription>
                      Bạn có chắc muốn xóa nhóm "{team.teamName}"? Hành động này không thể hoàn tác.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 pt-4">
                    <Button variant="destructive" onClick={handleConfirmDeleteTeam} className="flex-1">Xác nhận</Button>
                    <Button variant="outline" onClick={() => setShowDeleteTeamConfirmDialog(false)} className="flex-1">Hủy</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Số dư hiện tại</p>
                <p className={`text-2xl font-bold ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(currentBalance, team.currency)}</p>
                <p className="text-xs text-gray-600 mt-1">Tổng tích lũy</p>
              </div>
              <Banknote className={`w-8 h-8 ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentMonthIncome, team.currency)}</p>
                <p className={`text-xs mt-1 ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}% so với tháng trước
                </p>
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

      {/* Plan and Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-700 flex items-center gap-2"><Target className="w-5 h-5" /> Mục tiêu thu nhập</CardTitle>
            <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-transparent"><Edit className="w-4 h-4 mr-2" /> Chỉnh sửa</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Đặt mục tiêu thu nhập</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="income-target">Mục tiêu (VNĐ)</Label>
                            <Input id="income-target" type="number" value={newIncomeTarget} onChange={(e) => setNewIncomeTarget(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSetIncomeTarget} className="flex-1">Lưu</Button>
                            <Button variant="outline" onClick={() => setShowPlanDialog(false)} className="flex-1">Hủy</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Mục tiêu:</span><span className="font-semibold text-green-600">{formatCurrency(team.incomeGoal || 0)}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Hiện tại:</span><span className="font-semibold">{formatCurrency(unfilteredTotalIncome)}</span></div>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Tiến độ:</span><span className={`text-sm font-medium text-gray-700`}>{incomeProgress.toFixed(0)}%</span></div>
                <Progress value={incomeProgress} className="h-3" />
              </div>
              
              {/* SỬA: Thêm thông báo khi đạt mục tiêu */}
              {incomeProgress >= 100 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800">🎉 Chúc mừng! Đã hoàn thành mục tiêu thu nhập</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Vượt mục tiêu: {formatCurrency(unfilteredTotalIncome - (team.incomeGoal || 0), team.currency)}
                  </p>
                </div>
              ) : incomeProgress >= 80 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-yellow-800">🚀 Sắp đạt mục tiêu!</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    Còn thiếu: {formatCurrency(Math.max(0, (team.incomeGoal || 0) - unfilteredTotalIncome), team.currency)}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-gray-600">Còn thiếu: {formatCurrency(Math.max(0, (team.incomeGoal || 0) - unfilteredTotalIncome))}</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-red-700 flex items-center gap-2"><Calendar className="w-5 h-5" /> Ngân sách chi tiêu</CardTitle>
            <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-transparent"><Edit className="w-4 h-4 mr-2" /> Chỉnh sửa</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Đặt ngân sách chi tiêu</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="budget-limit">Ngân sách (VNĐ)</Label>
                            <Input id="budget-limit" type="number" value={newBudgetLimit} onChange={(e) => setNewBudgetLimit(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSetBudgetLimit} className="flex-1">Lưu</Button>
                            <Button variant="outline" onClick={() => setShowBudgetDialog(false)} className="flex-1">Hủy</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Ngân sách:</span><span className="font-semibold text-red-600">{formatCurrency(team.budget || 0)}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Đã chi:</span><span className="font-semibold">{formatCurrency(unfilteredTotalExpenses)}</span></div>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Sử dụng:</span><span className={`text-sm font-medium text-gray-700`}>{budgetProgress.toFixed(0)}%</span></div>
                <Progress value={budgetProgress} className="h-3" />
              </div>
              
              {/* SỬA: Thêm cảnh báo ngân sách */}
              {budgetProgress >= 100 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">⚠️ Đã vượt ngân sách!</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    Vượt quá: {formatCurrency(unfilteredTotalExpenses - (team.budget || 0))}
                  </p>
                </div>
              ) : budgetProgress >= 90 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-800">⚠️ Gần hết ngân sách!</span>
                  </div>
                  <p className="text-xs text-orange-600 mt-1">
                    Còn lại: {formatCurrency(Math.max(0, (team.budget || 0) - unfilteredTotalExpenses))}
                  </p>
                </div>
              ) : budgetProgress >= 75 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-800">💡 Cần chú ý chi tiêu</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    Còn lại: {formatCurrency(Math.max(0, (team.budget || 0) - unfilteredTotalExpenses))}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-gray-600">Còn lại: {formatCurrency(Math.max(0, (team.budget || 0) - currentTotalExpenses))}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports and Transactions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Báo cáo </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <Card className="border-purple-100">
                <CardHeader><CardTitle className="text-purple-800">Biểu đồ thu chi 12 tháng qua</CardTitle></CardHeader>
                <CardContent>{createLineChart()}</CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-blue-100">
                    <CardHeader><CardTitle className="text-blue-800">Tổng quan</CardTitle></CardHeader>
                    <CardContent>
                        {createBarChart(currentTotalIncome, currentTotalExpenses)}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Thu nhập</span><span className="font-semibold text-green-600">{formatCurrency(currentTotalIncome)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Chi tiêu</span><span className="font-semibold text-red-600">{formatCurrency(currentTotalExpenses)}</span></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-blue-100">
                    <CardHeader><CardTitle className="text-blue-800">Thu nhập theo danh mục</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center md:flex-row md:items-start gap-4">
                        {createDonutChart(incomeBreakdown, 120)}
                        <div className="flex-1 space-y-2">
                            {incomeBreakdown.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span>{item.category}</span>
                                    </div>
                                    <span className="text-gray-600">{item.percentage.toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-blue-100">
                    <CardHeader><CardTitle className="text-blue-800">Chi tiêu theo danh mục</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center md:flex-row md:items-start gap-4">
                        {createDonutChart(expenseBreakdown, 120)}
                         <div className="flex-1 space-y-2">
                            {expenseBreakdown.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                     <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span>{item.category}</span>
                                    </div>
                                    <span className="text-gray-600">{item.percentage.toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lịch sử giao dịch</CardTitle>
              <div className="flex items-center gap-2">
              <Input 
                placeholder="Tìm kiếm giao dịch..." 
                className="w-60" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowDateFilterDialog(true)}
                            className="flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            {getDateFilterLabel(currentDateFilterType, currentDateFilterValue)}
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          
                          {/* SỬA: Transaction Filter Button với tên khác */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowTransactionFilterDialog(true)}
                            className="flex items-center gap-2"
                          >
                            <Filter className="w-4 h-4" />
                            Bộ lọc
                          </Button>
                          
                          {/* Date Filter Dialog */}
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
                <TransactionFilterDialog
                  isOpen={showTransactionFilterDialog}
                  onOpenChange={setShowTransactionFilterDialog}
                  onApplyFilters={setTransactionFilters}
                  initialFilters={transactionFilters}
                  allTransactions={allTransactions}
                  team={team}
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
                          <div className="text-xl">{getCategoryIcon(transaction.categoryName, transaction.type)}</div>
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
                              {transaction.categoryName} • {shortenName(transaction.createdBy)} •{" "}
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
                  {availableEditCategories.length > 0 ? (
                    availableEditCategories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      <span className="text-gray-400">Không có danh mục nào</span>
                    </SelectItem>
                  )}
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
