import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

class BooksService {
  // Get all books with pagination and filters
  async getBooks(params = {}) {
    const response = await api.get(API_ENDPOINTS.BOOKS, { params });
    return response.data;
  }

  // Get single book
  async getBookById(id) {
    const response = await api.get(`/books/${id}`);
    return response.data;
  }

  // Create book (admin only)
  async createBook(formData) {
    const response = await api.post(API_ENDPOINTS.BOOKS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Update book (admin only)
  async updateBook(id, formData) {
    const response = await api.put(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Delete book (admin only)
  async deleteBook(id) {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  }

  // Get book statistics
  async getBookStats() {
    const response = await api.get('/books/stats/summary');
    return response.data;
  }
}

export default new BooksService();

