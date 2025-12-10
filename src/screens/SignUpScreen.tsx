import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InputField } from "../components/InputField";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { ProgressDots } from "../components/ProgressDots";
import { colors, spacing, typography } from "../theme/colors";
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validateStudentId,
  validatePassword,
  validatePasswordMatch,
  validateOTP,
} from "../utils/validation";
import { authService } from "../services/authService";

interface SignUpScreenProps {
  navigation: any;
}

type PasswordStrength = "weak" | "medium" | "strong" | null;

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength>(null);
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  // Validation errors
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [studentIdError, setStudentIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [agreeToTermsError, setAgreeToTermsError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return "weak";
    if (pwd.length < 10) return "medium";
    // Check for complexity
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const complexity = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
      Boolean
    ).length;

    if (complexity >= 3 && pwd.length >= 10) return "strong";
    if (complexity >= 2) return "medium";
    return "weak";
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    if (fullNameError) {
      const validation = validateFullName(value);
      setFullNameError(validation.isValid ? "" : validation.error || "");
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      const validation = validateEmail(value);
      setEmailError(validation.isValid ? "" : validation.error || "");
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    if (phoneNumberError) {
      const validation = validatePhone(value);
      setPhoneNumberError(validation.isValid ? "" : validation.error || "");
    }
  };

  const handleStudentIdChange = (value: string) => {
    setStudentId(value);
    if (studentIdError) {
      const validation = validateStudentId(value);
      setStudentIdError(validation.isValid ? "" : validation.error || "");
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(calculatePasswordStrength(text));

    // Clear password match error if passwords match
    if (confirmPassword && text === confirmPassword) {
      setPasswordMatchError(false);
      setConfirmPasswordError("");
    }

    // Validate password
    if (passwordError) {
      const validation = validatePassword(text);
      setPasswordError(validation.isValid ? "" : validation.error || "");
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);

    // Validate password match
    if (password) {
      const validation = validatePasswordMatch(password, text);
      if (validation.isValid) {
        setPasswordMatchError(false);
        setConfirmPasswordError("");
      } else {
        setPasswordMatchError(true);
        setConfirmPasswordError(validation.error || "");
      }
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      // Reset all errors
      setFullNameError("");
      setEmailError("");
      setPhoneNumberError("");
      setStudentIdError("");
      setPasswordError("");
      setConfirmPasswordError("");
      setAgreeToTermsError("");

      // Validate all fields
      const fullNameValidation = validateFullName(fullName);
      if (!fullNameValidation.isValid) {
        setFullNameError(fullNameValidation.error || "");
      }

      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || "");
      }

      const phoneValidation = validatePhone(phoneNumber);
      if (!phoneValidation.isValid) {
        setPhoneNumberError(phoneValidation.error || "");
      }

      const studentIdValidation = validateStudentId(studentId);
      if (!studentIdValidation.isValid) {
        setStudentIdError(studentIdValidation.error || "");
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error || "");
      }

      const passwordMatchValidation = validatePasswordMatch(
        password,
        confirmPassword
      );
      if (!passwordMatchValidation.isValid) {
        setPasswordMatchError(true);
        setConfirmPasswordError(passwordMatchValidation.error || "");
      }

      if (!agreeToTerms) {
        setAgreeToTermsError("You must agree to the Terms & Conditions");
      }

      // Check if there are any errors
      if (
        !fullNameValidation.isValid ||
        !emailValidation.isValid ||
        !phoneValidation.isValid ||
        !studentIdValidation.isValid ||
        !passwordValidation.isValid ||
        !passwordMatchValidation.isValid ||
        !agreeToTerms
      ) {
        return;
      }

      setIsLoading(true);

      try {
        // Sign up with plaintext password
        await authService.signUp({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim(),
          studentId: studentId.trim(),
          password: password, // Plaintext password
          confirmPassword: confirmPassword, // Send confirmation to backend
        });

        // Move to OTP verification step
        setStep(2);
      } catch (error: any) {
        // Don't navigate away on error - stay on signup screen
        const errorMessage =
          error.message || "An error occurred during sign up";

        // Check if it's a network error
        if (
          errorMessage.includes("Network request failed") ||
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("NetworkError")
        ) {
          Alert.alert(
            "Connection Error",
            "Unable to connect to the server. Please check:\n\n" +
              "1. Your backend server is running\n" +
              "2. You're using the correct API URL\n" +
              "3. Your device/emulator can reach the server\n\n" +
              "For physical devices, use your computer's IP address instead of localhost."
          );
        } else {
          Alert.alert("Sign Up Failed", errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    setOtpError("");

    // Validate OTP
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      setOtpError(otpValidation.error || "");
      return;
    }

    setIsLoading(true);

    try {
      const otpString = otp.join("");

      // Verify signup OTP
      // API endpoint: POST /api/auth/verify/signup-otp
      const response = await authService.verifyOTP(otpString);

      const token =
        response.accessToken || response.token || response.tokens?.accessToken;
      if (!token) {
        Alert.alert(
          "Verification Failed",
          "No token returned after OTP verification. Please try again."
        );
        return;
      }

      // Token is automatically stored in SecureStore by authService
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Navigate to main app or home screen
            // navigation.navigate("Home");
            console.log("Signed up and verified with token:", token);
          },
        },
      ]);
    } catch (error: any) {
      // Don't navigate away on error - stay on OTP verification step
      const errorMessage = error.message || "Invalid OTP. Please try again.";

      // Check if it's a network error
      if (
        errorMessage.includes("Network request failed") ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError")
      ) {
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check:\n\n" +
            "1. Your backend server is running\n" +
            "2. You're using the correct API URL\n" +
            "3. Your device/emulator can reach the server\n\n" +
            "For physical devices, use your computer's IP address instead of localhost."
        );
      } else {
        Alert.alert("Verification Failed", errorMessage);
      }

      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      if (otpRefs.current[0]) {
        otpRefs.current[0]?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue.length > 1) {
      // Handle paste
      const pastedOtp = numericValue.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);

      // Focus the last filled input or next empty
      const nextEmptyIndex = newOtp.findIndex(
        (val, i) => i >= index && val === ""
      );
      if (nextEmptyIndex !== -1 && otpRefs.current[nextEmptyIndex]) {
        otpRefs.current[nextEmptyIndex]?.focus();
      } else if (
        index + pastedOtp.length < 6 &&
        otpRefs.current[index + pastedOtp.length]
      ) {
        otpRefs.current[index + pastedOtp.length]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto-focus next input
    if (numericValue && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (
      key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      otpRefs.current[index - 1]
    ) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      // Resend verification OTP
      // API endpoint: POST /api/auth/resend-verification
      await authService.resendVerification();
      Alert.alert("Success", "Verification code has been resent!");
      // Clear OTP fields
      setOtp(["", "", "", "", "", ""]);
      if (otpRefs.current[0]) {
        otpRefs.current[0]?.focus();
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to resend verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.iconPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ProgressDots totalSteps={2} currentStep={1} />

      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.descriptionText}>
        Enter your details below to get started.
      </Text>

      <InputField
        label="Full Name"
        icon="person"
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={handleFullNameChange}
        autoCapitalize="words"
        error={fullNameError}
      />

      <InputField
        label="Email"
        icon="mail"
        placeholder="Enter your email address"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />

      <InputField
        label="Phone Number"
        icon="call"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={handlePhoneNumberChange}
        keyboardType="phone-pad"
        error={phoneNumberError}
      />

      <InputField
        label="Student ID"
        icon="briefcase"
        placeholder="Enter your student ID"
        value={studentId}
        onChangeText={handleStudentIdChange}
        error={studentIdError}
      />

      <InputField
        label="Password"
        icon="lock-closed"
        placeholder="Enter your password"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        showPasswordToggle
        passwordStrength={passwordStrength}
        error={passwordError}
      />

      <InputField
        label="Confirm Password"
        icon="lock-closed"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        secureTextEntry
        showPasswordToggle
        error={
          confirmPasswordError ||
          (passwordMatchError ? "Passwords do not match." : undefined)
        }
      />

      {agreeToTermsError && (
        <Text style={styles.errorText}>{agreeToTermsError}</Text>
      )}

      <Checkbox
        checked={agreeToTerms}
        onToggle={() => {
          setAgreeToTerms(!agreeToTerms);
          setAgreeToTermsError("");
        }}
        label="I agree to the "
        linkText="Terms & Conditions."
        onLinkPress={() => console.log("Terms pressed")}
      />

      <Button
        title="Continue"
        onPress={handleContinue}
        loading={isLoading}
        disabled={isLoading}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={24} color={colors.iconPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ProgressDots totalSteps={2} currentStep={2} />

      <Text style={styles.welcomeText}>Verify Your Phone</Text>
      <Text style={styles.descriptionText}>
        Enter the 6-digit code sent to your phone number
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((value, index) => (
          <View key={index} style={styles.otpInputWrapper}>
            <TextInput
              ref={(ref) => {
                otpRefs.current[index] = ref;
              }}
              style={styles.otpInput}
              value={value}
              onChangeText={(text) => handleOtpChange(index, text)}
              onKeyPress={({ nativeEvent }) =>
                handleOtpKeyPress(index, nativeEvent.key)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          </View>
        ))}
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>Resend code in 01:59</Text>
      </View>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendOTP}
        disabled={isLoading}
      >
        <Text style={styles.resendButtonText}>Resend OTP</Text>
      </TouchableOpacity>

      {otpError && <Text style={styles.errorText}>{otpError}</Text>}

      <Button
        title="Verify"
        onPress={handleVerify}
        loading={isLoading}
        disabled={isLoading}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? renderStep1() : renderStep2()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  welcomeText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xxxl,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.xxxl,
  },
  otpInputWrapper: {
    flex: 1,
    marginHorizontal: spacing.xs / 2,
  },
  otpInput: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: colors.borderInactive,
    borderRadius: 8,
    textAlign: "center",
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  resendButton: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resendButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.textError,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
});
export default SignUpScreen;
