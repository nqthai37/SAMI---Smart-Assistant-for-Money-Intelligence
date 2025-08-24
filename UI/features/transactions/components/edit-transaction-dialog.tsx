"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/types/user"
import { expenseCategories, incomeCategories } from "@/data/categories"
import { toast } from "sonner"
import type { TeamDetails } from "@/types/user"

interface EditTransactionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  team?: TeamDetails // SỬA: Thêm team prop
  onSaveTransaction: (updatedTransaction: Transaction) => void
}

// SỬA: Helper function để lấy team categories


export function EditTransactionDialog({
  isOpen,
  onOpenChange,
  transaction,
  team, // SỬA: Nhận team prop
  onSaveTransaction,
}: EditTransactionDialogProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [note, setNote] = useState("")


  const getTeamCategories = (type: "income" | "expense") => {
    if (!team?.categories || team.categories.length === 0) {
      // Fallback to default categories
      return type === "expense" ? expenseCategories : incomeCategories;
    }
  
    // Filter team categories theo type
    return team.categories.filter(cat => {
      if ('type' in cat) {
        return cat.type === type;
      }
      return true; // Show all if no type specified
    });
  };
  
  // SỬA: Helper để get category name từ transaction
  const getTransactionCategory = (transaction: Transaction) => {
    return transaction.categoryName || transaction.category || "";
  };
  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setDate(new Date(transaction.createdAt))
      setDescription(transaction.description)
      setAmount(transaction.amount.toString())
      
      // SỬA: Set đúng category hiện tại từ transaction
      const currentCategory = getTransactionCategory(transaction);
      setCategory(currentCategory)
      
      setNote(transaction.note || "")
      
      console.log('🔧 Editing transaction:', {
        id: transaction.id,
        currentCategory,
        categoryName: transaction.categoryName,
        category: transaction.category
      });
    } else {
      // Reset form
      setType("expense")
      setDate(new Date())
      setDescription("")
      setAmount("")
      setCategory("")
      setNote("")
    }
  }, [transaction, isOpen])

  // SỬA: Reset category khi thay đổi type
  useEffect(() => {
    if (transaction) {
      // Khi edit, check xem category hiện tại có valid cho type mới không
      const currentCategory = getTransactionCategory(transaction);
      const availableCategories = getTeamCategories(type);
      const categoryExists = availableCategories.some(cat => cat.name === currentCategory);
      
      if (!categoryExists) {
        setCategory(""); // Reset nếu category không valid cho type mới
      }
    }
  }, [type, team?.categories, transaction])

  const availableCategories = getTeamCategories(type);

  const handleSave = () => {
    if (!description || !amount || !category || !date) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.")
      return
    }

    const parsedAmount = Number.parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Số tiền không hợp lệ.")
      return
    }

    if (!transaction) {
      toast.error("Không có giao dịch để chỉnh sửa.")
      return
    }

    // SỬA: Update transaction với đúng fields
    const updatedTransaction: Transaction = {
      ...transaction,
      type,
      createdAt: format(date, "yyyy-MM-dd"),
      description,
      amount: parsedAmount,
      
      // SỬA: Update cả category và categoryName để backward compatible
      category,
      categoryName: category,
      
      note,
      status: "approved",
      requestedBy: undefined,
      requestReason: undefined,
      requestedAt: undefined,
    }

    console.log('💾 Saving updated transaction:', updatedTransaction);
    
    onSaveTransaction(updatedTransaction)
    toast.success("Giao dịch đã được cập nhật thành công!")
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Loại
            </Label>
            <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Chi tiêu</SelectItem>
                <SelectItem value="income">Thu nhập</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Ngày
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("col-span-3 justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Mô tả
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Số tiền
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Danh mục
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    <span className="text-gray-400">Không có danh mục nào</span>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {/* SỬA: Hiển thị thông báo nếu đang dùng default categories */}
            {(!team?.categories || team.categories.length === 0) && (
              <div className="col-span-4 text-xs text-orange-600 text-center">
                Đang sử dụng danh mục mặc định. Team chưa có danh mục tùy chỉnh.
              </div>
            )}
            
            {/* SỬA: Hiển thị warning nếu category không tồn tại */}
            {transaction && category && !availableCategories.some(cat => cat.name === category) && (
              <div className="col-span-4 text-xs text-red-600 text-center">
                ⚠️ Danh mục "{category}" không còn tồn tại trong team
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              Ghi chú
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="col-span-3"
              placeholder="Thêm ghi chú (tùy chọn)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
