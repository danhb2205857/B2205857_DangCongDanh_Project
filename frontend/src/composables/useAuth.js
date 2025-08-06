import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "@/utils/axios";

// Global state cho authentication
const token = ref(localStorage.getItem("token"));
const user = ref(
  (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Error parsing user from localStorage:", error);
      return null;
    }
  })()
);

export function useAuth() {
  // Computed properties
  const isAuthenticated = computed(() => !!token.value);
  const currentUser = computed(() => user.value || null);

  // Login function for readers (độc giả)
  const loginReader = async (credentials) => {
    try {
      const response = await axios.post("/docgia/login", {
        email: credentials.email,
        password: credentials.password,
      });

      // Lưu token và user info từ response
      token.value = response.data.data.token;
      user.value = response.data.data.docGia;

      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.docGia));
      localStorage.setItem("userRole", "reader");

      // Set default Authorization header cho axios
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.data.token}`;

      return { success: true, user: response.data.data.docGia };
    } catch (error) {
      console.error("Reader login error:", error);

      let errorMessage = "Đăng nhập thất bại";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Login function for staff (nhân viên) - keep existing
  const loginStaff = async (credentials) => {
    try {
      const response = await axios.post("/auth/login", {
        msnv: credentials.username,
        password: credentials.password,
      });

      token.value = response.data.data.token;
      user.value = response.data.data.user;

      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      localStorage.setItem("userRole", "staff");

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.data.token}`;

      return { success: true, user: response.data.data.user };
    } catch (error) {
      console.error("Staff login error:", error);

      let errorMessage = "Đăng nhập thất bại";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Generic login function (defaults to reader login for public)
  const login = loginReader;

  // Register function for readers
  const register = async (userData) => {
    try {
      const response = await axios.post("/docgia/register", userData);

      // Auto login after successful registration
      token.value = response.data.data.token;
      user.value = response.data.data.docGia;

      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.docGia));
      localStorage.setItem("userRole", "reader");

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.data.token}`;

      return { success: true, user: response.data.data.docGia };
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage = "Đăng ký thất bại";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear local storage first
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");

      // Remove Authorization header
      delete axios.defaults.headers.common["Authorization"];

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn clear local data ngay cả khi có lỗi
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      delete axios.defaults.headers.common["Authorization"];

      return { success: false, error: error.message };
    }
  };

  // Check if token is expired
  const isTokenExpired = () => {
    if (!token.value) return true;

    try {
      // Decode JWT token để check expiration
      const payload = decodeJWTPayload(token.value);
      const currentTime = Date.now() / 1000;

      return payload.exp < currentTime;
    } catch (error) {
      console.error("Token decode error:", error);
      return true;
    }
  };

  // Refresh token if needed
  const refreshToken = async () => {
    try {
      const response = await axios.post("/auth/refresh");

      // Update token
      token.value = response.data.token;
      localStorage.setItem("token", response.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      return { success: true };
    } catch (error) {
      console.error("Refresh token error:", error);
      logout();
      return { success: false };
    }
  };

  // Initialize auth state khi app khởi động
  const initAuth = () => {
    if (token.value && !isTokenExpired()) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    } else if (token.value && isTokenExpired()) {
      // Token hết hạn, logout
      logout();
    }
  };

  // Get user profile (for readers)
const getProfile = async () => {
  try {
    if (!token.value) {
      return { success: false, error: 'Không có token' };
    }

    const response = await axios.get("/docgia/profile");
    user.value = response.data.data;
    localStorage.setItem("user", JSON.stringify(response.data.data));
    return { success: true, user: response.data.data };
  } catch (error) {
    if (error.response?.status === 401) {
      await logout();
    }

    return {
      success: false,
      error: error.response?.data?.message || "Không thể lấy thông tin profile",
    };
  }
};

  // Update profile (for readers)
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("/docgia/profile", profileData);
      user.value = response.data.data;
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return { success: true, user: response.data.data };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Không thể cập nhật profile",
      };
    }
  };

  // Change password (for readers)
  const changePassword = async (passwordData) => {
    try {
      await axios.put("/docgia/change-password", passwordData);
      return { success: true };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Không thể đổi mật khẩu",
      };
    }
  };

  // Get user role
  const getUserRole = () => {
    return localStorage.getItem("userRole") || "reader";
  };

  return {
    // State
    token: computed(() => token.value),
    user: currentUser,
    isAuthenticated,

    // Methods
    login,
    loginReader,
    loginStaff,
    register,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    getUserRole,
    isTokenExpired,
    refreshToken,
    initAuth,
  };
}

// Helper function để decode JWT token (cho real tokens từ backend)
function decodeJWTPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Decode payload part
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    // Replace URL-safe characters
    const base64 = paddedPayload.replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(atob(base64));
  } catch (error) {
    throw new Error("Failed to decode token");
  }
}

// Helper function để decode base64 thành UTF-8 string (nếu cần)
function base64UrlDecode(str) {
  // Add padding if needed
  str += "=".repeat((4 - (str.length % 4)) % 4);

  // Replace URL-safe characters
  str = str.replace(/-/g, "+").replace(/_/g, "/");

  try {
    // Decode base64 to binary string
    const binary = atob(str);

    // Convert binary string to UTF-8 bytes
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Decode UTF-8 bytes to string
    return new TextDecoder().decode(bytes);
  } catch (error) {
    console.error("Base64 decode error:", error);
    throw error;
  }
}
