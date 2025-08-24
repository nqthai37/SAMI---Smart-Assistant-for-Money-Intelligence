"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { TeamDetails, Transaction } from "@/types/user"
//import { expenseCategories, incomeCategories } from "@/data/categories"

interface TransactionFilterDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onApplyFilters: (filters: {
    creators: string[]
    categories: string[]
    type: "all" | "income" | "expense"
  }) => void
  initialFilters: {
    creators: string[]
    categories: string[]
    type: "all" | "income" | "expense"
  }
  allTransactions: Transaction[]
  team?: TeamDetails
}

export function TransactionFilterDialog({
  isOpen,
  onOpenChange,
  onApplyFilters,
  initialFilters,
  allTransactions,
  team,
}: TransactionFilterDialogProps) {
  const [selectedCreators, setSelectedCreators] = useState<string[]>(initialFilters.creators)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.categories)
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">(initialFilters.type)

  const uniqueCreators = Array.from(new Set(allTransactions.map((t) => t.createdBy)))
  const getTeamCategories = () => {
    if (!team?.categories || team.categories.length === 0) {
      // SỬA: Fallback categories nếu team chưa có
      const defaultCategories = [
        { name: "Ăn uống", icon: "🍽️" },
        { name: "Di chuyển", icon: "🚗" },
        { name: "Mua sắm", icon: "🛒" },
        { name: "Giải trí", icon: "🎬" },
        { name: "Sức khỏe", icon: "🏥" },
        { name: "Lương", icon: "💰" },
        { name: "Thưởng", icon: "🎁" },
        { name: "Đầu tư", icon: "📈" },
        { name: "Bán hàng", icon: "🛍️" },
        { name: "Khác", icon: "📦" }
      ];
      return defaultCategories;
    }

    // SỬA: Parse team categories nếu là JSON string
    let categories;
    try {
      categories = typeof team.categories === 'string' 
        ? JSON.parse(team.categories) 
        : team.categories;
    } catch {
      categories = [];
    }

    return categories;
  };
  const teamCategories = getTeamCategories();
  const allAvailableCategories = Array.from(
    new Set(teamCategories.map((c) => c.name))
  );


  const handleCreatorChange = (creator: string, checked: boolean) => {
    setSelectedCreators((prev) => (checked ? [...prev, creator] : prev.filter((c) => c !== creator)))
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories((prev) => (checked ? [...prev, category] : prev.filter((c) => c !== category)))
  }

  const handleApply = () => {
    onApplyFilters({
      creators: selectedCreators,
      categories: selectedCategories,
      type: selectedType,
    })
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle>Lọc giao dịch</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Filter by Creator */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Người nhập giao dịch</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
              {uniqueCreators.map((creator) => (
                <div key={creator} className="flex items-center space-x-2">
                  <Checkbox
                    id={`creator-${creator}`}
                    checked={selectedCreators.includes(creator)}
                    onCheckedChange={(checked) => handleCreatorChange(creator, checked as boolean)}
                  />
                  <Label htmlFor={`creator-${creator}`} className="text-sm font-normal">
                    {creator}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Filter by Category */}
          <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Danh mục</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
              {allAvailableCategories.length > 0 ? (
                allAvailableCategories.map((category) => {
                  // SỬA: Tìm category object để lấy icon
                  const categoryObj = teamCategories.find(c => c.name === category);
                  
                  return (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm font-normal flex items-center gap-1">
                        {/* SỬA: Hiển thị icon nếu có */}
                        {categoryObj?.icon && <span>{categoryObj.icon}</span>}
                        <span>{category}</span>
                      </Label>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center text-gray-500 text-sm">
                  Không có danh mục nào
                </div>
              )}
            </div>
            
            {/* SỬA: Hiển thị thông báo nếu đang dùng default */}
            {(!team?.categories || team.categories.length === 0) && (
              <p className="text-xs text-orange-600 mt-2">
                Đang hiển thị danh mục mặc định. Team chưa có danh mục tùy chỉnh.
              </p>
            )}
          </div>

          {/* Filter by Type */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Loại giao dịch</Label>
            <RadioGroup
              value={selectedType}
              onValueChange={(value: "all" | "income" | "expense") => setSelectedType(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="type-all" />
                <Label htmlFor="type-all">Tất cả</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="type-income" />
                <Label htmlFor="type-income">Thu</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="type-expense" />
                <Label htmlFor="type-expense">Chi</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button className="flex-1 rounded-lg bg-red-500 text-white hover:bg-red-600" onClick={handleApply}>
              Áp dụng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
