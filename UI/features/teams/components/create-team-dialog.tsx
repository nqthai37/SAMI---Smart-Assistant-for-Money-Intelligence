"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateTeamDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateTeam: (teamName: string) => void
}

export function CreateTeamDialog({ isOpen, onOpenChange, onCreateTeam }: CreateTeamDialogProps) {
  const [teamName, setTeamName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      setError("Vui lòng nhập tên nhóm.")
      return
    }
    setError(null)
    onCreateTeam(teamName.trim())
    setTeamName("") // Reset input after submission
  }

  const handleCancel = () => {
    setTeamName("") // Reset input on cancel
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Tạo nhóm mới</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Đặt tên cho nhóm của bạn để bắt đầu quản lý chi tiêu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="team-name" className="text-sm font-medium text-gray-700 mb-2 block">
              Tên nhóm
            </Label>
            <Input
              id="team-name"
              type="text"
              placeholder="Ví dụ: CLB Công Nghệ, Du lịch Vũng Tàu"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value)
                if (error) setError(null) // Clear error when user types
              }}
              className="bg-gray-50 border-gray-300"
              required
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
              Tạo nhóm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
