import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Button, SegmentedButtons } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFormik } from "formik";
import * as Yup from "yup";
import { COLORS, MESSAGES } from "../../utils/constants";
import authService from "../../services/auth.service";

function LoginScreen({ navigation }) {
  const [tab, setTab] = useState("user"); // "user" or "admin"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const userSchema = Yup.object().shape({
    identifier: Yup.string().required("Student ID or Employee ID is required"),
    password: Yup.string().required("Password is required"),
  });

  const adminSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    admin_access_key: Yup.string().required("Admin access key is required"),
  });

  const userFormik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
      role: "student",
    },
    validationSchema: userSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.userLogin(values);
        navigation.navigate("VerifyOTP", {
          userId: response.userId,
          userType: "user",
        });
      } catch (err) {
        setError(err.response?.data?.error || MESSAGES.LOGIN_ERROR);
      } finally {
        setLoading(false);
      }
    },
  });

  const adminFormik = useFormik({
    initialValues: {
      email: "",
      admin_access_key: "",
    },
    validationSchema: adminSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.adminLogin(values);
        navigation.navigate("VerifyOTP", {
          adminId: response.adminId,
          userType: "admin",
        });
      } catch (err) {
        setError(err.response?.data?.error || MESSAGES.LOGIN_ERROR);
      } finally {
        setLoading(false);
      }
    },
  });

  const formik = tab === "user" ? userFormik : adminFormik;

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
          {/* Branding Section */}
          <View style={styles.brandingSection}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={48}
                color="#fff"
              />
            </View>
            <Text style={styles.title}>Welcome to PortLib</Text>
            <Text style={styles.subtitle}>Smart Library Management System</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <SegmentedButtons
              value={tab}
              onValueChange={setTab}
              buttons={[
                { value: "user", label: "User Login" },
                { value: "admin", label: "Admin/Librarian" },
              ]}
              style={styles.tabs}
            />

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {tab === "user" ? (
              // User Login Form
              <View style={styles.form}>
                <TextInput
                  mode="outlined"
                  label="Student ID / Employee ID"
                  placeholder="Enter your ID"
                  value={userFormik.values.identifier}
                  onChangeText={userFormik.handleChange("identifier")}
                  onBlur={userFormik.handleBlur("identifier")}
                  error={
                    userFormik.touched.identifier &&
                    userFormik.errors.identifier
                  }
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />
                {userFormik.touched.identifier &&
                  userFormik.errors.identifier && (
                    <Text style={styles.fieldError}>
                      {userFormik.errors.identifier}
                    </Text>
                  )}

                <TextInput
                  mode="outlined"
                  label="Password"
                  placeholder="Enter your password"
                  value={userFormik.values.password}
                  onChangeText={userFormik.handleChange("password")}
                  onBlur={userFormik.handleBlur("password")}
                  error={
                    userFormik.touched.password && userFormik.errors.password
                  }
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
                {userFormik.touched.password && userFormik.errors.password && (
                  <Text style={styles.fieldError}>
                    {userFormik.errors.password}
                  </Text>
                )}

                {/* Role Toggle */}
                <View style={styles.roleToggle}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      userFormik.values.role === "student" &&
                        styles.roleButtonActive,
                    ]}
                    onPress={() => userFormik.setFieldValue("role", "student")}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        userFormik.values.role === "student" &&
                          styles.roleButtonTextActive,
                      ]}
                    >
                      Student
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      userFormik.values.role === "librarian" &&
                        styles.roleButtonActive,
                    ]}
                    onPress={() =>
                      userFormik.setFieldValue("role", "librarian")
                    }
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        userFormik.values.role === "librarian" &&
                          styles.roleButtonTextActive,
                      ]}
                    >
                      Librarian
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Admin Login Form
              <View style={styles.form}>
                <TextInput
                  mode="outlined"
                  label="Email"
                  placeholder="Enter your email"
                  value={adminFormik.values.email}
                  onChangeText={adminFormik.handleChange("email")}
                  onBlur={adminFormik.handleBlur("email")}
                  error={adminFormik.touched.email && adminFormik.errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                {adminFormik.touched.email && adminFormik.errors.email && (
                  <Text style={styles.fieldError}>
                    {adminFormik.errors.email}
                  </Text>
                )}

                <TextInput
                  mode="outlined"
                  label="Admin Access Key"
                  placeholder="Enter your access key"
                  value={adminFormik.values.admin_access_key}
                  onChangeText={adminFormik.handleChange("admin_access_key")}
                  onBlur={adminFormik.handleBlur("admin_access_key")}
                  error={
                    adminFormik.touched.admin_access_key &&
                    adminFormik.errors.admin_access_key
                  }
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  left={<TextInput.Icon icon="key" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                {adminFormik.touched.admin_access_key &&
                  adminFormik.errors.admin_access_key && (
                    <Text style={styles.fieldError}>
                      {adminFormik.errors.admin_access_key}
                    </Text>
                  )}
              </View>
            )}

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={formik.handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              buttonColor={COLORS.primary}
              contentStyle={styles.loginButtonContent}
            >
              Login
            </Button>

            {/* Signup Link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  brandingSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
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
  tabs: {
    marginBottom: 20,
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
  roleToggle: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 8,
    marginBottom: 16,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#666",
    fontSize: 14,
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default LoginScreen;

