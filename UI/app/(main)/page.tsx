"use client"

import React, { useState, useEffect } from "react"; // SỬA: Import React explicit và thêm React type
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
import type { Team, TeamDetails, UserMode, Transaction } from "@/types/user";
import { useRouter } from "next/navigation";

// Import the actual view and dialog components
import { AdminOwnerView } from "@/features/teams/team-views/admin-owner-view";
import { DeputyView } from "@/features/teams/team-views/deputy-view";
import { MemberView } from "@/features/teams/team-views/member-view";
import { CreateTeamDialog } from "@/features/teams/components/create-team-dialog";
import { api } from "@/lib/api";


export default function Homepage() {
  const [selectedTeam, setSelectedTeam] = useState<TeamDetails | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "team">("list");
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamLoading, setIsTeamLoading] = useState(false);

  useEffect(() => {
     console.log(selectedTeam)
  }, [selectedTeam])

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // console.log('🚀 Fetching initial teams data...');
      const teamsResponse = await api.get("/user/teams");
      // console.log('📋 Teams response:', teamsResponse);
      // console.log('📋 Teams data:', teamsResponse.data);
      
      const teamsData = teamsResponse.data || [];  // data nằm trong response.data.data
      // console.log('📋 Setting teams:', teamsData);
      setTeams(teamsData);
      
      // Không cần fetch balance riêng nữa vì đã có sẵn
    } catch (error: any) {
      console.error('❌ Error fetching teams:', error);
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

  const handleTeamClick = async (team: Team) => { // SỬA: Thêm type cho parameter
    setIsTeamLoading(true);
    try {
      const [detailsResponse, transactionsResponse] = await Promise.allSettled([
        api.get(`/teams/${team.id}/details`),
        api.get(`/teams/${team.id}/transactions`),
      ]);
       console.log(transactionsResponse?.value)

      const transactions = transactionsResponse?.value?.data || [];
      setAllTransactions(transactions);

      // THÊM currentUserMode VÀO ĐÂY
      const fullTeamDetails = { 
        ...team, 
        ...detailsResponse?.value,
        // Khởi tạo currentUserMode = actual role của user trong team này
        currentUserMode: 
        ((team?.currentUserRole?.slice(0, 1)?.toUpperCase() || '') + (team?.currentUserRole?.slice(1) || '')) as UserMode
      };
      setSelectedTeam(fullTeamDetails);

      setCurrentView("team");
    } catch (error: any) {
      toast.error("Không thể tải dữ liệu nhóm: " + (error.response?.data?.message || error.message));
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

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedTeam(null);
  };

  const filteredTeams = teams.filter((team: Team) => // SỬA: Thêm type cho parameter
    team.teamName && team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // SỬA: Thay đổi type parameter cho phù hợp với AdminOwnerView
  const handleUpdateTeam = (updatedTeam: Team) => { // SỬA: Đổi type từ Partial<TeamDetails> thành Team
    if (!selectedTeam) return;
    setSelectedTeam((prev: TeamDetails | null) => ({ // SỬA: Thêm type cho prev
      ...prev!, 
      ...updatedTeam 
    }));
    // Gọi API để lưu thay đổi ở đây, ví dụ:
    // api.patch(`/teams/${selectedTeam.id}`, updatedData);
    toast.success("Thông tin nhóm đã được cập nhật.");
  };

  const handleUpdateTransaction = (transaction: Transaction) => {
    setAllTransactions((prev: Transaction[]) => { // SỬA: Thêm type cho prev
      const index = prev.findIndex((t: Transaction) => t.id === transaction.id); // SỬA: Thêm type cho t
      if (index > -1) {
        const newTrans = [...prev];
        newTrans[index] = transaction;
        return newTrans;
      }
      return [transaction, ...prev]; // Thêm mới
    });
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setAllTransactions((prev: Transaction[]) => prev.filter((t: Transaction) => t.id !== transactionId)); // SỬA: Thêm type cho prev và t
    // Gọi API để xóa ở đây
  };

  const renderTeamView = () => {
    if (!selectedTeam) return null;
    if (isTeamLoading) return <div className="p-6 text-center">Đang tải dữ liệu nhóm...</div>;

    const commonProps = {
      team: selectedTeam,
      allTransactions: allTransactions,
      onModeChange: (newMode: UserMode) => {
        setSelectedTeam((prev: TeamDetails | null) => ({ ...prev!, currentUserMode: newMode.slice(0, 1).toUpperCase() + newMode.slice(1) as UserMode })); // SỬA: Thêm type cho prev
      },
    };

    if (selectedTeam?.currentUserMode === "Owner" || selectedTeam?.currentUserMode === "Admin") {
      return <AdminOwnerView 
        {...commonProps} 
        onUpdateTeam={handleUpdateTeam} 
        onUpdateTransaction={handleUpdateTransaction} 
        onDeleteTransaction={handleDeleteTransaction} 
      />;
    }
    if (selectedTeam?.currentUserMode === "Deputy") {
      return <DeputyView {...commonProps} />; // DeputyView cũng cần các hàm update tương tự
    }
    return <MemberView 
      {...commonProps} 
      onUpdateTransaction={handleUpdateTransaction} 
      onDeleteTransaction={handleDeleteTransaction} 
    />;
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} // SỬA: Thêm type cho e
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
              filteredTeams.map((team: Team) => { // SỬA: Thêm type cho team
                // Sử dụng balance có sẵn từ API
                const balance = team.balance || 0;
                const numberOfTeamMembers = team.members?.length || 0;
                
                // console.log(`🎨 Rendering team ${team.teamName}:`, {
                //   teamId: team.id,
                //   balance,
                //   totalIncome: team.totalIncome,
                //   totalExpenses: team.totalExpenses,
                // });
                
                return (
                  <Card
                    key={team.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleTeamClick(team)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                              {/* <div className={`w-4 h-4 rounded-full ${team.color} mt-1`}></div> */}
                              <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                      <h3
                                        className="font-semibold text-gray-900 truncate max-w-[220px]"
                                        title={team.teamName}
                                      >
                                        {team.teamName}
                                      </h3>
                                      {/* SỬA: Sử dụng children prop cho Badge */}
                                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                                        {team.currentUserRole}
                                      </Badge>
                                  </div>
                                  {/* {team.description && <p className="text-sm text-gray-600 mb-3">{team.description}</p>} */}
                                  <div className="flex items-center gap-6 text-sm">
                                      <div className="flex items-center gap-1">
                                          <Users className="w-4 h-4 text-gray-400" />
                                          <span className="text-gray-600">{numberOfTeamMembers} thành viên</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4 text-gray-400" />
                                          {/* Sửa lại để format ngày tháng */}
                                          <span className="text-gray-600">Cập nhật {new Date(team.updatedAt).toLocaleDateString('vi-VN')}</span>
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