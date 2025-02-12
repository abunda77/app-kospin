import { Platform } from 'react-native';

const API_BASE_URL = 'https://app.kospinsinaraartha.co.id';

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  LOGOUT: '/api/logout',
  UPDATE_PASSWORD: '/api/update-password',
  FORGOT_PASSWORD: '/api/forgot-password',
  RESET_PASSWORD: '/api/reset-password',
  PROFILE_BY_ID: '/api/profiles/{id}',
  PROFILES: '/api/profiles',
  TABUNGAN_SALDO_BERJALAN: '/api/tabungan/saldo-berjalan',
  TABUNGAN_BY_PROFILE: '/api/tabungan/by-profile',
  TABUNGAN_MUTASI: '/api/tabungan/mutasi',
  USER_PROFILE: '/api/profiles',
  BANNER_MOBILE: 'api/banner-mobile/type/square',
  // Tambahkan endpoint lain di sini
};

// Default export untuk menghilangkan warning
export default {
  getApiBaseUrl,
  API_ENDPOINTS
};
