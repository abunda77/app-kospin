import { Platform } from 'react-native';

const fetchApiBaseUrl = async () => {
  try {
    const response = await fetch('https://app.kospinsinaraartha.co.id/api/config/api-base-url');
    const data = await response.json(); // Mengambil data JSON dari response
    if (data.status) {
      return data.data.api_base_url; // Ambil api_base_url dari response
    }
  } catch (error) {
    console.error('Error fetching API base URL:', error);
  }
  return 'https://app.kospinsinaraartha.co.id'; // Default value jika gagal
};

// Ubah untuk menggunakan fungsi async
const initializeApiBaseUrl = async () => {
  return await fetchApiBaseUrl();
};

let API_BASE_URL: string;

initializeApiBaseUrl().then(url => {
  API_BASE_URL = url;
});

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
  // Tambahan endpoint untuk mutasi
  MUTASI_BY_PERIODE: (noTabungan: string, periode: string) => `/api/mutasi/${noTabungan}/${periode}`,
  // Endpoint setoran simpanan (QRIS)
  SETORAN_REKENING_OPTIONS: '/api/setoran/rekening-options',
  SETORAN_GENERATE: '/api/setoran',
  SETORAN_AKTIF: '/api/setoran/aktif',
  SETORAN_HISTORY: '/api/setoran/history',
  SETORAN_DETAIL: (id: number) => `/api/setoran/${id}`,
  SETORAN_KLAIM: (id: number) => `/api/setoran/${id}/klaim`,
  // Endpoint penarikan simpanan
  PENARIKAN_REKENING_OPTIONS: '/api/penarikan/rekening-options',
  PENARIKAN_SUBMIT: '/api/penarikan',
  PENARIKAN_AKTIF: '/api/penarikan/aktif',
  PENARIKAN_HISTORY: '/api/penarikan/history',
  PENARIKAN_DETAIL: (id: number) => `/api/penarikan/${id}`,
  PENARIKAN_REVISI: (id: number) => `/api/penarikan/${id}/revisi`,
};

export default {
  getApiBaseUrl,
  API_ENDPOINTS
};
