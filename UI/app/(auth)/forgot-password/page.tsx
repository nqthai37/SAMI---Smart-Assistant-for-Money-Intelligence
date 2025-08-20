"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsError(false)

    if (!email) {
      setMessage("Vui lòng nhập địa chỉ email của bạn.")
      setIsError(true)
      return
    }

    // Simulate API call for password reset
    setTimeout(() => {
      if (email === "test@example.com") {
        setMessage("Một email chứa hướng dẫn đặt lại mật khẩu đã được gửi đến địa chỉ của bạn.")
        setIsError(false)
        toast.success("Email đặt lại mật khẩu đã được gửi!")
      } else {
        setMessage("Địa chỉ email không được nhận diện. Vui lòng kiểm tra lại.")
        setIsError(true)
        toast.error("Email không tồn tại!")
      }
    }, 1500)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Quên mật khẩu?</CardTitle>
          <CardDescription>Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {message && <p className={`text-sm ${isError ? "text-red-500" : "text-green-600"}`}>{message}</p>}
            <Button type="submit" className="w-full">
              Gửi
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/auth/login" className="underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
