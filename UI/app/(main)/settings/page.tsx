// File: app/(main)/settings/page.tsx
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileSettings } from "@/features/users/components/profile-settings"
import { SecuritySettings } from "@/features/users/components/security-settings"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

// This is just a placeholder for the component
const LanguageSettings = () => <div className="p-4">This feature is currently under development.</div>

export default function SettingsPage() {
  const router = useRouter()

  return (
    // ✅ XÓA PADDING VÀ CÁC CLASS KHÁC, CHỈ GIỮ LẠI `space-y-6`
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} size="icon" className="mr-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="sr-only">Quay lại</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Chỉnh sửa hồ sơ</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="options">Tùy chọn</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
              <SecuritySettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options">
          <Card>
            <CardHeader>
              <CardTitle>Tùy chọn ứng dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}