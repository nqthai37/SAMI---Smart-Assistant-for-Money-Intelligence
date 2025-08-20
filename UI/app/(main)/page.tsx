"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Calendar, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import type { Team, UserMode, Transaction } from "@/types/user"
import { toast } from "sonner"

// ĐÃ SỬA LẠI ĐƯỜNG DẪN IMPORT
import { AdminOwnerView } from "@/features/teams/team-views/admin-owner-view"
import { DeputyView } from "@/features/teams/team-views/deputy-view"
import { MemberView } from "@/features/teams/team-views/member-view"
import { CreateTeamDialog } from "@/features/teams/components/create-team-dialog"

// DỮ LIỆU GIẢ - Sẽ được thay thế bằng API call trong useEffect
const mockTeams: Team[] = [
	{
		id: "1",
		name: "CLB Công Nghệ",
		description: "Quản lý chi tiêu CLB",
		color: "bg-green-500",
		totalIncome: 5000000,
		totalExpenses: 2450000,
		currentUserRole: "Admin",
		currentUserMode: "Admin",
		updatedAt: "2024-12-12",
	},
	{
		id: "2",
		name: "Du lịch Vũng Tàu",
		description: "Chi tiêu chuyến đi",
		color: "bg-orange-500",
		totalIncome: 60000000,
		totalExpenses: 8750000,
		currentUserRole: "Owner",
		currentUserMode: "Owner",
		updatedAt: "2024-12-12",
	},
]
const mockTransactions: Transaction[] = [
	{
		id: "1",
		description: "Mua thiết bị",
		amount: 500000,
		type: "expense",
		category: "Thiết bị",
		createdBy: "Nguyễn A",
		status: "approved",
		createdAt: "2024-12-12",
	},
	{
		id: "2",
		description: "Thu nhập dự án X",
		amount: 2000000,
		type: "income",
		category: "Dịch vụ",
		createdBy: "Trần B",
		status: "approved",
		createdAt: "2024-12-11",
	},
]

export default function MainPage() {
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
	const [currentView, setCurrentView] = useState<"list" | "team">("list")
	const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false)
	const [searchTerm, setSearchTerm] = useState("")
	const { user } = useAuth()

	// STATE THẬT - Dữ liệu sẽ được load từ API
	const [teams, setTeams] = useState<Team[]>([])
	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// TODO: Gọi API để lấy danh sách team và transaction ở đây
		// Ví dụ:
		// const fetchTeams = async () => {
		//   try {
		//     const data = await getTeamsAPI(token);
		//     setTeams(data);
		//   } catch (error) {
		//     toast.error("Không thể tải danh sách nhóm.");
		//   } finally {
		//     setIsLoading(false);
		//   }
		// }
		// fetchTeams();
		setTeams(mockTeams) // Tạm thời dùng dữ liệu giả
		setTransactions(mockTransactions)
		setIsLoading(false)
	}, [])

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
	const calculateBalance = (income: number, expenses: number) => income - expenses

	const handleTeamClick = (team: Team) => {
		setSelectedTeam(team)
		setCurrentView("team")
	}

	const handleBackToList = () => {
		setCurrentView("list")
		setSelectedTeam(null)
	}

	// ... (các hàm handle khác như handleCreateTeam, handleModeChange...)

	const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase()))

	if (isLoading) {
		return <div>Đang tải dữ liệu...</div>
	}

	// RENDER VIEW DANH SÁCH TEAM
	if (currentView === "list") {
		return (
			<div>
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-gray-900">Nhóm của tôi</h1>
					<Button size="sm" onClick={() => setShowCreateTeamDialog(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Tạo nhóm mới
					</Button>
				</div>
				<div className="relative mb-6 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<Input
						placeholder="Tìm kiếm nhóm..."
						className="pl-10"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<div className="grid gap-4">
					{filteredTeams.map((team) => (
						<Card
							key={team.id}
							className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => handleTeamClick(team)}
						>
							<CardContent className="p-6">
								{/* ... JSX for team card item ... */}
							</CardContent>
						</Card>
					))}
				</div>
				<CreateTeamDialog
					isOpen={showCreateTeamDialog}
					onOpenChange={setShowCreateTeamDialog}
					onCreateTeam={() => {}}
				/>
			</div>
		)
	}

	// RENDER VIEW CHI TIẾT TEAM
	if (currentView === "team" && selectedTeam) {
		return (
			<div>
				<Button variant="ghost" onClick={handleBackToList} className="mb-4">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Quay lại danh sách
				</Button>
				{/* Render view tương ứng với vai trò */}
				{selectedTeam.currentUserMode === "Owner" || selectedTeam.currentUserMode === "Admin" ? (
					<AdminOwnerView
						team={selectedTeam}
						onModeChange={() => {}}
						onUpdateTeam={() => {}}
					/>
				) : selectedTeam.currentUserMode === "Deputy" ? (
					<DeputyView team={selectedTeam} onModeChange={() => {}} />
				) : (
					<MemberView team={selectedTeam} onModeChange={() => {}} />
				)}
			</div>
		)
	}

	return null
}
