"use client"

import { Edit, UserPlus, Target, Palette, Trash2, Shield, Crown, Star, User, Plus, X, DollarSign } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleSwitcher } from "../components/role-switcher"
import { useAuth } from "@/lib/auth"; // Import hook useAuth
import type { TeamDetails, TeamMember, UserRole } from "../../../types/user"; // Import type chi tiết
import {api} from '@/lib/api';
import type { Team } from "../../../types/user"
import { toast } from "sonner";

interface DeputyViewProps {
  team: TeamDetails; // Dùng type chi tiết
  onModeChange: (mode: any) => void;
  onUpdateTeam: (updatedTeam: Team) => void;
}

export function DeputyView({ team, onModeChange, onUpdateTeam }: DeputyViewProps) {
  const { user, token } = useAuth(); // Lấy thông tin user đang đăng nhập

  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [showKickMemberDialog, setShowKickMemberDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState(team.teamName);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false)
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  const [showEditPermissionDialog, setShowEditPermissionDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<TeamMember | null>(null)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState("VND")
  const [categories, setCategories] = useState(team.categories || [])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("")
  const [newRole, setNewRole] = useState<UserRole>("Member")

  // XÓA DỮ LIỆU GIẢ - DÙNG DỮ LIỆU TỪ PROPS
  const teamMembers: TeamMember[] = team.teamMembers || [];
  // console.log(team.members)

  const roleConfig = {
    Owner: { icon: Crown, color: "text-purple-600", bgColor: "bg-purple-100" },
    Admin: { icon: Shield, color: "text-blue-600", bgColor: "bg-blue-100" },
    Deputy: { icon: Star, color: "text-green-600", bgColor: "bg-green-100" },
    Member: { icon: User, color: "text-gray-600", bgColor: "bg-gray-100" },
  }

  // Role hierarchy: Owner > Admin > Deputy > Member
  const roleHierarchy: UserRole[] = ["Owner", "Admin", "Deputy", "Member"]
  const currentUserActualRole = team.currentUserRole // Giả sử bạn có thông tin này từ props hoặc context
  const lowerCaseRoleHierarchy = roleHierarchy.map(role => role.toLowerCase());

  // Check if current user can kick and change role of a member based on ACTUAL role (not current mode)
  const hasPermission = (memberRole: UserRole) => {
    const currentUserIndex = lowerCaseRoleHierarchy.indexOf(currentUserActualRole.toLowerCase());
    const memberIndex = lowerCaseRoleHierarchy.indexOf(memberRole.toLowerCase());

    // Chỉ kiểm tra khi cả hai role đều tồn tại trong danh sách
    if (currentUserIndex === -1 || memberIndex === -1) {
        return false;
    }

    return currentUserIndex < memberIndex;
  }

  // Invite member via email
  const handleAddMember = async () => {
    if (!newMemberEmail) {
      setInviteError("Vui lòng nhập email.");
      return;
    }

    if (!token) {
        setInviteError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        return;
    }
    
    setIsSendingInvite(true);
    setInviteError(null);

    try {
      // Giả sử team.id có sẵn trong props `team`
      const response = await fetch(`/api/teams/${team.id}/send-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Giả sử bạn có một cơ chế để lấy token xác thực, ví dụ:
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newMemberEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể gửi lời mời. Vui lòng thử lại.');
      }

      setShowAddMemberDialog(false); // Đóng dialog
      setNewMemberEmail(""); 

    } catch (error: any) {
      console.error('Error sending invite:', error);
      setInviteError(error.message);
    } finally {
      setIsSendingInvite(false);
    }
  }

  const handleKickMember = async () => {
    if (!selectedMember) return;
    if (!token) {
        toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        return;
    }
    try{
      const response = await api.delete(`/teams/${team.id}/members/${selectedMember.User.id}`);
      // Cập nhật lại danh sách thành viên trong team sau khi xóa
      const updatedMembers = teamMembers.filter(member => member.User.id !== selectedMember.User.id);
      onUpdateTeam({ ...team, members: updatedMembers }); // Cập nhật state ở component cha
      toast.success("Thành viên đã được xóa khỏi nhóm.");
    }catch(error:any){
      console.error("Lỗi khi xóa thành viên:", error);
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    }finally{
      setShowKickMemberDialog(false);
      setSelectedMember(null);
    }
  }

  const handleRenameWorkspace = async () => {
    // 1. Kiểm tra xem tên mới có hợp lệ không
    if (newWorkspaceName.trim() && newWorkspaceName !== team.teamName) {
      try {
        // 2. Gọi API để cập nhật tên
        await api.patch(`/teams/${team.id}/name`, { name: newWorkspaceName });

        // 3. Cập nhật state ở component cha bằng cách gửi toàn bộ object team đã được cập nhật
        onUpdateTeam({ ...team, teamName: newWorkspaceName });

        // 4. Hiển thị thông báo thành công
        toast.success("Tên nhóm đã được cập nhật!");

        // 5. Đóng dialog và reset input
        setShowRenameDialog(false);
        setNewWorkspaceName(""); // Reset lại giá trị
      } catch (error: any) {
        // 6. Xử lý lỗi nếu có
        toast.error("Lỗi: " + (error.response?.data?.message || error.message));
      }
    } else if (newWorkspaceName === team.teamName) {
        setShowRenameDialog(false); // Nếu tên không đổi thì chỉ cần đóng dialog
    } else {
        toast.error("Tên nhóm không được để trống.");
    }
  };

  const handleSetCurrency = async () => {
    if (selectedCurrency === team.currency) {
      setShowCurrencyDialog(false);
      return;
    }

    try {
      // 2. Gọi API PATCH để cập nhật tiền tệ
      await api.patch(`/teams/${team.id}/currency`, {
        currency: selectedCurrency,
      });

      // 3. Cập nhật state ở component cha
      // Chú ý: Bạn cần truyền onUpdateTeam cho component DeputyView để sử dụng được ở đây
      onUpdateTeam({ ...team, currency: selectedCurrency });

      // 4. Hiển thị thông báo thành công
      toast.success("Tiền tệ đã được cập nhật thành công!");
      setShowCurrencyDialog(false);

    } catch (error: any) {
      console.error("Lỗi khi cập nhật tiền tệ:", error);
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName && newCategoryIcon && !categories.some((cat) => cat.name === newCategoryName)) {
      setCategories([...categories, { name: newCategoryName, icon: newCategoryIcon }])
      setNewCategoryName("")
      setNewCategoryIcon("")
    } else if (!newCategoryName || !newCategoryIcon) {
      // Handle empty fields
      // console.log("Please enter both category name and icon.")
    } else {
      // Handle duplicate name
      // console.log("Category name already exists.")
    }
  }

  const handleDeleteCategory = (categoryToDelete: string) => {
    setCategories(categories.filter((cat) => cat.name !== categoryToDelete))
  }

  const handleSaveCategories = async () => {
    try {
      await api.patch(`/teams/${team.id}/categories`, { categories });
      toast.success("Danh mục đã được cập nhật!");
      setShowCategoriesDialog(false);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    }
  }

  const handleEditPermission = (member: TeamMember) => {
    setSelectedMemberForEdit(member)
    setNewRole(member.role)
    setShowEditPermissionDialog(true)
  }

  const handleSavePermission = async () => {
    if(!selectedMemberForEdit || !newRole) return;
    try{
      await api.patch(`/teams/${team.id}/members/${selectedMemberForEdit.User.id}`, {role: newRole});
      const updatedMembers = teamMembers.map(member => {
        if (member.User.id === selectedMemberForEdit.User.id) {
          return { ...member, role: newRole.toLowerCase() };
        }
        return member;
      });
      onUpdateTeam({ ...team, members: updatedMembers }); // Cập nhật state ở component cha
      toast.success("Quyền của thành viên đã được cập nhật.");
    }
    catch(error:any){
      console.error("Lỗi khi cập nhật quyền thành viên:", error);
      toast.error("Lỗi: " + (error.response?.data?.message || error.message));
    }
    finally{
      setShowEditPermissionDialog(false);
      setSelectedMemberForEdit(null);
    } 
  }
  const formatJoinDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Không rõ';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Không rõ';
      
      // Format to Vietnamese date format: dd/mm/yyyy
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch (error) {
      return 'Không rõ';
    }
  };

  // Get available roles that current user can assign
  const getAvailableRoles = (): UserRole[] => {
    if (!currentUserActualRole) return [];
    const currentUserIndex = lowerCaseRoleHierarchy.indexOf(currentUserActualRole.toLowerCase());
    if (currentUserIndex === -1) return [];
    return roleHierarchy.slice(currentUserIndex + 1); // Chỉ trả về các vai trò thấp hơn vai trò hiện tại của user
  }

  // Sửa hàm check user hiện tại
  const isCurrentUser = (member: TeamMember) => {
    return user && member.User.id === user.id;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${team.color}`}></div>
            <h1 className="text-2xl font-bold text-gray-900">{team.teamName}</h1>
            <Badge variant="secondary">{team.currentUserRole}</Badge>
            <RoleSwitcher
              teamName={team.teamName}
              actualRole={team.currentUserRole}
              currentMode={team.currentUserMode}
              onModeChange={onModeChange}
            />
          </div>
        </div>

        <div className="flex items-center gap-3"></div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Quản lý thành viên</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt workspace</TabsTrigger>
        </TabsList>

        {/* Member Management */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quản lý thành viên nhóm</CardTitle>
              <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Thêm thành viên
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mời thành viên mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Nhập email thành viên mới"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                      />
                    </div>
                    {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
                    <p className="text-sm text-gray-600">Thành viên mới sẽ được thêm với quyền "Member"</p>
                    <div className="flex gap-2">
                      <Button onClick={handleAddMember} className="flex-1" disabled={isSendingInvite}>
                        {isSendingInvite ? "Đang gửi..." : "Gửi lời mời"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddMemberDialog(false)} className="flex-1" disabled={isSendingInvite}>
                        Hủy
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(teamMembers || []).map((member) => {
                  const config = roleConfig[member.role.slice(0, 1).toUpperCase() + member.role.slice(1) as UserRole]
                  const Icon = config.icon
                  const canManageOther = hasPermission(member.role)
                  const isThisMemberTheCurrentUser = isCurrentUser(member)

                  // SỬA: Tạo tên đầy đủ từ User object
                  const memberFullName = member.User ? 
                    `${member.User.firstName || ''} ${member.User.lastName || ''}`.trim() || 
                    member.User.email || 
                    'Không có tên' 
                    : member.name || 'Không có tên';

                  const memberEmail = member.User?.email || member.email || 'Không có email';
                  const memberAvatar = member.User ? 
                    `${member.User.firstName?.charAt(0) || ''}${member.User.lastName?.charAt(0) || ''}` : 
                    member.avatar || '??';

                  return (
                    <div key={member.User?.id || member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="text-sm bg-blue-500 text-white">
                              {memberAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              member.status === "online" ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {/* SỬA: Sử dụng memberFullName */}
                            <p className="font-medium">{memberFullName}</p>
                            <div className={`p-1 rounded ${config.bgColor}`}>
                              <Icon className={`w-3 h-3 ${config.color}`} />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                            {/* SỬA: Thêm badge "Bạn" nếu là current user */}
                            {isThisMemberTheCurrentUser && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Bạn
                              </Badge>
                            )}
                          </div>
                          {/* SỬA: Sử dụng memberEmail */}
                          <p className="text-sm text-gray-600">{memberEmail}</p>
                          <p className="text-xs text-gray-500">
                            Tham gia: {formatJoinDate(member.joinedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isThisMemberTheCurrentUser && canManageOther && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => handleEditPermission(member)}
                          >
                            <Target className="w-4 h-4 mr-2" />
                            Sửa quyền
                          </Button>
                        )}
                        {!isThisMemberTheCurrentUser && canManageOther && (
                          <Dialog open={showKickMemberDialog} onOpenChange={setShowKickMemberDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                                onClick={() => setSelectedMember(member)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa khỏi nhóm
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Xác nhận xóa thành viên</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* SỬA: Sử dụng memberFullName trong dialog */}
                                <p>Bạn có chắc chắn muốn xóa <strong>{memberFullName}</strong> khỏi nhóm?</p>
                                <div className="flex gap-2">
                                  <Button variant="destructive" onClick={handleKickMember} className="flex-1">
                                    Xác nhận xóa
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowKickMemberDialog(false)}
                                    className="flex-1"
                                  >
                                    Hủy
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workspace Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rename Workspace */}
            <Card>
              <CardHeader>
                <CardTitle>Đổi tên Workspace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workspace-name">Tên workspace hiện tại</Label>
                    <p className="text-sm text-gray-600 mt-1">{team.teamName}</p>
                  </div>
                  <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Edit className="w-4 h-4 mr-2" />
                        Đổi tên workspace
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Đổi tên Workspace</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="new-name">Tên mới</Label>
                          <Input
                            id="new-name"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="Nhập tên workspace mới"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleRenameWorkspace} className="flex-1">
                            Lưu thay đổi
                          </Button>
                          <Button variant="outline" onClick={() => setShowRenameDialog(false)} className="flex-1">
                            Hủy
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Set Currency */}
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt tiền tệ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Tiền tệ hiện tại</Label>
                    <p className="text-sm text-gray-600 mt-1">{team.currency}</p>
                  </div>
                  <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full bg-transparent">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Thay đổi tiền tệ
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Chọn tiền tệ mặc định</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currency">Tiền tệ</Label>
                          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tiền tệ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VND">VND - Việt Nam Đồng</SelectItem>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-sm text-gray-600">
                          Tiền tệ này sẽ được sử dụng cho tất cả giao dịch và báo cáo mới.
                        </p>
                        <div className="flex gap-2">
                          <Button onClick={handleSetCurrency} className="flex-1">
                            Cập nhật tiền tệ
                          </Button>
                          <Button variant="outline" onClick={() => setShowCurrencyDialog(false)} className="flex-1">
                            Hủy
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manage Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quản lý danh mục</CardTitle>
              <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Palette className="w-4 h-4 mr-2" />
                    Quản lý danh mục
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Quản lý danh mục</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Add new category */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tên danh mục mới"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Icon (ví dụ: 🍽️)"
                        value={newCategoryIcon}
                        onChange={(e) => setNewCategoryIcon(e.target.value)}
                        className="w-24"
                      />
                      <Button onClick={handleAddCategory}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm
                      </Button>
                    </div>

                    {/* Categories list */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category.icon}</span>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex gap-2">
                            {/* <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button> */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleDeleteCategory(category.name)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveCategories} className="flex-1">
                        Lưu
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.slice(0, 6).map((category, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg text-center flex flex-col items-center">
                    <span className="text-xl mb-1">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                ))}
                {categories.length > 6 && (
                  <div className="p-3 bg-gray-100 rounded-lg text-center flex flex-col items-center justify-center">
                    <span className="text-sm text-gray-600">+{categories.length - 6} khác</span>
                  </div>
                )}
              </div> */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((category, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg text-center flex flex-col items-center">
                            <span className="text-xl mb-1">{category.icon}</span>
                            <span className="text-sm font-medium">{category.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={showEditPermissionDialog} onOpenChange={setShowEditPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa quyền thành viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Thay đổi quyền của <strong>{selectedMemberForEdit?.name}</strong>
              </p>
              <p className="text-xs text-gray-500 mb-4">Email: {selectedMemberForEdit?.email}</p>
            </div>

            <div>
              <Label htmlFor="new-role">Quyền mới</Label>
              <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedMemberForEdit &&
                    getAvailableRoles().map((role) => {
                      const config = roleConfig[role]
                      const Icon = config.icon
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${config.bgColor}`}>
                              <Icon className={`w-3 h-3 ${config.color}`} />
                            </div>
                            <span>{role}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Thay đổi quyền sẽ ảnh hưởng đến khả năng truy cập và quản lý của thành viên này.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSavePermission} className="flex-1">
                Lưu thay đổi
              </Button>
              <Button variant="outline" onClick={() => setShowEditPermissionDialog(false)} className="flex-1">
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
