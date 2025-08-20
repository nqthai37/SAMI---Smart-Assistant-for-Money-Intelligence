// Tên file: lib/api.ts

// Hàm chính để thực hiện yêu cầu fetch đã được xác thực
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    // 1. Tự động lấy token từ localStorage
    const token = localStorage.getItem("sami_token");
  
    // 2. Tạo header mặc định và thêm token nếu có
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  
    // 3. Gọi API bằng fetch gốc
    // Giả sử API của bạn có tiền tố là /api (được proxy bởi Next.js)
    const response = await fetch(`/api${url}`, { ...options, headers });
  
    // 4. Xử lý lỗi tập trung
    if (!response.ok) {
      const errorData = await response.json();
      // Ném lỗi để các component có thể bắt lại bằng try...catch
      throw new Error(errorData.message || 'Đã có lỗi xảy ra');
    }
  
    // Nếu không có lỗi, trả về dữ liệu dạng JSON
    return response.json();
  };
  
  // 5. Tạo các hàm tiện ích GET, POST, PUT, DELETE
  export const api = {
    get: (url: string) => fetchWithAuth(url, { method: 'GET' }),
    post: (url:string, body: any) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url: string, body: any) => fetchWithAuth(url, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (url: string, body: any) => fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (url: string) => fetchWithAuth(url, { method: 'DELETE' }),
  };