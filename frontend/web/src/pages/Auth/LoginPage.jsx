import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Tab,
  Tabs,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import { Email, Lock, Person } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/auth.service';
import { MESSAGES } from '../../utils/constants';

function LoginPage() {
  const [tab, setTab] = useState(0); // 0: User, 1: Admin
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userSchema = Yup.object().shape({
    identifier: Yup.string().required('Student ID or Employee ID is required'),
    password: Yup.string().required('Password is required'),
    role: Yup.string().required('Role is required'),
  });

  const adminSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    admin_access_key: Yup.string().required('Admin access key is required'),
  });

  const userFormik = useFormik({
    initialValues: {
      identifier: '',
      password: '',
      role: 'student',
    },
    validationSchema: userSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const response = await authService.userLogin(values);
        toast.success(MESSAGES.OTP_SENT);
        navigate('/verify-login-otp', {
          state: { userId: response.userId, userType: 'user' },
        });
      } catch (err) {
        setError(err.response?.data?.error || MESSAGES.LOGIN_ERROR);
        toast.error(err.response?.data?.error || MESSAGES.LOGIN_ERROR);
      } finally {
        setLoading(false);
      }
    },
  });

  const adminFormik = useFormik({
    initialValues: {
      email: '',
      admin_access_key: '',
    },
    validationSchema: adminSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const response = await authService.adminLogin(values);
        toast.success(MESSAGES.OTP_SENT);
        navigate('/verify-login-otp', {
          state: { adminId: response.adminId, userType: 'admin' },
        });
      } catch (err) {
        setError(err.response?.data?.error || MESSAGES.LOGIN_ERROR);
        toast.error(err.response?.data?.error || MESSAGES.LOGIN_ERROR);
      } finally {
        setLoading(false);
      }
    },
  });

  const activeFormik = tab === 0 ? userFormik : adminFormik;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ my: 'auto' }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Branding */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Logo size="large" />
            <Typography variant="h3" fontWeight="bold" mt={3} mb={2}>
              Welcome to PortLib
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Smart Library Management System
            </Typography>
            <Typography variant="body1" mt={2} sx={{ opacity: 0.8, maxWidth: 400 }}>
              Access your library resources, manage books, and track your reading journey
              all in one place.
            </Typography>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '16px',
                p: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                centered
                sx={{ mb: 3 }}
              >
                <Tab label="User Login" />
                <Tab label="Admin/Librarian" />
              </Tabs>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {tab === 0 ? (
                // User Login Form
                <form onSubmit={userFormik.handleSubmit}>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Input
                      label="Student ID / Employee ID"
                      name="identifier"
                      value={userFormik.values.identifier}
                      onChange={userFormik.handleChange}
                      onBlur={userFormik.handleBlur}
                      error={
                        userFormik.touched.identifier && userFormik.errors.identifier
                      }
                      icon={Person}
                    />

                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      value={userFormik.values.password}
                      onChange={userFormik.handleChange}
                      onBlur={userFormik.handleBlur}
                      error={userFormik.touched.password && userFormik.errors.password}
                      icon={Lock}
                      showPasswordToggle
                    />

                    <Box display="flex" gap={2}>
                      <Button
                        type="button"
                        variant={
                          userFormik.values.role === 'student' ? 'contained' : 'outlined'
                        }
                        fullWidth
                        onClick={() => userFormik.setFieldValue('role', 'student')}
                      >
                        Student
                      </Button>
                      <Button
                        type="button"
                        variant={
                          userFormik.values.role === 'faculty' ? 'contained' : 'outlined'
                        }
                        fullWidth
                        onClick={() => userFormik.setFieldValue('role', 'faculty')}
                      >
                        Faculty
                      </Button>
                    </Box>

                    <Box display="flex" justifyContent="flex-end">
                      <MuiLink
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={() => navigate('/forgot-password')}
                      >
                        Forgot Password?
                      </MuiLink>
                    </Box>

                    <Button type="submit" loading={loading} fullWidth size="large">
                      Login
                    </Button>

                    <Typography variant="body2" textAlign="center" mt={2}>
                      Don't have an account?{' '}
                      <MuiLink
                        component="button"
                        type="button"
                        onClick={() => navigate('/signup')}
                      >
                        Sign up
                      </MuiLink>
                    </Typography>
                  </Box>
                </form>
              ) : (
                // Admin Login Form
                <form onSubmit={adminFormik.handleSubmit}>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={adminFormik.values.email}
                      onChange={adminFormik.handleChange}
                      onBlur={adminFormik.handleBlur}
                      error={adminFormik.touched.email && adminFormik.errors.email}
                      icon={Email}
                    />

                    <Input
                      label="Admin Access Key"
                      name="admin_access_key"
                      type="password"
                      value={adminFormik.values.admin_access_key}
                      onChange={adminFormik.handleChange}
                      onBlur={adminFormik.handleBlur}
                      error={
                        adminFormik.touched.admin_access_key &&
                        adminFormik.errors.admin_access_key
                      }
                      icon={Lock}
                      showPasswordToggle
                    />

                    <Box display="flex" justifyContent="flex-end">
                      <MuiLink
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={() => navigate('/forgot-password')}
                      >
                        Forgot Password?
                      </MuiLink>
                    </Box>

                    <Button type="submit" loading={loading} fullWidth size="large">
                      Login
                    </Button>
                  </Box>
                </form>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LoginPage;

