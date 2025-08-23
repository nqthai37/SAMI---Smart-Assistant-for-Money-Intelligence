"use client"

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { Team, UserMode, Transaction } from "@/types/user";
import { useRouter } from "next/navigation";

// Import the actual view and dialog components
import { AdminOwnerView } from "@/features/teams/team-views/admin-owner-view";
import { DeputyView } from "@/features/teams/team-views/deputy-view";
import { MemberView } from "@/features/teams/team-views/member-view";
import { CreateTeamDialog } from "@/features/teams/components/create-team-dialog";
import { api } from "@/lib/api";

export default function Homepage() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "team">("list");
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamLoading, setIsTeamLoading] = useState(false);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const teamsResponse = await api.get("/user/teams");
      setTeams(teamsResponse.data || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách nhóm: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const handleTeamClick = async (team: Team) => {
    setIsTeamLoading(true);
    try {
      const transactionsResponse = await api.get(`/teams/${team.id}/transactions`);
      setAllTransactions(transactionsResponse.data || []);
      setSelectedTeam(team);
      setCurrentView("team");
    } catch (error: any) {
      toast.error("Không thể tải dữ liệu nhóm: " + error.message);
    } finally {
      setIsTeamLoading(false);
    }
  };

  const handleCreateTeam = async (newTeamName: string) => {
    try {
      await api.post("/teams", { name: newTeamName });
      toast.success(`Nhóm "${newTeamName}" đã được tạo thành công!`);
      setShowCreateTeamDialog(false);
      fetchInitialData();
    } catch (error: any) {
      toast.error("Tạo nhóm thất bại: " + error.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const calculateBalance = (income: number, expenses: number) => income - expenses;

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedTeam(null);
  };

  const filteredTeams = teams.filter((team) =>
    team.teamName && team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTeamView = () => {
    if (!selectedTeam) return null;
    if (isTeamLoading) return <div className="p-6 text-center">Đang tải dữ liệu nhóm...</div>;

    const commonProps = {
      team: selectedTeam,
      allTransactions: allTransactions,
      onModeChange: () => {},
    };

    if (selectedTeam.currentUserMode === "Owner" || selectedTeam.currentUserMode === "Admin") {
      return <AdminOwnerView {...commonProps} onUpdateTeam={() => {}} onUpdateTransaction={() => {}} onDeleteTransaction={() => {}} />;
    }
    if (selectedTeam.currentUserMode === "Deputy") {
      return <DeputyView {...commonProps} />;
    }
    return <MemberView {...commonProps} />;
  };
  
  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Đang tải danh sách nhóm...</div>;
  }

  return (
    <>
      {currentView === "list" ? (
        // --- NỘI DUNG CỦA TRANG DANH SÁCH NHÓM ---
        <div className="max-w-6xl mx-auto">
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
              <p className="text-center text-gray-500 py-8">Không tìm thấy nhóm nào hoặc bạn chưa tham gia nhóm nào.</p>
            ) : (
              filteredTeams.map((team) => {
                const balance = calculateBalance(team.totalIncome, team.totalExpenses);
                return (
                  <Card
                    key={team.id}
                    className="hover:shadow-md transition-shadow cursor-pointer max-w-[500px] w-full"
                    onClick={() => handleTeamClick(team)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className={`w-4 h-4 rounded-full ${team.color} mt-1 flex-shrink-0`}></div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                      <h3
                                        className="font-semibold text-gray-900 truncate max-w-[220px]"
                                        title={team.teamName}
                                      >
                                        {team.teamName}
                                      </h3>
                                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                                      {team.currentUserRole}
                                      </Badge>
                                  </div>
                                  {team.description && <p className="text-sm text-gray-600 mb-3 truncate">{team.description}</p>}
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
                );
              })
            )}
          </div>
        </div>
      ) : (
        // --- NỘI DUNG CỦA TRANG CHI TIẾT NHÓM ---
        <div>
            <div className="mb-4">
                <Button variant="ghost" onClick={handleBackToList} size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                </Button>
            </div>
            {renderTeamView()}
        </div>
      )}

      {/* Dialog tạo nhóm vẫn được giữ lại vì nó là một popup */}
      <CreateTeamDialog
        isOpen={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}
        onCreateTeam={handleCreateTeam}
      />
    </>
  );
}