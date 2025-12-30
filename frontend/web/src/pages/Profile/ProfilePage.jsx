import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import { Email, Phone, Person, Badge, Lock } from '@mui/icons-material';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import useAuthStore from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getInitials } from '../../utils/helpers';
import { passwordValidator } from '../../utils/validators';

function ProfilePage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const profileSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone is required'),
  });

  const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: passwordValidator,
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateProfile(values);
        toast.success('Profile updated successfully');
      } catch (err) {
        toast.error('Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('Password changed successfully');
        passwordFormik.resetForm();
      } catch (err) {
        toast.error('Failed to change password');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Profile
      </Typography>

      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar
            sx={{
              width: 96,
              height: 96,
              bgcolor: 'primary.main',
              fontSize: 32,
            }}
          >
            {getInitials(user?.name || user?.email)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {user?.name || user?.email}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.role?.toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.student_id || user?.employee_id || user?.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Profile Information" />
          <Tab label="Change Password" />
        </Tabs>
      </Paper>

      {/* Profile Information Tab */}
      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Personal Information
          </Typography>
          <form onSubmit={profileFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Input
                  label="Full Name"
                  name="name"
                  value={profileFormik.values.name}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.name && profileFormik.errors.name}
                  icon={Person}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={profileFormik.values.email}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.email && profileFormik.errors.email}
                  icon={Email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Input
                  label="Phone"
                  name="phone"
                  value={profileFormik.values.phone}
                  onChange={profileFormik.handleChange}
                  onBlur={profileFormik.handleBlur}
                  error={profileFormik.touched.phone && profileFormik.errors.phone}
                  icon={Phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Input
                  label="Role"
                  value={user?.role?.toUpperCase()}
                  disabled
                  icon={Badge}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Button type="submit" loading={loading} variant="contained">
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* Change Password Tab */}
      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Change Password
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Password must be at least 8 characters with uppercase, lowercase, number, and
            special character.
          </Alert>
          <form onSubmit={passwordFormik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={
                    passwordFormik.touched.currentPassword &&
                    passwordFormik.errors.currentPassword
                  }
                  icon={Lock}
                  showPasswordToggle
                />
              </Grid>
              <Grid item xs={12} md={6}></Grid>
              <Grid item xs={12} md={6}>
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={
                    passwordFormik.touched.newPassword &&
                    passwordFormik.errors.newPassword
                  }
                  icon={Lock}
                  showPasswordToggle
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={
                    passwordFormik.touched.confirmPassword &&
                    passwordFormik.errors.confirmPassword
                  }
                  icon={Lock}
                  showPasswordToggle
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Button type="submit" loading={loading} variant="contained">
                  Change Password
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
    </Box>
  );
}

export default ProfilePage;

