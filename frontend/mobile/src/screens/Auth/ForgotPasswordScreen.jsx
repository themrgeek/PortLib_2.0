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
import { COLORS } from "../../utils/constants";
import authService from "../../services/auth.service";

function ForgotPasswordScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("student");

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.userForgotPassword({
          email: values.email,
          role,
        });
        alert("Password reset OTP sent to your email");
        navigation.navigate("ResetPassword", {
          userId: response.userId,
          email: values.email,
          role,
        });
      } catch (err) {
        setError(err.response?.data?.error || "Failed to send OTP");
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
                  name="lock-reset"
                  size={60}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your email to receive a password reset OTP
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

              {/* Role Selection */}
              <Text style={styles.roleLabel}>Select your role:</Text>
              <SegmentedButtons
                value={role}
                onValueChange={setRole}
                buttons={[
                  { value: "student", label: "Student" },
                  { value: "librarian", label: "Librarian" },
                ]}
                style={styles.roleSelector}
              />
            </View>

            {/* Send OTP Button */}
            <Button
              mode="contained"
              onPress={formik.handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.sendButton}
              buttonColor={COLORS.primary}
              contentStyle={styles.sendButtonContent}
            >
              Send Reset OTP
            </Button>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
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
  roleLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    marginBottom: 8,
  },
  roleSelector: {
    marginBottom: 8,
  },
  sendButton: {
    borderRadius: 8,
    marginTop: 16,
  },
  sendButtonContent: {
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

export default ForgotPasswordScreen;

