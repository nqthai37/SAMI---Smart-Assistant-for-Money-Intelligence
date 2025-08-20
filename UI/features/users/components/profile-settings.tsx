// File: features/users/components/profile-settings.tsx
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

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: "Male" | "Female" | "Other"; // Chỉ định rõ các giá trị được phép
}

export function ProfileSettings() {
  const { user, updateUser } = useAuth()
  
  // State được khởi tạo một lần khi component mount
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "Other",
  });

  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // useEffect để đồng bộ state với user từ context khi nó thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        gender: (user.gender as ProfileFormData['gender']) || "Other",
      })
      setDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth) : undefined)
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Chỉ gửi những trường mà backend chấp nhận
      const payload = {
        ...formData,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
      };

      const success = await updateUser(payload)

      if (success) {
        toast.success("Cập nhật hồ sơ thành công!")
      } else {
        throw new Error("Phản hồi từ server không thành công.");
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user?.avatar} alt="Profile Picture" />
            <AvatarFallback className="bg-blue-500 text-white text-2xl">
              {/* SỬA LỖI: Hiển thị chữ cái đầu của firstName và lastName */}
              {(user?.firstName?.charAt(0) ?? "") + (user?.lastName?.charAt(0) ?? "")}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full" onClick={() => toast.info("Tính năng đang phát triển.")}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
        <div>
           {/* SỬA LỖI: Hiển thị tên đầy đủ */}
          <h3 className="text-xl font-semibold text-gray-900">{user ? `${user.firstName} ${user.lastName}`: ''}</h3>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Tên</Label>
            <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="lastName">Họ</Label>
            <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required disabled={isLoading} />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required disabled={isLoading} />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Số điện thoại</Label>
          <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} disabled={isLoading} />
        </div>

        <div>
          <Label className="mb-2 block">Ngày sinh</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateOfBirth && "text-muted-foreground")} disabled={isLoading}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? format(dateOfBirth, "dd/MM/yyyy") : "Chọn ngày sinh"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateOfBirth} onSelect={(d) => { setDateOfBirth(d); setIsCalendarOpen(false); }} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="mb-2 block">Giới tính</Label>
          <RadioGroup value={formData.gender} onValueChange={(v: any) => setFormData(p => ({...p, gender: v}))} className="flex gap-6" disabled={isLoading}>
            <div className="flex items-center space-x-2"><RadioGroupItem value="Male" id="gender-male" /><Label htmlFor="gender-male">Nam</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="Female" id="gender-female" /><Label htmlFor="gender-female">Nữ</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="Other" id="gender-other" /><Label htmlFor="gender-other">Khác</Label></div>
          </RadioGroup>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
        </Button>
      </form>
    </div>
  )
}