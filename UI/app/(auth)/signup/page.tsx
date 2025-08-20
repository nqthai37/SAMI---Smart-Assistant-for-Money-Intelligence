"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"

export default function SignupPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin.")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp.")
      setIsLoading(false)
      return
    }

    try {
      await signup(email, password, firstName, lastName)
      toast.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.")
      router.push("/login") // Chuyển hướng đến trang đăng nhập sau khi đăng ký
    } catch (error: any) {
      toast.error(error.message || "Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = (provider: string) => {
    toast.info(`Tính năng đăng ký bằng ${provider} đang được phát triển`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Sami</span>
          </div>

          {/* Signup Form Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tạo tài khoản</h1>
            <p className="text-sm text-gray-600 mb-6">Bắt đầu quản lý chi tiêu nhóm của bạn.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Tên</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                    required
                    disabled={isLoading}
                    placeholder="Văn"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Họ</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                    required
                    disabled={isLoading}
                    placeholder="Nguyễn"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                  disabled={isLoading}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" disabled={isLoading}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" disabled={isLoading}>
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang tạo tài khoản...
                  </div>
                ) : (
                  "Tạo tài khoản"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Đăng nhập
                </Link>
              </p>
            </div>
            
            {/* Social Signup Separator */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc đăng ký với</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                 {/* Social Buttons */}
                 <Button variant="outline" onClick={() => handleSocialSignup("Facebook")} className="w-full py-3 bg-transparent" disabled={isLoading}>
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </Button>
                <Button variant="outline" onClick={() => handleSocialSignup("Google")} className="w-full py-3 bg-transparent" disabled={isLoading}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                </Button>
                 <Button variant="outline" onClick={() => handleSocialSignup("Apple")} className="w-full py-3 bg-transparent" disabled={isLoading}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 to-purple-50 items-center justify-center p-8">
        {/* (The illustration part is the same as login page) */}
        <div className="relative">
          <div className="relative">
            <div className="w-80 h-96 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl transform rotate-12 shadow-2xl">
              <div className="absolute inset-4 bg-white rounded-2xl p-6 transform -rotate-12">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div className="bg-blue-100 px-4 py-2 rounded-full mb-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                         <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" /></svg>
                      </div>
                      <span className="text-blue-700 text-sm font-medium">Account Created</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">Welcome!</p>
                    <p className="text-xs text-gray-500">Your journey starts now.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}