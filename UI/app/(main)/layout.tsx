// filepath: c:\Users\Admin\OneDrive - VNU-HCMUS\University\Năm 2\HK3\SE\Project\Sami\UI\app\(main)\layout.tsx
"use client"

import { useState } from "react"
import { DollarSign, Users, Settings, Plus, Bell, LogOut, CheckCircle, AlertTriangle, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

// DỮ LIỆU GIẢ - Sẽ được thay thế bằng API call
const mockNotifications = [
  { id: "n1", type: "info", message: "Yêu cầu sửa giao dịch đã bị từ chối.", timestamp: "15:30", read: false },
  { id: "n2", type: "warning", message: "Ngân sách nhóm 'CLB Công Nghệ' đã vượt 90%.", timestamp: "14:00", read: false },
  { id: "n3", type: "success", message: "Giao dịch 'Dự án X' đã được chấp thuận.", timestamp: "10:15", read: true },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState(mockNotifications)
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    toast.success("Đăng xuất thành công!")
  }

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* --- Sidebar --- */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Sami</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start gap-3 text-gray-500 hover:bg-gray-100">
            <Link href="/">
              <Users className="w-4 h-4" />
              Nhóm của tôi
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start gap-3 text-gray-500 hover:bg-gray-100">
            <Link href="/settings">
              <Settings className="w-4 h-4" />
              Cài đặt
            </Link>
          </Button>
        </nav>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col">
        {/* --- Header --- */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-end">
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Thông báo</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg">
                      {/* ... JSX for notification item ... */}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-blue-500 text-white text-xs">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* --- Page Content --- */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}