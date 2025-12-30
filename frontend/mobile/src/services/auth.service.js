import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

class AuthService {
  // User Authentication
  async userSignup(formData) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await api.post(API_ENDPOINTS.USER_SIGNUP, formData, config);
    return response.data;
  }

  async userVerifyOTP(data) {
    const response = await api.post(API_ENDPOINTS.USER_VERIFY_OTP, data);
    return response.data;
  }

  async userLogin(data) {
    const response = await api.post(API_ENDPOINTS.USER_LOGIN, data);
    return response.data;
  }

  async userVerifyLoginOTP(data) {
    const response = await api.post(API_ENDPOINTS.USER_VERIFY_LOGIN_OTP, data);
    return response.data;
  }

  async userForgotPassword(data) {
    const response = await api.post(API_ENDPOINTS.USER_FORGOT_PASSWORD, data);
    return response.data;
  }

  async userResetPassword(data) {
    const response = await api.post(API_ENDPOINTS.USER_RESET_PASSWORD, data);
    return response.data;
  }

  // Admin Authentication
  async adminSignup(data) {
    const response = await api.post(API_ENDPOINTS.ADMIN_SIGNUP, data);
    return response.data;
  }

  async adminVerifyOTP(data) {
    const response = await api.post(API_ENDPOINTS.ADMIN_VERIFY_OTP, data);
    return response.data;
  }

  async adminLogin(data) {
    const response = await api.post(API_ENDPOINTS.ADMIN_LOGIN, data);
    return response.data;
  }

  async adminVerifyLoginOTP(data) {
    const response = await api.post(API_ENDPOINTS.ADMIN_VERIFY_LOGIN_OTP, data);
    return response.data;
  }

  async adminApprove(data) {
    const response = await api.post(API_ENDPOINTS.ADMIN_APPROVE, data);
    return response.data;
  }

  async adminForgotPassword(data) {
    const response = await api.post(API_ENDPOINTS.ADMIN_FORGOT_PASSWORD, data);
    return response.data;
  }

  async adminResetPassword(data) {
    const response = await api.post(API_ENDPOINTS.ADMIN_RESET_PASSWORD, data);
    return response.data;
  }
}

export default new AuthService();

