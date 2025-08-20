"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.")
      setIsLoading(false)
      return
    }

    // Mock password change logic
    // In a real app, you'd send currentPassword, newPassword to a backend API
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    if (currentPassword === "123456") {
      // Simulate successful password change
      toast.success("Mật khẩu đã được thay đổi thành công!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } else {
      toast.error("Mật khẩu hiện tại không đúng.")
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
            Mật khẩu hiện tại
          </Label>
          <div className="relative mt-1">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
            Mật khẩu mới
          </Label>
          <div className="relative mt-1">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-gray-700">
            Xác nhận mật khẩu mới
          </Label>
          <div className="relative mt-1">
            <Input
              id="confirmNewPassword"
              type={showConfirmNewPassword ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
              aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
            >
              {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang đổi mật khẩu...
            </div>
          ) : (
            "Đổi mật khẩu"
          )}
        </Button>
      </form>
    </div>
  )
}
