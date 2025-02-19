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
  BANNER_MOBILE: '/api/banner-mobile/type/square',
  BANNER_MOBILE_DASHBOARD: '/api/banner-mobile/type/rectangle',
  DEPOSITO_BY_PROFILE: '/api/deposito/by-profile',
  REGIONS: '/api/regions',
  PINJAMAN_BY_PROFILE: '/api/pinjaman/by-profile',
  PINJAMAN_HISTORY_PEMBAYARAN: '/api/pinjaman/history-pembayaran',
  PINJAMAN_TAGIHAN: '/api/pinjaman/tagihan',
  ANGSURAN_DETAILS: '/api/angsuran/details',
};

export default {
  getApiBaseUrl,
  API_ENDPOINTS
};
