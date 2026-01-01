import { useState } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import { Email } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/auth.service';
import { forgotPasswordSchema } from '../../utils/validators';

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      role: 'student',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const response = await authService.userForgotPassword(values);
        toast.success('Password reset OTP sent to your email');
        navigate('/reset-password', {
          state: { userId: response.userId, email: values.email },
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to send OTP');
        toast.error(err.response?.data?.error || 'Failed to send OTP');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: '16px',
            p: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Logo size="medium" />
            <Typography variant="h5" fontWeight="bold" mt={2}>
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
              Enter your email to receive a password reset OTP
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
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && formik.errors.email}
                icon={Email}
              />

              <Button type="submit" loading={loading} fullWidth size="large">
                Send Reset OTP
              </Button>

              <Button
                variant="text"
                onClick={() => navigate('/login')}
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

export default ForgotPasswordPage;

