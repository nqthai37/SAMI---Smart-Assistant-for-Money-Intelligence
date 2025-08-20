// filepath: app/(main)/layout.tsx
"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, Settings, Bell, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import Link from "next/link"
import { api } from "@/lib/api"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/Sidebar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const response = await api.get('/user/notifications');
        setNotifications(response.data || []);
      } catch (error) {
        toast.error("Không thể tải thông báo.");
      }
    };
    fetchNotifications();
  }, [user]);

  const handleLogout = () => {
    logout()
    toast.success("Đăng xuất thành công!")
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col h-full w-full min-w-0">
          <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-end flex-shrink-0">
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
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg">
                          <p className="text-sm">{notification.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-center text-gray-500">Không có thông báo mới.</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {user ? `${user.firstName} ${user.lastName}` : "..."}
                      </div>
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {(user?.firstName?.charAt(0) ?? "") + (user?.lastName?.charAt(0) ?? "")}
                      </AvatarFallback>
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
          <main className="flex-1 overflow-y-auto p-6 flex justify-center">
            <div className="w-full max-w-4xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}