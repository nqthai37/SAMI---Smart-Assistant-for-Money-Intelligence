"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { expenseTemplates } from "@/data/transaction-templates" // Import templates

interface QuickAddTransactionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onQuickAddTransaction: (transaction: {
    type: "income" | "expense"
    date: Date
    description: string
    amount: number
    category: string
    note?: string
  }) => void
}

export function QuickAddTransactionDialog({
  isOpen,
  onOpenChange,
  onQuickAddTransaction,
}: QuickAddTransactionDialogProps) {
  const [amount, setAmount] = useState("")

  const handleQuickAdd = (template: { name: string; description: string; category: string; icon: string }) => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ.")
      return
    }

    onQuickAddTransaction({
      type: "expense", // Quick add is specifically for expenses as per use case
      date: new Date(), // Default to current date
      description: template.description,
      amount: Number.parseFloat(amount),
      category: template.category,
      note: undefined, // No note for quick add
    })

    // Reset form and close dialog
    setAmount("")
    onOpenChange(false)
    toast.success(`Đã thêm giao dịch "${template.name}" thành công!`)
  }

  const handleCancel = () => {
    setAmount("")
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Thêm nhanh giao dịch</DialogTitle>
          <p className="text-sm text-gray-600">Nhập số tiền và chọn một mẫu chi tiêu có sẵn.</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="quick-amount" className="text-sm font-medium text-gray-700 mb-2 block">
              Số tiền (VNĐ)
            </Label>
            <Input
              id="quick-amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-50 border-gray-300"
              min="0"
              step="1000"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Chọn mẫu chi tiêu</Label>
            <div className="grid grid-cols-2 gap-3">
              {expenseTemplates.map((template) => (
                <Button
                  key={template.name}
                  variant="outline"
                  className="flex items-center justify-start gap-2 h-12 text-base bg-transparent"
                  onClick={() => handleQuickAdd(template)}
                >
                  <span className="text-xl">{template.icon}</span>
                  <span>{template.name}</span>
                </Button>
              ))}
            </div>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
