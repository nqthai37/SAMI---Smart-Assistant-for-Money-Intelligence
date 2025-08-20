import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api"; // 1. Import api helper của bạn

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type User = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string; // Thêm vào
  dateOfBirth?: string; // Thêm vào
  gender?: "Male" | "Female" | "Other"; // Thêm vào
  avatar?: string;
};

// ✅ BƯỚC 2: CẬP NHẬT LẠI TYPE CỦA CONTEXT
// Thêm hàm updateUser vào
type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateUser: (profileData: Partial<User>) => Promise<boolean>; // Thêm vào
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("sami_token");
    const storedUser = localStorage.getItem("sami_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đăng nhập thất bại');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("sami_token", data.token);
      localStorage.setItem("sami_user", JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Đăng ký thất bại');
  };

  // 3. Sửa hàm logout để gọi API
  const logout = async () => {
    try {
      // Gọi API logout ở backend bằng api helper
      // Không cần truyền body, vì server chỉ cần token trong header
      await api.post('/auth/logout', {});
    } catch (error) {
      // Thậm chí nếu API lỗi, vẫn nên đăng xuất ở client
      console.error("Server logout failed, proceeding with client-side logout.", error);
    } finally {
      // Luôn thực hiện các bước đăng xuất ở client
      setUser(null);
      setToken(null);
      localStorage.removeItem("sami_token");
      localStorage.removeItem("sami_user");
      router.push('/login'); // Chuyển hướng về trang đăng nhập
    }
  };

  const updateUser = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      // Gọi API để cập nhật profile
      const response = await api.patch("/user/profile", profileData);

      if (response && response.user) {
        // Cập nhật lại user trong state và localStorage
        setUser(response.user);
        localStorage.setItem("sami_user", JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Auth context error updating user:", error);
      // Ném lỗi ra để component có thể bắt và hiển thị
      throw error;
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout, updateUser }), // Thêm updateUser vào value
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}