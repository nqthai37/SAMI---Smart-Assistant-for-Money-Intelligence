"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  firstName: string
  lastName: string
  phoneNumber: string
  dateOfBirth?: string // New field
  gender?: "Male" | "Female" | "Other" // New field
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (data: any) => Promise<boolean>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<boolean> // New function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    name: "Phùng Đình",
    email: "phungdinh@gmail.com",
    avatar: "PĐ",
    firstName: "Phùng",
    lastName: "Đình",
    phoneNumber: "0123456789",
    dateOfBirth: "1990-05-15", // Sample data
    gender: "Male", // Sample data
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser && password === "123456") {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))
      return true
    }

    return false
  }

  const signup = async (data: any): Promise<boolean> => {
    // Check if email already exists
    const existingUser = mockUsers.find((u) => u.email === data.email)
    if (existingUser) {
      return false
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      avatar: `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth || undefined, // Include new fields
      gender: data.gender || undefined, // Include new fields
    }

    mockUsers.push(newUser)
    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  // New function to update user data
  const updateUser = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false

    const updatedUser = { ...user, ...data }
    const userIndex = mockUsers.findIndex((u) => u.id === user.id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser
    }

    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
    return true
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
