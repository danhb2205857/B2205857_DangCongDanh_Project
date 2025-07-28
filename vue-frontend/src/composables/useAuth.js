import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// Global state cho authentication
const token = ref(localStorage.getItem("token"));
const user = ref(JSON.parse(localStorage.getItem("user") || "null"));

export function useAuth() {
  const router = useRouter();

  // Computed properties
  const isAuthenticated = computed(() => !!token.value);
  const currentUser = computed(() => user.value);

  // Login function
  const login = async (credentials) => {
    try {
      // TODO: Thay thế bằng API call thực tế khi backend sẵn sàng
      const response = await mockLogin(credentials);

      // Lưu token và user info
      token.value = response.token;
      user.value = response.user;

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Set default Authorization header cho axios
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.token}`;

      return { success: true, user: response.user };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Đăng nhập thất bại",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // TODO: Call logout API khi backend sẵn sàng
      // await axios.post('/api/auth/logout')

      // Clear local storage
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Remove Authorization header
      delete axios.defaults.headers.common["Authorization"];

      // Redirect to login
      router.push("/login");

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn clear local data ngay cả khi API call thất bại
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      router.push("/login");

      return { success: false, error: error.message };
    }
  };

  // Check if token is expired
  const isTokenExpired = () => {
    if (!token.value) return true;

    try {
      // Decode JWT token để check expiration
      const payload = JSON.parse(base64UrlDecode(token.value.split(".")[1]));
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
      // TODO: Implement refresh token logic khi backend sẵn sàng
      console.log("Refresh token logic sẽ được implement sau");
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

  return {
    // State
    token: computed(() => token.value),
    user: currentUser,
    isAuthenticated,

    // Methods
    login,
    logout,
    isTokenExpired,
    refreshToken,
    initAuth,
  };
}

// Mock login function - sẽ được thay thế bằng API call thực tế
async function mockLogin(credentials) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock validation
  if (credentials.username === "admin" && credentials.password === "admin") {
    const mockToken = generateMockJWT({
      id: 1,
      username: credentials.username,
      name: "Quản trị viên",
      role: "admin",
    });

    return {
      token: mockToken,
      user: {
        id: 1,
        username: credentials.username,
        name: "Quản trị viên",
        role: "admin",
      },
    };
  } else {
    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
  }
}

// Generate mock JWT token
function generateMockJWT(payload) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
  const payloadWithExp = { ...payload, exp };
  const encodedPayload = base64UrlEncode(JSON.stringify(payloadWithExp));
  const signature = base64UrlEncode("mock-signature");

  return `${header}.${encodedPayload}.${signature}`;
}

// Helper function để encode UTF-8 strings thành base64
function base64UrlEncode(str) {
  // Convert string to UTF-8 bytes
  const utf8Bytes = new TextEncoder().encode(str);

  // Convert bytes to base64
  let binary = "";
  utf8Bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Helper function để decode base64 thành UTF-8 string
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
