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
import * as ImagePicker from "expo-image-picker";
import { useFormik } from "formik";
import * as Yup from "yup";
import { COLORS, MESSAGES } from "../../utils/constants";
import authService from "../../services/auth.service";

function SignupScreen({ navigation }) {
  const [tab, setTab] = useState("student"); // "student", "librarian", "admin"
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [idProof, setIdProof] = useState(null);

  const commonSchema = {
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirm_password: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  };

  const studentSchema = Yup.object().shape({
    ...commonSchema,
    student_id: Yup.string().required("Student ID is required"),
  });

  const librarianSchema = Yup.object().shape({
    ...commonSchema,
    employee_id: Yup.string().required("Employee ID is required"),
  });

  const adminSchema = Yup.object().shape({
    ...commonSchema,
    admin_key: Yup.string().required("Admin key is required"),
  });

  const getSchema = () => {
    if (tab === "student") return studentSchema;
    if (tab === "librarian") return librarianSchema;
    return adminSchema;
  };

  const formik = useFormik({
    initialValues: {
      student_id: "",
      employee_id: "",
      admin_key: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: getSchema(),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (tab !== "admin" && !idProof) {
        setError("Please upload ID proof");
        return;
      }

      setLoading(true);
      setError("");
      try {
        let response;
        if (tab === "admin") {
          response = await authService.adminSignup({
            admin_key: values.admin_key,
            email: values.email,
            phone: values.phone,
            password: values.password,
            confirm_password: values.confirm_password,
          });
          navigation.navigate("VerifyOTP", {
            adminId: response.adminId,
            userType: "admin",
            isSignup: true,
          });
        } else {
          const formData = new FormData();
          formData.append("role", tab);
          formData.append("email", values.email);
          formData.append("phone", values.phone);
          formData.append("password", values.password);
          formData.append("confirm_password", values.confirm_password);

          if (tab === "student") {
            formData.append("student_id", values.student_id);
          } else {
            formData.append("employee_id", values.employee_id);
          }

          formData.append("id_proof", {
            uri: idProof.uri,
            type: "image/jpeg",
            name: "id_proof.jpg",
          });

          response = await authService.userSignup(formData);
          navigation.navigate("VerifyOTP", {
            userId: response.userId,
            userType: tab,
            isSignup: true,
          });
        }
      } catch (err) {
        setError(err.response?.data?.error || "Signup failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIdProof(result.assets[0]);
    }
  };

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
                size={40}
                color="#fff"
              />
            </View>
            <Text style={styles.title}>Join PortLib</Text>
            <Text style={styles.subtitle}>
              Start your smart library experience
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <SegmentedButtons
              value={tab}
              onValueChange={(val) => {
                setTab(val);
                setIdProof(null);
                setError("");
              }}
              buttons={[
                { value: "student", label: "Student" },
                { value: "librarian", label: "Librarian" },
                { value: "admin", label: "Admin" },
              ]}
              style={styles.tabs}
            />

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              {/* Dynamic ID Field */}
              {tab === "student" && (
                <>
                  <TextInput
                    mode="outlined"
                    label="Student ID"
                    placeholder="Enter your student ID"
                    value={formik.values.student_id}
                    onChangeText={formik.handleChange("student_id")}
                    onBlur={formik.handleBlur("student_id")}
                    error={
                      formik.touched.student_id && formik.errors.student_id
                    }
                    style={styles.input}
                    left={<TextInput.Icon icon="badge-account" />}
                  />
                  {formik.touched.student_id && formik.errors.student_id && (
                    <Text style={styles.fieldError}>
                      {formik.errors.student_id}
                    </Text>
                  )}
                </>
              )}

              {tab === "librarian" && (
                <>
                  <TextInput
                    mode="outlined"
                    label="Employee ID"
                    placeholder="Enter your employee ID"
                    value={formik.values.employee_id}
                    onChangeText={formik.handleChange("employee_id")}
                    onBlur={formik.handleBlur("employee_id")}
                    error={
                      formik.touched.employee_id && formik.errors.employee_id
                    }
                    style={styles.input}
                    left={<TextInput.Icon icon="briefcase" />}
                  />
                  {formik.touched.employee_id && formik.errors.employee_id && (
                    <Text style={styles.fieldError}>
                      {formik.errors.employee_id}
                    </Text>
                  )}
                </>
              )}

              {tab === "admin" && (
                <>
                  <TextInput
                    mode="outlined"
                    label="Admin Key"
                    placeholder="Enter admin key"
                    value={formik.values.admin_key}
                    onChangeText={formik.handleChange("admin_key")}
                    onBlur={formik.handleBlur("admin_key")}
                    error={formik.touched.admin_key && formik.errors.admin_key}
                    style={styles.input}
                    left={<TextInput.Icon icon="key" />}
                  />
                  {formik.touched.admin_key && formik.errors.admin_key && (
                    <Text style={styles.fieldError}>
                      {formik.errors.admin_key}
                    </Text>
                  )}
                </>
              )}

              {/* Common Fields */}
              <TextInput
                mode="outlined"
                label="Email"
                placeholder="Enter your email"
                value={formik.values.email}
                onChangeText={formik.handleChange("email")}
                onBlur={formik.handleBlur("email")}
                error={formik.touched.email && formik.errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />
              {formik.touched.email && formik.errors.email && (
                <Text style={styles.fieldError}>{formik.errors.email}</Text>
              )}

              <TextInput
                mode="outlined"
                label="Phone"
                placeholder="Enter your phone number"
                value={formik.values.phone}
                onChangeText={formik.handleChange("phone")}
                onBlur={formik.handleBlur("phone")}
                error={formik.touched.phone && formik.errors.phone}
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
              />
              {formik.touched.phone && formik.errors.phone && (
                <Text style={styles.fieldError}>{formik.errors.phone}</Text>
              )}

              <TextInput
                mode="outlined"
                label="Password"
                placeholder="Create a password"
                value={formik.values.password}
                onChangeText={formik.handleChange("password")}
                onBlur={formik.handleBlur("password")}
                error={formik.touched.password && formik.errors.password}
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
              {formik.touched.password && formik.errors.password && (
                <Text style={styles.fieldError}>{formik.errors.password}</Text>
              )}

              <TextInput
                mode="outlined"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formik.values.confirm_password}
                onChangeText={formik.handleChange("confirm_password")}
                onBlur={formik.handleBlur("confirm_password")}
                error={
                  formik.touched.confirm_password &&
                  formik.errors.confirm_password
                }
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
              />
              {formik.touched.confirm_password &&
                formik.errors.confirm_password && (
                  <Text style={styles.fieldError}>
                    {formik.errors.confirm_password}
                  </Text>
                )}

              {/* ID Proof Upload (not for admin) */}
              {tab !== "admin" && (
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <MaterialCommunityIcons
                    name={idProof ? "check-circle" : "camera"}
                    size={24}
                    color={idProof ? COLORS.success : COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.uploadText,
                      idProof && { color: COLORS.success },
                    ]}
                  >
                    {idProof
                      ? "ID Proof Selected"
                      : tab === "student"
                      ? "Upload Student ID (JPEG)"
                      : "Upload Employment Proof (JPEG)"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Signup Button */}
            <Button
              mode="contained"
              onPress={formik.handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.signupButton}
              buttonColor={COLORS.primary}
              contentStyle={styles.signupButtonContent}
            >
              Sign Up
            </Button>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
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
    paddingTop: 50,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  tabs: {
    marginBottom: 16,
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
    gap: 4,
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
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    marginTop: 12,
  },
  uploadText: {
    marginLeft: 10,
    color: COLORS.primary,
    fontWeight: "600",
  },
  signupButton: {
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 16,
  },
  signupButtonContent: {
    paddingVertical: 8,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SignupScreen;
