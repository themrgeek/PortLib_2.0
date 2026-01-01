import * as Yup from 'yup';

export const emailValidator = Yup.string()
  .email('Invalid email address')
  .required('Email is required');

export const phoneValidator = Yup.string()
  .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
  .required('Phone number is required');

export const passwordValidator = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
  .required('Password is required');

export const otpValidator = Yup.string()
  .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
  .required('OTP is required');

export const studentIdValidator = Yup.string()
  .required('Student ID is required');

export const employeeIdValidator = Yup.string()
  .required('Employee ID is required');

export const adminKeyValidator = Yup.string()
  .required('Admin key is required');

export const loginSchema = Yup.object().shape({
  identifier: Yup.string().required('Email or Phone is required'),
  password: passwordValidator,
});

export const adminLoginSchema = Yup.object().shape({
  email: emailValidator,
  admin_access_key: Yup.string().required('Admin access key is required'),
});

export const otpSchema = Yup.object().shape({
  emailOTP: otpValidator,
  smsOTP: otpValidator,
});

export const forgotPasswordSchema = Yup.object().shape({
  email: emailValidator,
});

export const resetPasswordSchema = Yup.object().shape({
  otp: otpValidator,
  newPassword: passwordValidator,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export const signupSchema = Yup.object().shape({
  email: emailValidator,
  phone: phoneValidator,
  password: passwordValidator,
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

