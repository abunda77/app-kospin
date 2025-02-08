import { Platform } from 'react-native';

const API_BASE_URL = 'https://app.kospinsinaraartha.co.id';

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  // Tambahkan endpoint lain di sini
};

// Default export untuk menghilangkan warning
export default {
  getApiBaseUrl,
  API_ENDPOINTS
};
