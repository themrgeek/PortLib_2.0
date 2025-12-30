import { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Tab,
  Tabs,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import { Email, Lock, Person, Phone, Badge, Work } from "@mui/icons-material";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Logo from "../../components/common/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import authService from "../../services/auth.service";
import { MESSAGES } from "../../utils/constants";

function SignupPage() {
  const [tab, setTab] = useState(0); // 0: Student, 1: Librarian, 2: Admin
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    id_proof: Yup.mixed().required("ID card upload is required"),
  });

  const librarianSchema = Yup.object().shape({
    ...commonSchema,
    employee_id: Yup.string().required("Employee ID is required"),
    id_proof: Yup.mixed().required("Employment proof upload is required"),
  });

  const adminSchema = Yup.object().shape({
    ...commonSchema,
    admin_key: Yup.string().required("Admin key is required"),
  });

  const studentFormik = useFormik({
    initialValues: {
      student_id: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      id_proof: null,
      role: "student",
    },
    validationSchema: studentSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          formData.append(key, values[key]);
        });
        const response = await authService.userSignup(formData);
        toast.success(MESSAGES.OTP_SENT);
        navigate("/verify-otp", {
          state: {
            userId: response.userId,
            userType: "student",
            isSignup: true,
          },
        });
      } catch (err) {
        setError(err.response?.data?.error || "Signup failed");
        toast.error(err.response?.data?.error || "Signup failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const librarianFormik = useFormik({
    initialValues: {
      employee_id: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      id_proof: null,
      role: "librarian",
    },
    validationSchema: librarianSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          formData.append(key, values[key]);
        });
        const response = await authService.userSignup(formData);
        toast.success(MESSAGES.OTP_SENT);
        navigate("/verify-otp", {
          state: {
            userId: response.userId,
            userType: "librarian",
            isSignup: true,
          },
        });
      } catch (err) {
        setError(err.response?.data?.error || "Signup failed");
        toast.error(err.response?.data?.error || "Signup failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const adminFormik = useFormik({
    initialValues: {
      admin_key: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: adminSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      try {
        const response = await authService.adminSignup(values);
        toast.success(MESSAGES.OTP_SENT);
        navigate("/verify-otp", {
          state: {
            adminId: response.adminId,
            userType: "admin",
            isSignup: true,
          },
        });
      } catch (err) {
        setError(err.response?.data?.error || "Signup failed");
        toast.error(err.response?.data?.error || "Signup failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const getActiveFormik = () => {
    if (tab === 0) return studentFormik;
    if (tab === 1) return librarianFormik;
    return adminFormik;
  };

  const formik = getActiveFormik();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ my: "auto" }}>
        <Grid container spacing={4} alignItems="center">
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
              textAlign: "center",
            }}
          >
            <Logo size="large" />
            <Typography variant="h3" fontWeight="bold" mt={3} mb={2}>
              Join PortLib
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Start your smart library experience
            </Typography>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: "16px",
                p: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}
            >
              <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                centered
                sx={{ mb: 3 }}
              >
                <Tab label="Student" />
                <Tab label="Librarian" />
                <Tab label="Admin" />
              </Tabs>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={formik.handleSubmit}>
                <Box display="flex" flexDirection="column" gap={2}>
                  {tab === 0 && (
                    <Input
                      label="Student ID"
                      name="student_id"
                      value={formik.values.student_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.student_id && formik.errors.student_id
                      }
                      icon={Badge}
                    />
                  )}
                  {tab === 1 && (
                    <Input
                      label="Employee ID"
                      name="employee_id"
                      value={formik.values.employee_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.employee_id && formik.errors.employee_id
                      }
                      icon={Work}
                    />
                  )}
                  {tab === 2 && (
                    <Input
                      label="Admin Key"
                      name="admin_key"
                      value={formik.values.admin_key}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.admin_key && formik.errors.admin_key
                      }
                      icon={Lock}
                    />
                  )}

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && formik.errors.email}
                    icon={Email}
                  />

                  <Input
                    label="Phone"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && formik.errors.phone}
                    icon={Phone}
                  />

                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && formik.errors.password}
                    icon={Lock}
                    showPasswordToggle
                  />

                  <Input
                    label="Confirm Password"
                    name="confirm_password"
                    type="password"
                    value={formik.values.confirm_password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.confirm_password &&
                      formik.errors.confirm_password
                    }
                    icon={Lock}
                  />

                  {(tab === 0 || tab === 1) && (
                    <Box>
                      <Typography variant="body2" mb={1}>
                        {tab === 0
                          ? "Upload Student ID (JPEG)"
                          : "Upload Employment Proof (JPEG)"}
                      </Typography>
                      <input
                        type="file"
                        accept="image/jpeg"
                        onChange={(event) => {
                          formik.setFieldValue(
                            "id_proof",
                            event.currentTarget.files[0]
                          );
                        }}
                      />
                      {formik.touched.id_proof && formik.errors.id_proof && (
                        <Typography variant="caption" color="error">
                          {formik.errors.id_proof}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Button
                    type="submit"
                    loading={loading}
                    fullWidth
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    Sign Up
                  </Button>

                  <Typography variant="body2" textAlign="center" mt={2}>
                    Already have an account?{" "}
                    <MuiLink
                      component="button"
                      type="button"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </MuiLink>
                  </Typography>
                </Box>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default SignupPage;
