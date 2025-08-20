"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export function LanguageSettings() {
  const [selectedLanguage, setSelectedLanguage] = useState("vi") // Default to Vietnamese
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveLanguage = async () => {
    setIsLoading(true)
    // Simulate saving language preference
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success(`Ngôn ngữ đã được đặt thành: ${selectedLanguage === "vi" ? "Tiếng Việt" : "English"}`)
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="language" className="text-sm font-medium text-gray-700 mb-2 block">
          Ngôn ngữ hiển thị
        </Label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isLoading}>
          <SelectTrigger className="w-full bg-gray-50 border-gray-300">
            <SelectValue placeholder="Chọn ngôn ngữ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vi">Tiếng Việt</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleSaveLanguage}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Đang lưu...
          </div>
        ) : (
          "Lưu thay đổi"
        )}
      </Button>
    </div>
  )
}
