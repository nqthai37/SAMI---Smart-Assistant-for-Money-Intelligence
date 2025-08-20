"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterType = "daily" | "weekly" | "monthly" | "annual" | "all-time"

interface DateFilterDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (filterType: FilterType, date?: Date | { month: number; year: number } | { year: number }) => void
  initialFilterType?: FilterType
  initialDate?: Date
}

export function DateFilterDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  initialFilterType = "monthly",
  initialDate = new Date(),
}: DateFilterDialogProps) {
  const [filterType, setFilterType] = useState<FilterType>(initialFilterType)
  const [currentDisplayDate, setCurrentDisplayDate] = useState(initialDate)
  const [selectedDailyDate, setSelectedDailyDate] = useState<Date | null>(
    initialFilterType === "daily" ? initialDate : null,
  )
  const [selectedMonthlyDate, setSelectedMonthlyDate] = useState<{ month: number; year: number } | null>(
    initialFilterType === "monthly" ? { month: initialDate.getMonth(), year: initialDate.getFullYear() } : null,
  )
  const [selectedAnnualDate, setSelectedAnnualDate] = useState<{ year: number } | null>(
    initialFilterType === "annual" ? { year: initialDate.getFullYear() } : null,
  )

  const currentYear = currentDisplayDate.getFullYear()
  const currentMonth = currentDisplayDate.getMonth() // 0-11

  const handleConfirm = () => {
    if (filterType === "daily" && selectedDailyDate) {
      onConfirm(filterType, selectedDailyDate)
    } else if (filterType === "monthly" && selectedMonthlyDate) {
      onConfirm(filterType, selectedMonthlyDate)
    } else if (filterType === "annual" && selectedAnnualDate) {
      onConfirm(filterType, selectedAnnualDate)
    } else if (filterType === "all-time") {
      onConfirm(filterType)
    }
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  // Daily View Logic
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay() // 0 for Sunday, 1 for Monday

  const calendarDays = useMemo(() => {
    const numDays = daysInMonth(currentYear, currentMonth)
    const firstDay = firstDayOfMonth(currentYear, currentMonth)
    const days = []

    // Add leading empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= numDays; i++) {
      days.push(i)
    }
    return days
  }, [currentYear, currentMonth])

  const handleDailyDateClick = (day: number) => {
    setSelectedDailyDate(new Date(currentYear, currentMonth, day))
  }

  const handlePrevMonth = () => {
    setCurrentDisplayDate(new Date(currentYear, currentMonth - 1, 1))
  }
  const handleNextMonth = () => {
    setCurrentDisplayDate(new Date(currentYear, currentMonth + 1, 1))
  }
  const handlePrevYear = () => {
    setCurrentDisplayDate(new Date(currentYear - 1, currentMonth, 1))
  }
  const handleNextYear = () => {
    setCurrentDisplayDate(new Date(currentYear + 1, currentMonth, 1))
  }

  // Monthly View Logic
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const handleMonthlyClick = (monthIndex: number) => {
    setSelectedMonthlyDate({ month: monthIndex, year: currentYear })
  }

  // Annual View Logic
  const years = useMemo(() => {
    const startYear = currentYear - 5 // Show 5 years before and 5 years after
    const endYear = currentYear + 5
    const yearsArray = []
    for (let i = startYear; i <= endYear; i++) {
      yearsArray.push(i)
    }
    return yearsArray
  }, [currentYear])

  const handleAnnualClick = (year: number) => {
    setSelectedAnnualDate({ year })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Chọn thời gian lọc</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Filter Type Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={filterType === "daily" ? "default" : "outline"}
              className={cn(
                "rounded-lg",
                filterType === "daily"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
              onClick={() => setFilterType("daily")}
            >
              Daily
            </Button>
            <Button
              variant={filterType === "weekly" ? "default" : "outline"}
              className={cn(
                "rounded-lg",
                filterType === "weekly"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
              onClick={() => setFilterType("weekly")}
            >
              Weekly
            </Button>
            <Button
              variant={filterType === "monthly" ? "default" : "outline"}
              className={cn(
                "rounded-lg",
                filterType === "monthly"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
              onClick={() => setFilterType("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={filterType === "annual" ? "default" : "outline"}
              className={cn(
                "rounded-lg",
                filterType === "annual"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
              onClick={() => setFilterType("annual")}
            >
              Annual
            </Button>
            <Button
              variant={filterType === "all-time" ? "default" : "outline"}
              className={cn(
                "rounded-lg col-span-2",
                filterType === "all-time"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
              onClick={() => setFilterType("all-time")}
            >
              All Time
            </Button>
          </div>

          {/* Date/Month/Year Selection */}
          {filterType === "daily" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePrevYear}>
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-lg">
                  Thg {currentMonth + 1} {currentYear}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNextYear}>
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "rounded-lg w-10 h-10",
                      day === selectedDailyDate?.getDate() &&
                        currentMonth === selectedDailyDate?.getMonth() &&
                        currentYear === selectedDailyDate?.getFullYear()
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                      !day && "invisible",
                    )}
                    onClick={() => day && handleDailyDateClick(day)}
                    disabled={!day}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {filterType === "monthly" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={handlePrevYear}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-lg">{currentYear}</span>
                <Button variant="ghost" size="icon" onClick={handleNextYear}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {months.map((month, index) => (
                  <Button
                    key={month}
                    variant="outline"
                    className={cn(
                      "rounded-lg",
                      selectedMonthlyDate?.month === index && selectedMonthlyDate?.year === currentYear
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    )}
                    onClick={() => handleMonthlyClick(index)}
                  >
                    {month}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {filterType === "annual" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentDisplayDate(new Date(currentYear - 10, currentMonth, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-lg">{currentYear}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentDisplayDate(new Date(currentYear + 10, currentMonth, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {years.map((year) => (
                  <Button
                    key={year}
                    variant="outline"
                    className={cn(
                      "rounded-lg",
                      selectedAnnualDate?.year === year
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    )}
                    onClick={() => handleAnnualClick(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {filterType === "all-time" && (
            <div className="text-center text-gray-600 text-lg py-8">Hiển thị tất cả giao dịch từ trước đến nay.</div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
              onClick={handleConfirm}
              disabled={
                (filterType === "daily" && !selectedDailyDate) ||
                (filterType === "monthly" && !selectedMonthlyDate) ||
                (filterType === "annual" && !selectedAnnualDate)
              }
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
