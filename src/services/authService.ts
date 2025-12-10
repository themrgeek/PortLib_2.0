import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// IMPORTANT: Replace with your actual backend URL
// For iOS Simulator: use "http://localhost:3000"
// For Android Emulator: use "http://10.0.2.2:3000"
// For Physical Device: use "http://YOUR_COMPUTER_IP:3000" (e.g., "http://192.168.1.100:3000")
// To find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: "http://192.168.1.6:3000", // iOS Simulator
      android: "http://192.168.1.6:3000", // Android Emulator
      default: "http://192.168.1.6:3000",
    })
  : "https://your-production-api.com"; // Production URL

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_ID_KEY = "user_id";

export interface LoginRequest {
  phone: string; // API expects "phone" not "emailOrPhone"
  password: string; // Plaintext password as requested
}

export interface SignUpRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  studentId: string;
  password: string; // Plaintext password as requested
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken?: string;
  token?: string; // Support both formats
  refreshToken?: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiry?: string;
    refreshTokenExpiry?: string;
  };
  requiresEmailVerification?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    phone?: string;
  };
  userId?: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  studentId: string;
  [key: string]: any;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  [key: string]: any;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResendVerificationRequest {
  userId: string;
}

export const authService = {
  // Helper to get auth headers
  async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },

  // Login with phone and plaintext password
  // POST /api/auth/login/password
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: credentials.phone,
          password: credentials.password, // Sending plaintext password
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Login failed" }));
        throw new Error(error.message || "Login failed");
      }

      const data: AuthResponse = await response.json();

      // Store tokens in SecureStore
      const token = data.accessToken || data.token;
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
      if (data.refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      if (data.userId || data.user?.id) {
        await SecureStore.setItemAsync(
          USER_ID_KEY,
          data.userId || data.user?.id || ""
        );
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register new student account
  // POST /api/auth/register/student
  async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    try {
      console.log("[signUp] request payload", {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phoneNumber,
        studentId: userData.studentId,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/auth/register/student`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phoneNumber, // <-- use "phone" instead of "phoneNumber"
            studentId: userData.studentId,
            password: userData.password,
            confirmPassword: userData.confirmPassword,
          }),
        }
      );

      if (!response.ok) {
        // Try to surface backend validation details
        let message = "Sign up failed";
        let rawText = "";
        let status = response.status;
        try {
          const errorJson = await response.json();
          message =
            errorJson?.message ||
            errorJson?.error ||
            errorJson?.errors?.join?.(", ") ||
            message;
          console.log("[signUp] validation error json", {
            status,
            errorJson,
          });
        } catch (_err) {
          try {
            const text = await response.text();
            rawText = text;
            if (text) {
              message = `${message}: ${text}`;
            }
            console.log("[signUp] validation error text", { status, text });
          } catch {
            // ignore
          }
        }
        throw new Error(message);
      }

      const data: AuthResponse = await response.json();

      // Store userId for OTP verification
      if (data.userId || data.user?.id) {
        await SecureStore.setItemAsync(
          USER_ID_KEY,
          data.userId || data.user?.id || ""
        );
      }

      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  },

  // Verify signup OTP
  // POST /api/auth/verify/signup-otp
  async verifyOTP(otp: string): Promise<AuthResponse> {
    try {
      const userId = await SecureStore.getItemAsync(USER_ID_KEY);
      if (!userId) {
        throw new Error("User ID not found. Please register again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/auth/verify/signup-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            otp,
          }),
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "OTP verification failed" }));
        throw new Error(error.message || "OTP verification failed");
      }

      const data: AuthResponse = await response.json();

      // Store tokens in SecureStore
      const tokenFromTokens = data.tokens?.accessToken;
      const refreshFromTokens = data.tokens?.refreshToken;
      const token = data.accessToken || data.token || tokenFromTokens;
      const refresh = data.refreshToken || refreshFromTokens;

      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
      if (refresh) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
      }

      return data;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  },

  // Resend verification OTP
  // POST /api/auth/resend-verification
  async resendVerification(): Promise<void> {
    try {
      const userId = await SecureStore.getItemAsync(USER_ID_KEY);
      if (!userId) {
        throw new Error("User ID not found. Please register again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to resend verification" }));
        throw new Error(error.message || "Failed to resend verification");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      throw error;
    }
  },

  // Get stored access token
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Get token error:", error);
      return null;
    }
  },

  // Get stored refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Get refresh token error:", error);
      return null;
    }
  },

  // Refresh access token
  // POST /api/auth/refresh-token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        // If refresh fails, clear tokens
        await this.clearTokens();
        throw new Error("Token refresh failed. Please login again.");
      }

      const data: AuthResponse = await response.json();

      // Store new tokens
      const token = data.accessToken || data.token;
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
      if (data.refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  },

  // Get user profile
  // GET /api/auth/profile
  async getProfile(): Promise<ProfileResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          try {
            await this.refreshToken();
            // Retry with new token
            const newHeaders = await this.getAuthHeaders();
            const retryResponse = await fetch(
              `${API_BASE_URL}/api/auth/profile`,
              {
                method: "GET",
                headers: newHeaders,
              }
            );
            if (!retryResponse.ok) {
              throw new Error("Failed to get profile");
            }
            return await retryResponse.json();
          } catch (refreshError) {
            throw new Error("Session expired. Please login again.");
          }
        }
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to get profile" }));
        throw new Error(error.message || "Failed to get profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },

  // Update user profile
  // PUT /api/auth/profile
  async updateProfile(
    profileData: UpdateProfileRequest
  ): Promise<ProfileResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          try {
            await this.refreshToken();
            // Retry with new token
            const newHeaders = await this.getAuthHeaders();
            const retryResponse = await fetch(
              `${API_BASE_URL}/api/auth/profile`,
              {
                method: "PUT",
                headers: newHeaders,
                body: JSON.stringify(profileData),
              }
            );
            if (!retryResponse.ok) {
              throw new Error("Failed to update profile");
            }
            return await retryResponse.json();
          } catch (refreshError) {
            throw new Error("Session expired. Please login again.");
          }
        }
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to update profile" }));
        throw new Error(error.message || "Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  // Change password (when logged in)
  // POST /api/auth/password/change
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/auth/password/change`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword, // Plaintext password
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          try {
            await this.refreshToken();
            // Retry with new token
            const newHeaders = await this.getAuthHeaders();
            const retryResponse = await fetch(
              `${API_BASE_URL}/api/auth/password/change`,
              {
                method: "POST",
                headers: newHeaders,
                body: JSON.stringify({
                  currentPassword: passwordData.currentPassword,
                  newPassword: passwordData.newPassword,
                }),
              }
            );
            if (!retryResponse.ok) {
              const error = await retryResponse
                .json()
                .catch(() => ({ message: "Failed to change password" }));
              throw new Error(error.message || "Failed to change password");
            }
            return;
          } catch (refreshError) {
            throw new Error("Session expired. Please login again.");
          }
        }
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to change password" }));
        throw new Error(error.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },

  // Clear all stored tokens
  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_ID_KEY);
    } catch (error) {
      console.error("Clear tokens error:", error);
    }
  },

  // Logout - call API and remove tokens
  // POST /api/auth/logout
  async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        try {
          const headers = await this.getAuthHeaders();
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: "POST",
            headers,
          });
        } catch (error) {
          // Continue with local logout even if API call fails
          console.error("Logout API error:", error);
        }
      }

      // Clear all tokens locally
      await this.clearTokens();
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear tokens even if API call fails
      await this.clearTokens();
      throw error;
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },
};
