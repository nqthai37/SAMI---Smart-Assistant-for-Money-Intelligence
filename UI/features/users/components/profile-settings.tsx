"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Pencil } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function ProfileSettings() {
  const { user, updateUser } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
  )
  const [gender, setGender] = useState<"Male" | "Female" | "Other">(user?.gender || "Other")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setEmail(user.email || "")
      setPhoneNumber(user.phoneNumber || "")
      setDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth) : undefined)
      setGender(user.gender || "Other")
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.")
      setIsLoading(false)
      return
    }

    try {
      const success = await updateUser({
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : undefined,
        gender,
        name: `${firstName} ${lastName}`, // Update full name
        avatar: `${firstName.charAt(0)}${lastName.charAt(0)}`, // Update avatar fallback
      })

      if (success) {
        toast.success("Cập nhật hồ sơ thành công!")
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật hồ sơ.")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Có lỗi xảy ra, vui lòng thử lại!")
    } finally {
      setIsLoading(false)
    }
  }

  // Mock function for changing profile picture
  const handleChangeProfilePicture = () => {
    toast.info("Tính năng thay đổi ảnh đại diện đang được phát triển.")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile Picture" />
            <AvatarFallback className="bg-blue-500 text-white text-2xl">{user?.avatar}</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full bg-white border-gray-300 shadow-sm"
            onClick={handleChangeProfilePicture}
            aria-label="Change profile picture"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              Tên
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Họ
            </Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
            Số điện thoại
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Ngày sinh</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-50 border-gray-300",
                  !dateOfBirth && "text-muted-foreground",
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? format(dateOfBirth, "dd/MM/yyyy") : "Chọn ngày sinh"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateOfBirth}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    setDateOfBirth(selectedDate)
                    setIsCalendarOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Giới tính</Label>
          <RadioGroup
            value={gender}
            onValueChange={(value: "Male" | "Female" | "Other") => setGender(value)}
            className="flex gap-6"
            disabled={isLoading}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Male" id="gender-male" />
              <Label htmlFor="gender-male" className="text-sm font-normal">
                Nam
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Female" id="gender-female" />
              <Label htmlFor="gender-female" className="text-sm font-normal">
                Nữ
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Other" id="gender-other" />
              <Label htmlFor="gender-other" className="text-sm font-normal">
                Khác
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang cập nhật...
            </div>
          ) : (
            "Cập nhật hồ sơ"
          )}
        </Button>
      </form>
    </div>
  )
}
