export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === "") {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true };
};

// Phone number validation (supports various formats)
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === "") {
    return { isValid: false, error: "Phone number is required" };
  }

  // Remove common phone number formatting characters
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");

  // Check if it's all digits and has reasonable length (10-15 digits)
  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: "Please enter a valid phone number" };
  }

  return { isValid: true };
};

// Email or phone validation (for login)
export const validateEmailOrPhone = (value: string): ValidationResult => {
  if (!value || value.trim() === "") {
    return { isValid: false, error: "Email or phone number is required" };
  }

  // Check if it's an email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(value)) {
    return { isValid: true };
  }

  // Check if it's a phone number
  const cleanPhone = value.replace(/[\s\-\(\)\+]/g, "");
  const phoneRegex = /^\d{10,15}$/;
  if (phoneRegex.test(cleanPhone)) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: "Please enter a valid email or phone number",
  };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: "Password must be less than 128 characters",
    };
  }

  return { isValid: true };
};

// Full name validation
export const validateFullName = (name: string): ValidationResult => {
  if (!name || name.trim() === "") {
    return { isValid: false, error: "Full name is required" };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: "Full name must be at least 2 characters" };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error: "Full name must be less than 100 characters",
    };
  }

  // Check if name contains only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\'\-]+$/;
  if (!nameRegex.test(name.trim())) {
    return {
      isValid: false,
      error:
        "Full name can only contain letters, spaces, hyphens, and apostrophes",
    };
  }

  return { isValid: true };
};

// Student ID validation
export const validateStudentId = (studentId: string): ValidationResult => {
  if (!studentId || studentId.trim() === "") {
    return { isValid: false, error: "Student ID is required" };
  }

  if (studentId.trim().length < 3) {
    return {
      isValid: false,
      error: "Student ID must be at least 3 characters",
    };
  }

  if (studentId.trim().length > 50) {
    return {
      isValid: false,
      error: "Student ID must be less than 50 characters",
    };
  }

  return { isValid: true };
};

// Password match validation
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword || confirmPassword.trim() === "") {
    return { isValid: false, error: "Please confirm your password" };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true };
};

// OTP validation
export const validateOTP = (otp: string[]): ValidationResult => {
  const otpString = otp.join("");

  if (otpString.length !== 6) {
    return { isValid: false, error: "Please enter the complete 6-digit code" };
  }

  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otpString)) {
    return { isValid: false, error: "OTP must contain only numbers" };
  }

  return { isValid: true };
};
