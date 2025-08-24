"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { expenseCategories, incomeCategories } from "@/data/categories"

interface AddTransactionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAddTransaction: (transaction: {
    type: "income" | "expense"
    date: Date
    description: string
    amount: number
    categoryName: string
    note?: string
  }) => void
}

export function AddTransactionDialog({ isOpen, onOpenChange, onAddTransaction }: AddTransactionDialogProps) {
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense")
  const [date, setDate] = useState<Date>(new Date())
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryName, setCategory] = useState("")
  const [note, setNote] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const availableCategories = transactionType === "expense" ? expenseCategories : incomeCategories

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim() || !amount || !categoryName) {
      return // Basic validation
    }

    onAddTransaction({
      type: transactionType,
      date,
      description: description.trim(),
      amount: Number.parseFloat(amount),
      categoryName,
      note: note.trim() || undefined,
    })

    // Reset form
    setTransactionType("expense")
    setDate(new Date())
    setDescription("")
    setAmount("")
    setCategory("")
    setNote("")
    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset form
    setTransactionType("expense")
    setDate(new Date())
    setDescription("")
    setAmount("")
    setCategory("")
    setNote("")
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Ghi chép giao dịch mới</DialogTitle>
          <p className="text-sm text-gray-600">Thêm giao dịch thu nhập hoặc chi tiêu cho nhóm</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Transaction Type */}
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Loại giao dịch</Label>
              <RadioGroup
                value={transactionType}
                onValueChange={(value: "income" | "expense") => {
                  setTransactionType(value)
                  setCategory("") // Reset category when type changes
                }}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="text-sm font-normal">
                    Chi tiêu
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="text-sm font-normal">
                    Thu nhập
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Date and Amount */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Ngày giao dịch</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-50 border-gray-300",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate)
                        setIsCalendarOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-2 block">
                Số tiền (VNĐ)
              </Label>
              <Input
                id="amount"
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

            {/* Description and Category */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                Mô tả giao dịch
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="Ví dụ: Mua sắm tại siêu thị"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-50 border-gray-300"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Danh mục</Label>
              <Select value={categoryName} onValueChange={setCategory} required>
                <SelectTrigger className="bg-gray-50 border-gray-300">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="col-span-2">
              <Label htmlFor="note" className="text-sm font-medium text-gray-700 mb-2 block">
                Ghi chú (tùy chọn)
              </Label>
              <Textarea
                id="note"
                placeholder="Thêm ghi chú cho giao dịch..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-gray-50 border-gray-300 min-h-[60px] resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              disabled={!description.trim() || !amount || !categoryName}
            >
              Thêm giao dịch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
