import { useState } from "react";
import { Box, Container, Typography, Alert } from "@mui/material";
import { useFormik } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "../../components/common/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import authService from "../../services/auth.service";
import useAuthStore from "../../store/authStore";
import { otpSchema } from "../../utils/validators";
import { MESSAGES } from "../../utils/constants";

function VerifyOTPPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const { userId, adminId, userType, isSignup } = location.state || {};

  const formik = useFormik({
    initialValues: {
      emailOTP: "",
      smsOTP: "",
    },
    validationSchema: otpSchema,
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
          toast.success(MESSAGES.OTP_VERIFIED);
          navigate("/login");
        } else {
          login(response.user || response.admin, response.token, userType);
          toast.success(MESSAGES.LOGIN_SUCCESS);
          navigate("/dashboard");
        }
      } catch (err) {
        setError(err.response?.data?.error || MESSAGES.OTP_ERROR);
        toast.error(err.response?.data?.error || MESSAGES.OTP_ERROR);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "16px",
            p: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Logo size="medium" />
            <Typography variant="h5" fontWeight="bold" mt={2}>
              Verify OTP
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              mt={1}
            >
              Enter the OTP codes sent to your email
              {userType !== "admin" && " and phone"}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Input
                label="Email OTP"
                name="emailOTP"
                value={formik.values.emailOTP}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emailOTP && formik.errors.emailOTP}
                placeholder="Enter 6-digit email OTP"
              />

              {userType !== "admin" && (
                <Input
                  label="SMS OTP"
                  name="smsOTP"
                  value={formik.values.smsOTP}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.smsOTP && formik.errors.smsOTP}
                  placeholder="Enter 6-digit SMS OTP"
                />
              )}

              <Button type="submit" loading={loading} fullWidth size="large">
                {isSignup ? "Verify Account" : "Verify & Login"}
              </Button>

              <Button
                variant="text"
                onClick={() => navigate("/login")}
                fullWidth
              >
                Back to Login
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </Box>
  );
}

export default VerifyOTPPage;
