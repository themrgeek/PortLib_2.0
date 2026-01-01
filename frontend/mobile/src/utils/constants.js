export const API_BASE_URL = "http://localhost:8000";

export const API_ENDPOINTS = {
  // User Auth
  USER_SIGNUP: "/auth/user/signup",
  USER_VERIFY_OTP: "/auth/user/verify-otp",
  USER_LOGIN: "/auth/user/login",
  USER_VERIFY_LOGIN_OTP: "/auth/user/verify-login-otp",
  USER_FORGOT_PASSWORD: "/auth/user/forgot-password",
  USER_RESET_PASSWORD: "/auth/user/reset-password",

  // Admin Auth
  ADMIN_SIGNUP: "/auth/admin/signup",
  ADMIN_VERIFY_OTP: "/auth/admin/verify-otp",
  ADMIN_LOGIN: "/auth/admin/login",
  ADMIN_VERIFY_LOGIN_OTP: "/auth/admin/verify-login-otp",
  ADMIN_APPROVE: "/auth/admin/approve",
  ADMIN_FORGOT_PASSWORD: "/auth/admin/forgot-password",
  ADMIN_RESET_PASSWORD: "/auth/admin/reset-password",

  // Books
  BOOKS: "/books",
  BOOK_BY_ID: "/books/:id",

  // Admin - User Management
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_BY_ID: "/admin/users/:id",
  ADMIN_SUSPEND_USER: "/admin/users/:id/suspend",

  // Admin - Warnings
  ADMIN_WARNINGS: "/admin/warnings",
  ADMIN_USER_WARNINGS: "/admin/warnings/user/:userId",
};

export const USER_ROLES = {
  STUDENT: "student",
  FACULTY: "faculty",
  LIBRARIAN: "librarian",
  ADMIN: "admin",
};

export const STORAGE_KEYS = {
  TOKEN: "portlib_token",
  USER: "portlib_user",
  REMEMBER_ME: "portlib_remember_me",
  SESSION_EXPIRY: "portlib_session_expiry",
};

export const WARNING_TYPES = {
  OVERDUE: "overdue",
  NUISANCE: "nuisance",
  HARASSMENT: "harassment",
  HATE_SPEECH: "hate_speech",
  OTHER: "other",
};

export const BOOK_CONDITIONS = {
  NEW: "new",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
};

export const COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  success: "#4caf50",
  error: "#f44336",
  warning: "#ff9800",
  info: "#2196f3",
  gradient1: "#667eea",
  gradient2: "#764ba2",
  white: "#ffffff",
  black: "#000000",
  lightGray: "#f5f5f5",
  darkGray: "#757575",
  cardShadow: "rgba(0,0,0,0.1)",
};

export const MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  LOGIN_ERROR: "Invalid credentials. Please try again.",
  OTP_SENT: "OTP has been sent to your email and phone.",
  OTP_VERIFIED: "OTP verified successfully!",
  OTP_ERROR: "Invalid or expired OTP.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  BOOK_ADDED: "Book added successfully!",
  BOOK_UPDATED: "Book updated successfully!",
  BOOK_DELETED: "Book deleted successfully!",
  USER_REMOVED: "User removed successfully!",
  WARNING_SENT: "Warning sent successfully!",
  USER_SUSPENDED: "User has been suspended.",
};
