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
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    date: new Date(),
    description: "",
    amount: 0,
    categoryName: "", // Đảm bảo có giá trị mặc định
    note: ""
  });

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

  // 2. Debug khi category được chọn
  const handleCategoryChange = (selectedCategory: string) => {
    console.log('=== CATEGORY SELECTION DEBUG ===');
    console.log('Selected category:', selectedCategory);
    console.log('Current formData before update:', formData);
    
    setFormData(prev => {
      const updated = { ...prev, categoryName: selectedCategory };
      console.log('Updated formData:', updated);
      return updated;
    });
  };

  // 3. Debug khi submit
  const handleSubmit = async () => {
    console.log('=== FORM SUBMIT DEBUG ===');
    console.log('Final formData:', formData);
    console.log('CategoryName value:', formData.categoryName);
    console.log('CategoryName type:', typeof formData.categoryName);
    console.log('CategoryName length:', formData.categoryName?.length);
    
    // Validate trước khi gọi handler
    if (!formData.categoryName || formData.categoryName.trim() === '') {
      console.error('❌ CategoryName validation failed');
      toast.error("Vui lòng chọn danh mục cho giao dịch.");
      return;
    }
    
    console.log('✅ CategoryName validation passed, calling onAddTransaction');
    
    try {
      await onQuickAddTransaction(formData);
      // Reset form sau khi thành công
      setFormData({
        type: "expense",
        date: new Date(),
        description: "",
        amount: 0,
        categoryName: "",
        note: ""
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

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

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Danh mục</Label>
            <select 
              value={formData.categoryName} 
              onChange={(e) => {
                console.log('Select onChange triggered:', e.target.value);
                handleCategoryChange(e.target.value);
              }}
              className="w-full p-2 border rounded-md"
            >
              <option value="">-- Chọn danh mục --</option>
              <option value="Ăn uống">Ăn uống</option>
              <option value="Di chuyển">Di chuyển</option>
              <option value="Giải trí">Giải trí</option>
              <option value="Mua sắm">Mua sắm</option>
              <option value="Lương">Lương</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Debug display */}
          <div style={{fontSize: '12px', color: 'gray', marginTop: '10px'}}>
            Debug: CategoryName = "{formData.categoryName}"
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
