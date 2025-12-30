import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

class AdminService {
  // Dashboard Stats
  async getDashboardStats() {
    const response = await api.get('/admin/stats/dashboard');
    return response.data;
  }

  // Users Management
  async getUsers(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN_USERS, { params });
    return response.data;
  }

  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  }

  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  }

  async suspendUser(id, data) {
    const response = await api.post(`/admin/users/${id}/suspend`, data);
    return response.data;
  }

  async unsuspendUser(id) {
    const response = await api.post(`/admin/users/${id}/unsuspend`);
    return response.data;
  }

  // Warnings Management
  async getWarnings(params = {}) {
    const response = await api.get(API_ENDPOINTS.ADMIN_WARNINGS, { params });
    return response.data;
  }

  async getUserWarnings(userId) {
    const response = await api.get(`/admin/warnings/user/${userId}`);
    return response.data;
  }

  async sendWarning(data) {
    const response = await api.post(API_ENDPOINTS.ADMIN_WARNINGS, data);
    return response.data;
  }

  async markWarningAsRead(id) {
    const response = await api.patch(`/admin/warnings/${id}/read`);
    return response.data;
  }
}

export default new AdminService();

