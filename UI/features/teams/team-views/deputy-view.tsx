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

interface DeputyViewProps {
  team: TeamDetails; // Dùng type chi tiết
  onModeChange: (mode: any) => void;
}

export function DeputyView({ team, onModeChange }: DeputyViewProps) {
  const { user } = useAuth(); // Lấy thông tin user đang đăng nhập

  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [showKickMemberDialog, setShowKickMemberDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false)
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  const [showEditPermissionDialog, setShowEditPermissionDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<TeamMember | null>(null)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newWorkspaceName, setNewWorkspaceName] = useState(team.teamName); // Sửa team.name -> team.teamName
  const [selectedCurrency, setSelectedCurrency] = useState("VND")
  const [categories, setCategories] = useState<CategoryItem[]>([
    { name: "Ăn uống", icon: "🍽️" },
    { name: "Di chuyển", icon: "🚗" },
    { name: "Văn phòng phẩm", icon: "📝" },
    { name: "Thiết bị", icon: "💻" },
    { name: "Marketing", icon: "📢" },
    { name: "Giải trí", icon: "🎮" },
  ])
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

  // Check if current user can kick a member based on ACTUAL role (not current mode)
  const canKickMember = (memberRole: UserRole) => {
    const currentUserActualRole = team.currentUserRole // This is the actual role
    const currentRoleIndex = roleHierarchy.indexOf(currentUserActualRole)
    const memberRoleIndex = roleHierarchy.indexOf(memberRole)

    // Can only kick members with lower hierarchy (higher index)
    return currentRoleIndex < memberRoleIndex
  }

  // Check if current user can modify permissions based on ACTUAL role
  const canModifyPermissions = (memberRole: UserRole) => {
    const currentUserActualRole = team.currentUserRole

    // Only Owner and Admin can modify permissions
    if (currentUserActualRole !== "Owner" && currentUserActualRole !== "Admin") {
      return false
    }

    const currentRoleIndex = roleHierarchy.indexOf(currentUserActualRole)
    const memberRoleIndex = roleHierarchy.indexOf(memberRole)

    // Can only modify permissions of members with lower hierarchy
    return currentRoleIndex < memberRoleIndex
  }

  const handleAddMember = () => {
    if (newMemberEmail) {
      // console.log("Adding member:", newMemberEmail)
      setNewMemberEmail("")
      setShowAddMemberDialog(false)
    }
  }

  const handleKickMember = () => {
    if (selectedMember) {
      // console.log("Kicking member:", selectedMember.name)
      setShowKickMemberDialog(false)
      setSelectedMember(null)
    }
  }

  const handleRenameWorkspace = () => {
    // console.log("Renaming workspace to:", newWorkspaceName)
    setShowRenameDialog(false)
  }

  const handleSetCurrency = () => {
    // console.log("Setting currency to:", selectedCurrency)
    setShowCurrencyDialog(false)
  }

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

  const handleEditPermission = (member: TeamMember) => {
    setSelectedMemberForEdit(member)
    setNewRole(member.role)
    setShowEditPermissionDialog(true)
  }

  const handleSavePermission = () => {
    if (selectedMemberForEdit) {
      // console.log("Changing role of", selectedMemberForEdit.name, "to", newRole)
      setShowEditPermissionDialog(false)
      setSelectedMemberForEdit(null)
    }
  }

  // Get available roles that current user can assign
  const getAvailableRoles = (targetMemberRole: UserRole): UserRole[] => {
    const currentUserActualRole = team.currentUserRole
    const currentRoleIndex = roleHierarchy.indexOf(currentUserActualRole)

    // Can assign roles equal to or lower than current user's role
    return roleHierarchy.slice(currentRoleIndex)
  }

  // Sửa hàm check user hiện tại
  const isCurrentUser = (member: TeamMember) => {
    return user?.id === member.id;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
                    <p className="text-sm text-gray-600">Thành viên mới sẽ được thêm với quyền "Member"</p>
                    <div className="flex gap-2">
                      <Button onClick={handleAddMember} className="flex-1">
                        Gửi lời mời
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddMemberDialog(false)} className="flex-1">
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
                  const canKick = canKickMember(member.role)
                  const canModify = canModifyPermissions(member.role)
                  const isThisMemberTheCurrentUser = isCurrentUser(member); // Dùng hàm đã sửa

                  return (
                    <div key={member.User.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="text-sm">{member.avatar}</AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              member.status === "online" ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{member.name}</p>
                            <div className={`p-1 rounded ${config.bgColor}`}>
                              <Icon className={`w-3 h-3 ${config.color}`} />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500">Tham gia: {member.joinedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isThisMemberTheCurrentUser && canModify && (
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
                        {!isThisMemberTheCurrentUser && canKick && (
                          <Dialog open={showKickMemberDialog} onOpenChange={setShowKickMemberDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                                onClick={() => setSelectedMember(member)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Kick
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Xác nhận xóa thành viên</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>Bạn có chắc chắn muốn xóa {selectedMember?.name} khỏi nhóm?</p>
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
                        {!isThisMemberTheCurrentUser && !canKick && !canModify && (
                          <Badge variant="secondary" className="text-xs">
                            Không thể quản lý
                          </Badge>
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
                    <p className="text-sm text-gray-600 mt-1">{team.name}</p>
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
                    <p className="text-sm text-gray-600 mt-1">VND (Việt Nam Đồng)</p>
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
                    <DialogTitle>Quản lý danh mục chi tiêu</DialogTitle>
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
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
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
                      <Button onClick={() => setShowCategoriesDialog(false)} className="flex-1">
                        Hoàn thành
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                    getAvailableRoles(selectedMemberForEdit.role).map((role) => {
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
