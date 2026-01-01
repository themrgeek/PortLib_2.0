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
import { COLORS, MESSAGES } from "../../utils/constants";
import authService from "../../services/auth.service";
import useAuthStore from "../../store/authStore";

function VerifyOTPScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);

  const { userId, adminId, userType, isSignup } = route.params || {};

  const validationSchema = Yup.object().shape({
    emailOTP: Yup.string()
      .matches(/^[0-9]{6}$/, "OTP must be 6 digits")
      .required("Email OTP is required"),
    ...(userType !== "admin" && {
      smsOTP: Yup.string()
        .matches(/^[0-9]{6}$/, "OTP must be 6 digits")
        .required("SMS OTP is required"),
    }),
  });

  const formik = useFormik({
    initialValues: {
      emailOTP: "",
      smsOTP: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      try {
        let response;
        if (userType === "admin") {
          if (isSignup) {
            response = await authService.adminVerifyOTP({
              adminId,
              emailOTP: values.emailOTP,
              smsOTP: values.smsOTP,
            });
          } else {
            response = await authService.adminVerifyLoginOTP({
              adminId,
              emailOTP: values.emailOTP,
            });
          }
        } else {
          if (isSignup) {
            response = await authService.userVerifyOTP({
              userId,
              ...values,
            });
          } else {
            response = await authService.userVerifyLoginOTP({
              userId,
              ...values,
            });
          }
        }

        if (isSignup) {
          alert("Verification successful! You can now login.");
          navigation.navigate("Login");
        } else {
          await login(response.user || response.admin, response.token, userType);
          navigation.replace("Dashboard");
        }
      } catch (err) {
        setError(err.response?.data?.error || MESSAGES.OTP_ERROR);
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
                  name="shield-check"
                  size={60}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.title}>Verify OTP</Text>
              <Text style={styles.subtitle}>
                Enter the OTP codes sent to your email
                {userType !== "admin" && " and phone"}
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
                label="Email OTP"
                placeholder="Enter 6-digit email OTP"
                value={formik.values.emailOTP}
                onChangeText={formik.handleChange("emailOTP")}
                onBlur={formik.handleBlur("emailOTP")}
                error={formik.touched.emailOTP && formik.errors.emailOTP}
                keyboardType="numeric"
                maxLength={6}
                style={styles.input}
                left={<TextInput.Icon icon="email-check" />}
              />
              {formik.touched.emailOTP && formik.errors.emailOTP && (
                <Text style={styles.fieldError}>{formik.errors.emailOTP}</Text>
              )}

              {userType !== "admin" && (
                <>
                  <TextInput
                    mode="outlined"
                    label="SMS OTP"
                    placeholder="Enter 6-digit SMS OTP"
                    value={formik.values.smsOTP}
                    onChangeText={formik.handleChange("smsOTP")}
                    onBlur={formik.handleBlur("smsOTP")}
                    error={formik.touched.smsOTP && formik.errors.smsOTP}
                    keyboardType="numeric"
                    maxLength={6}
                    style={styles.input}
                    left={<TextInput.Icon icon="cellphone-check" />}
                  />
                  {formik.touched.smsOTP && formik.errors.smsOTP && (
                    <Text style={styles.fieldError}>{formik.errors.smsOTP}</Text>
                  )}
                </>
              )}
            </View>

            {/* Verify Button */}
            <Button
              mode="contained"
              onPress={formik.handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.verifyButton}
              buttonColor={COLORS.primary}
              contentStyle={styles.verifyButtonContent}
            >
              {isSignup ? "Verify Account" : "Verify & Login"}
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
  verifyButton: {
    borderRadius: 8,
    marginTop: 16,
  },
  verifyButtonContent: {
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

export default VerifyOTPScreen;
