import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    apiClient.post('/api/login', { username, password }),
  
  register: (userData) =>
    apiClient.post('/api/register', userData),
};

// Forms API
export const formsAPI = {
  // Family Survey
  createFamilySurvey: (data) =>
    apiClient.post('/api/family-surveys', data),
  
  getFamilySurveys: () =>
    apiClient.get('/api/family-surveys'),

  // Pregnancy Report
  createPregnancyReport: (data) =>
    apiClient.post('/api/pregnancy-reports', data),
  
  getPregnancyReports: () =>
    apiClient.get('/api/pregnancy-reports'),

  // Child Vaccination
  createChildVaccination: (data) =>
    apiClient.post('/api/child-vaccinations', data),

  // Postnatal Care
  createPostnatalCare: (data) =>
    apiClient.post('/api/postnatal-care', data),

  // Leprosy Report
  createLeprosyReport: (data) =>
    apiClient.post('/api/leprosy-reports', data),

  // Sync offline data
  syncData: (data) =>
    apiClient.post('/api/sync', data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    apiClient.get('/api/dashboard'),
};

// Alerts API
export const alertsAPI = {
  getAlerts: () =>
    apiClient.get('/api/alerts'),
  
  markAlertRead: (alertId) =>
    apiClient.put(`/api/alerts/${alertId}/read`),
};

export default apiClient;