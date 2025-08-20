import { toast } from "react-hot-toast"

// Hàm trợ giúp để xử lý các cuộc gọi API
async function fetchApi(url: string, options: RequestInit) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Lỗi không xác định" }))
    console.error("API Error:", errorData)
    toast.error(errorData.message || "Đã có lỗi xảy ra từ máy chủ.")
    throw new Error(errorData.message)
  }

  // Nếu response không có nội dung (ví dụ: DELETE request) thì trả về success
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true }
  }

  return response.json()
}

// API để yêu cầu sửa một giao dịch
export const requestEditTransactionAPI = (
  transactionId: string,
  proposedChanges: any,
  token: string | null
) => {
  return fetchApi(`/api/transactions/${transactionId}/requests/edit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ proposedChanges }),
  })
}

// API để yêu cầu xóa một giao dịch
export const requestDeleteTransactionAPI = (transactionId: string, token: string | null) => {
  return fetchApi(`/api/transactions/${transactionId}/requests/delete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}