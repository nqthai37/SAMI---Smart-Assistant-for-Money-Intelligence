"use client"

import React, { useState, useEffect } from "react"
import { Search, Plus, ArrowLeft, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import type { Team, TeamDetails, UserMode, Transaction } from "@/types/user"
import { AdminOwnerView } from "@/features/teams/team-views/admin-owner-view"
import { DeputyView } from "@/features/teams/team-views/deputy-view"
import { MemberView } from "@/features/teams/team-views/member-view"
import { CreateTeamDialog } from "@/features/teams/components/create-team-dialog"
import { api } from "@/lib/api"
import MainLayout from "@/components/layouts/MainLayout"

export default function Homepage() {
  const [selectedTeam, setSelectedTeam] = useState<TeamDetails | null>(null)
  const [currentView, setCurrentView] = useState<"list" | "team">("list")
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  const [teams, setTeams] = useState<Team[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTeamLoading, setIsTeamLoading] = useState(false)

  useEffect(() => {
    if (user) fetchInitialData()
  }, [user])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const teamsResponse = await api.get("/user/teams")
      setTeams(teamsResponse.data || [])
    } catch (error: any) {
      toast.error("Không thể tải danh sách nhóm: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeamClick = async (team: Team) => {
    setCurrentView("team")
    setIsTeamLoading(true)
    try {
      const [detailsResponse, transactionsResponse] = await Promise.allSettled([
        api.get(`/teams/${team.id}/details`),
        api.get(`/teams/${team.id}/transactions`),
      ])

      const transactions = transactionsResponse?.value?.data || []
      setAllTransactions(transactions)

      const fullTeamDetails = {
        ...team,
        ...detailsResponse?.value,
        currentUserMode: ((team?.currentUserRole?.slice(0, 1)?.toUpperCase() ||
          "") + (team?.currentUserRole?.slice(1) || "")) as UserMode,
      }
      setSelectedTeam(fullTeamDetails)
      setCurrentView("team")
    } catch (error: any) {
      toast.error(
        "Không thể tải dữ liệu nhóm: " +
          (error.response?.data?.message || error.message)
      )
    } finally {
      setIsTeamLoading(false)
    }
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedTeam(null)
    fetchInitialData()
  }

  const filteredTeams = teams.filter((team) =>
    team.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpdateTeam = (updatedTeam: Team) => {
    if (!selectedTeam) return
    setSelectedTeam((prev) => ({
      ...prev!,
      ...updatedTeam,
    }))
    toast.success("Thông tin nhóm đã được cập nhật.")
  }

  const handleUpdateTransaction = (transaction: Transaction) => {
    setAllTransactions((prev) => {
      const index = prev.findIndex((t) => t.id === transaction.id)
      if (index > -1) {
        const newTrans = [...prev]
        newTrans[index] = transaction
        return newTrans
      }
      return [transaction, ...prev]
    })
  }

  const handleDeleteTransaction = (transactionId: string) => {
    setAllTransactions((prev) => prev.filter((t) => t.id !== transactionId))
  }

  const renderTeamView = () => {
    if (isTeamLoading)
      return <div className="p-6 text-center">Đang tải dữ liệu nhóm...</div>
    if (!selectedTeam) return null

    const commonProps = {
      team: selectedTeam,
      allTransactions,
      onModeChange: (newMode: UserMode) => {
        setSelectedTeam((prev) => ({
          ...prev!,
          currentUserMode:
            newMode.slice(0, 1).toUpperCase() + newMode.slice(1) as UserMode,
        }))
      },
    }

    if (
      selectedTeam?.currentUserMode === "Owner" ||
      selectedTeam?.currentUserMode === "Admin"
    ) {
      return (
        <AdminOwnerView
          {...commonProps}
          onUpdateTeam={handleUpdateTeam}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )
    }
    if (selectedTeam?.currentUserMode === "Deputy") {
      return <DeputyView {...commonProps} onUpdateTeam={handleUpdateTeam} />
    }
    return (
      <MemberView
        {...commonProps}
        onUpdateTransaction={handleUpdateTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center">
          Đang tải danh sách nhóm...
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout
      headerLeft={
        currentView === "team" ? (
          <Button variant="ghost" onClick={handleBackToList} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        ) : null
      }
      onTeamSelect={handleTeamClick}
    >
      {currentView === "list" ? (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Nhóm của tôi</h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm nhóm..."
                  className="pl-10 bg-white border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={() => setShowCreateTeamDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo nhóm mới
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            {filteredTeams.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Không tìm thấy nhóm nào hoặc bạn chưa tham gia nhóm nào.
              </p>
            ) : (
              filteredTeams.map((team) => {
                const balance = team.balance || 0
                const numberOfTeamMembers = team.members?.length || 0

                return (
                  <Card
                    key={team.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleTeamClick(team)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3
                                className="font-semibold text-gray-900 truncate max-w-[220px]"
                                title={team.teamName}
                              >
                                {team.teamName}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="text-xs flex-shrink-0"
                              >
                                {team.currentUserRole}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {numberOfTeamMembers} thành viên
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  Cập nhật{" "}
                                  {new Date(
                                    team.updatedAt
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">Số dư</div>
                          <div
                            className={`text-2xl font-bold ${
                              balance >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: team.currency || "VND",
                            }).format(balance)}
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
      ) : (
        renderTeamView()
      )}

      <CreateTeamDialog
        isOpen={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}
        onCreateTeam={(name) => {
          api.post("/teams", { name }).then(() => {
            toast.success(`Nhóm "${name}" đã được tạo thành công!`)
            setShowCreateTeamDialog(false)
            fetchInitialData()
          })
        }}
      />
    </MainLayout>
  )
}
