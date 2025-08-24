import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8383/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sami_token'); // SỬA LỖI: Thay 'authToken' bằng 'sami_token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Định nghĩa kiểu dữ liệu cho việc cập nhật hồ sơ.
 * Bạn có thể thêm các trường khác mà người dùng được phép cập nhật.
 * SỬA ĐỔI: Mở rộng interface để khớp với dữ liệu từ form
 */
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string | Date;
  gender?: "Male" | "Female" | "Other";
}

/**
 * Gửi yêu cầu cập nhật thông tin hồ sơ của người dùng hiện tại.
 * @param userData - Dữ liệu cần cập nhật.
 * @returns Promise chứa dữ liệu trả về từ server.
 */
export const updateMyProfile = async (userData: UpdateProfilePayload) => {
  try {
    // Gửi yêu cầu PATCH đến endpoint đã được định nghĩa trong userRoute.ts
    const response = await apiClient.patch('/user/updateprofile', userData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ:', error);
    // Ném lỗi để component có thể xử lý (ví dụ: hiển thị thông báo lỗi)
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Không thể cập nhật hồ sơ.');
    }
    throw new Error('Đã xảy ra lỗi không xác định.');
  }
};

// Bạn có thể thêm các hàm gọi API khác liên quan đến user ở đây
// Ví dụ: hàm lấy thông tin profile
export const getMyProfile = async () => {
    try {
        const response = await apiClient.get('/user/profile');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin hồ sơ:', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Không thể lấy thông tin hồ sơ.');
        }
        throw new Error('Đã xảy ra lỗi không xác định.');
    }
}

/**
 * Gửi yêu cầu đổi mật khẩu người dùng hiện tại.
 * @param oldPassword - Mật khẩu cũ.
 * @param newPassword - Mật khẩu mới.
 * @returns Promise chứa dữ liệu trả về từ server.
 */
export const changeMyPassword = async (oldPassword: string, newPassword: string) => {
  try {
    const response = await apiClient.post('/user/change-password', { oldPassword, newPassword });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Không thể đổi mật khẩu.');
    }
    throw new Error('Đã xảy ra lỗi không xác định khi đổi mật khẩu.');
  }
};