"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho user và context
type User = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lấy URL của backend từ biến môi trường, nếu không có thì dùng default
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8383/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Khi component được mount, kiểm tra localStorage để tự động đăng nhập
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("sami_token");
      const storedUser = localStorage.getItem("sami_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
    }
    setLoading(false);
  }, []);

  // Hàm đăng nhập
  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return false;

    const data = await res.json(); // Backend trả về { message, token, user }
    if (data?.token && data?.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("sami_token", data.token);
      localStorage.setItem("sami_user", JSON.stringify(data.user));
      return true;
    }
    return false;
  };

  // Hàm đăng ký
  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Đăng ký thất bại." }));
      // Ném lỗi để component có thể bắt và hiển thị thông báo
      throw new Error(errorData.message);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sami_token");
    localStorage.removeItem("sami_user");
    router.push('/auth/login'); // Chuyển hướng về trang đăng nhập
  };

  // Dùng useMemo để tối ưu, tránh re-render không cần thiết
  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook để sử dụng AuthContext dễ dàng hơn
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}