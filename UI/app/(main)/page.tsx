"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, ArrowLeft, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { Team, TeamDetails, UserMode, Transaction } from "@/types/user";
import { useRouter } from "next/navigation";

import { AdminOwnerView } from "@/features/teams/team-views/admin-owner-view";
import { DeputyView } from "@/features/teams/team-views/deputy-view";
import { MemberView } from "@/features/teams/team-views/member-view";
import { CreateTeamDialog } from "@/features/teams/components/create-team-dialog";
import { api } from "@/lib/api";
import { useTeam } from "@/contexts/TeamContext";

export default function Homepage() {
  const [currentView, setCurrentView] = useState<"list" | "team">("list");
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { selectedTeam, selectTeam } = useTeam();

  const [teams, setTeams] = useState<Team[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamLoading, setIsTeamLoading] = useState(false);

  // Fetch danh sách các team ban đầu
  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  // Lắng nghe sự thay đổi của team được chọn từ context
  useEffect(() => {
    const fetchTeamDetails = async (team: Team) => {
      if (!team || !team.id) {
        setCurrentView("list");
        return;
      }
      setIsTeamLoading(true);
      setCurrentView("team");
      try {
        const [detailsResponse, transactionsResponse] = await Promise.allSettled([
          api.get(`/teams/${team.id}/details`),
          api.get(`/teams/${team.id}/transactions`),
        ]);

        const transactions =
          transactionsResponse.status === "fulfilled" ? transactionsResponse.value?.data || [] : [];
        setAllTransactions(transactions);

        if (detailsResponse.status === "fulfilled") {
          const fullTeamDetails = {
            ...team,
            ...detailsResponse.value?.data,
            currentUserMode: ((team?.currentUserRole?.slice(0, 1)?.toUpperCase() || "") +
              (team?.currentUserRole?.slice(1) || "")) as UserMode,
          };
          // Cập nhật lại team trong context với đầy đủ thông tin
          selectTeam(fullTeamDetails);
        } else {
           throw new Error("Không thể tải chi tiết nhóm.");
        }
      } catch (error: any) {
        toast.error(
          "Không thể tải dữ liệu nhóm: " +
            (error.response?.data?.message || error.message)
        );
        // Nếu lỗi, quay về danh sách
        handleBackToList();
      } finally {
        setIsTeamLoading(false);
      }
    };

    if (selectedTeam && !selectedTeam.members) { // Chỉ fetch khi chưa có data chi tiết
      fetchTeamDetails(selectedTeam);
    } else if (!selectedTeam) {
      setCurrentView("list");
    } else {
      setCurrentView("team");
    }
  }, [selectedTeam]);


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

  // Hàm này được gọi khi click vào Card team
  const handleTeamClick = (team: Team) => {
    selectTeam(team); // Cập nhật team trong context, useEffect sẽ xử lý phần còn lại
  };

  const handleCreateTeam = async (newTeamName: string) => {
    try {
      await api.post("/teams", { name: newTeamName });
      toast.success(`Nhóm "${newTeamName}" đã được tạo thành công!`);
      setShowCreateTeamDialog(false);
      fetchInitialData(); // Tải lại danh sách team
    } catch (error: any) {
      toast.error("Tạo nhóm thất bại: " + error.message);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleBackToList = () => {
    selectTeam(null); // Reset team trong context, useEffect sẽ xử lý việc chuyển view
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.teamName &&
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateTeam = (updatedTeam: Partial<TeamDetails>) => {
    if (!selectedTeam) return;
    // Cập nhật team trong context
    selectTeam({ ...selectedTeam, ...updatedTeam });
    toast.success("Thông tin nhóm đã được cập nhật.");
  };

  const handleUpdateTransaction = (transaction: Transaction) => {
    setAllTransactions((prev) => {
      const index = prev.findIndex((t) => t.id === transaction.id);
      if (index > -1) {
        const newTrans = [...prev];
        newTrans[index] = transaction;
        return newTrans;
      }
      return [transaction, ...prev]; // Thêm mới nếu chưa có
    });
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setAllTransactions((prev) =>
      prev.filter((t) => t.id !== transactionId)
    );
  };

  const renderTeamView = () => {
    if (!selectedTeam) return null;
    if (isTeamLoading)
      return <div className="p-6 text-center">Đang tải dữ liệu nhóm...</div>;

    const commonProps = {
      team: selectedTeam as TeamDetails, // Ép kiểu vì đã fetch đủ data
      allTransactions,
      onModeChange: (newMode: UserMode) => {
        if (!selectedTeam) return;
        const updatedMode = newMode.slice(0, 1).toUpperCase() + newMode.slice(1) as UserMode;
        selectTeam({ ...selectedTeam, currentUserMode: updatedMode });
      },
    };

    switch (selectedTeam.currentUserMode) {
      case "Owner":
      case "Admin":
        return (
          <AdminOwnerView
            {...commonProps}
            onUpdateTeam={handleUpdateTeam}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case "Deputy":
        return <DeputyView {...commonProps} />;
      default:
        return (
          <MemberView
            {...commonProps}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        Đang tải danh sách nhóm...
      </div>
    );
  }

  return (
    <>
      {currentView === "list" ? (
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
              <Button
                size="sm"
                onClick={() => setShowCreateTeamDialog(true)}
              >
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
                const balance = team.balance || 0;
                const numberOfTeamMembers = team.members?.length || 0;

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
                              <Badge variant="secondary" className="text-xs">
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
                          <div className="text-sm text-gray-600 mb-1">
                            Số dư
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              balance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
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

      <CreateTeamDialog
        isOpen={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}
        onCreateTeam={handleCreateTeam}
      />
    </>
  );
}