import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFormik } from "formik";
import * as Yup from "yup";
import { COLORS } from "../../utils/constants";
import authService from "../../services/auth.service";

function ResetPasswordScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { userId } = route.params || {};

  const validationSchema = Yup.object().shape({
    otp: Yup.string()
      .matches(/^[0-9]{6}$/, "OTP must be 6 digits")
      .required("OTP is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      try {
        await authService.userResetPassword({
          userId,
          otp: values.otp,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        alert("Password reset successful! Please login with your new password.");
        navigation.navigate("Login");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to reset password");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <LinearGradient
      colors={[COLORS.gradient1, COLORS.gradient2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Card */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="lock-check"
                  size={60}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter the OTP sent to your email and create a new password
              </Text>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                mode="outlined"
                label="OTP"
                placeholder="Enter 6-digit OTP"
                value={formik.values.otp}
                onChangeText={formik.handleChange("otp")}
                onBlur={formik.handleBlur("otp")}
                error={formik.touched.otp && formik.errors.otp}
                keyboardType="numeric"
                maxLength={6}
                style={styles.input}
                left={<TextInput.Icon icon="numeric" />}
              />
              {formik.touched.otp && formik.errors.otp && (
                <Text style={styles.fieldError}>{formik.errors.otp}</Text>
              )}

              <TextInput
                mode="outlined"
                label="New Password"
                placeholder="Enter new password"
                value={formik.values.newPassword}
                onChangeText={formik.handleChange("newPassword")}
                onBlur={formik.handleBlur("newPassword")}
                error={formik.touched.newPassword && formik.errors.newPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {formik.touched.newPassword && formik.errors.newPassword && (
                <Text style={styles.fieldError}>{formik.errors.newPassword}</Text>
              )}

              <TextInput
                mode="outlined"
                label="Confirm Password"
                placeholder="Confirm new password"
                value={formik.values.confirmPassword}
                onChangeText={formik.handleChange("confirmPassword")}
                onBlur={formik.handleBlur("confirmPassword")}
                error={
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                }
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <Text style={styles.fieldError}>
                    {formik.errors.confirmPassword}
                  </Text>
                )}
            </View>

            {/* Reset Button */}
            <Button
              mode="contained"
              onPress={formik.handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.resetButton}
              buttonColor={COLORS.primary}
              contentStyle={styles.resetButtonContent}
            >
              Reset Password
            </Button>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  errorBanner: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
  },
  form: {
    gap: 8,
  },
  input: {
    backgroundColor: "#fff",
    marginBottom: 4,
  },
  fieldError: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  resetButton: {
    borderRadius: 8,
    marginTop: 16,
  },
  resetButtonContent: {
    paddingVertical: 8,
  },
  backButton: {
    alignItems: "center",
    marginTop: 16,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ResetPasswordScreen;

