# Sinara Soon - Aplikasi Kospin 👋

Aplikasi mobile banking untuk Kospin Sinara Artha yang menyediakan akses digital ke layanan keuangan koperasi.

## Persyaratan Sistem

- Node.js versi 16.0.0 atau lebih baru
- npm versi 7.0.0 atau lebih baru
- Git
- Android Studio (untuk pengembangan Android)
- Xcode (untuk pengembangan iOS, hanya di macOS)
- Expo Go di perangkat fisik (opsional)

## Teknologi yang Digunakan

- **Expo SDK**: 54.0.0 (new architecture enabled)
- **React**: 19.1.0
- **React Native**: 0.81.5
- **TypeScript**: 5.9.2 (strict mode)
- **Expo Router**: 6.0.21 untuk navigasi berbasis file
- **React Navigation**: Bottom Tabs (7.2.0) dan Stack (7.1.1)
- **NativeWind**: 2.0.11 untuk styling dengan Tailwind CSS
- **Penyimpanan Data**: AsyncStorage (2.2.0) dan Expo SecureStore (15.0.8)
- **UI/UX**: Expo Blur, Expo Linear Gradient, React Native Reanimated 4.1.1
- **Worklets**: React Native Worklets (0.5.1) dan Worklets Core (1.6.2)
- **Notifikasi**: React Native Toast Message

## Memulai

1. Pasang dependensi

   ```bash
   npm install --legacy-peer-deps
   ```

   > **Catatan**: Flag `--legacy-peer-deps` diperlukan untuk mengatasi peer dependency warnings di SDK 54.

2. Jalankan aplikasi

   ```bash
   npx expo start
   ```

   Jika mengalami masalah cache setelah upgrade, gunakan:

   ```bash
   npx expo start --clear
   ```

Di output, Anda akan menemukan opsi untuk membuka aplikasi di:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Emulator Android](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Simulator iOS](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) - **Pastikan menggunakan Expo Go SDK 54**

Anda dapat mulai mengembangkan dengan mengedit file di dalam direktori **app**. Proyek ini menggunakan [routing berbasis file](https://docs.expo.dev/router/introduction).

## Proyek Baru

Jika ingin memulai dari awal, jalankan:

```bash
npm run reset-project
```

Perintah ini akan memindahkan kode awal ke direktori **app-example** dan membuat direktori **app** kosong di mana Anda bisa mulai mengembangkan.

## Pelajari Lebih Lanjut

Untuk mempelajari lebih lanjut tentang pengembangan proyek dengan Expo, lihat sumber daya berikut:

- [Dokumentasi Expo](https://docs.expo.dev/): Pelajari dasar-dasar atau lanjut ke topik lanjutan dengan [panduan kami](https://docs.expo.dev/guides).
- [Tutorial Belajar Expo](https://docs.expo.dev/tutorial/introduction/): Ikuti tutorial langkah demi langkah di mana Anda akan membuat proyek yang berjalan di Android, iOS, dan web.

## Struktur Aplikasi

Aplikasi ini menggunakan struktur berbasis folder yang mengikuti konvensi Expo Router:

- `app/`: Berisi routes dan komponen utama aplikasi
  - `(tabs)/`: Tab navigasi utama (grouped route)
  - `(menu)/`: Menu-menu utama aplikasi (grouped route dengan header)
  - `components/`: Komponen yang digunakan di routes
  - `config/`: Konfigurasi aplikasi (API endpoints, dll)
  - `_layout.tsx`: Root layout dengan theme provider
  - `+not-found.tsx`: 404 error screen
- `assets/`: Gambar, ikon, dan font
  - `fonts/`: Custom fonts (SpaceMono)
  - `images/`: Logo dan gambar aplikasi
  - `tab-icons/`: Icon untuk bottom tab navigation
  - Feature-specific: `e-wallet/`, `tagihan/`, dll
- `components/`: Komponen yang dapat digunakan ulang
  - `ui/`: UI primitives dan design system components
  - `__tests__/`: Component tests
- `constants/`: Konstanta dan tema
- `hooks/`: Custom React hooks
- `types/`: TypeScript type definitions
- `scripts/`: Build dan utility scripts

## Pengujian

Untuk menjalankan pengujian:

```bash
npm test
```

Unit testing menggunakan Jest dan React Native Testing Library.

## Troubleshooting

### Masalah Umum

1. **Metro Bundler Error**
   - Jalankan `npx expo start --clear`
   - Hapus folder node_modules dan jalankan `npm install --legacy-peer-deps`

2. **Expo Go Connection Issues**
   - Pastikan ponsel dan komputer dalam jaringan yang sama
   - Coba gunakan mode tunnel dengan `--tunnel`

3. **Build Errors**
   - Periksa versi Node.js dan npm
   - Pastikan semua dependensi terinstal dengan benar

### Masalah Khusus SDK 54

4. **Aplikasi Stuck di Splash Screen**
   - Penyebab: Metro bundler cache dari SDK lama
   - Solusi: Jalankan `npx expo start --clear`
   - Lihat `SPLASH_SCREEN_DEBUG.md` untuk detail lengkap

5. **Error: Cannot find module 'react-native-worklets/plugin'**
   - Penyebab: Missing worklets dependencies
   - Solusi:
     ```bash
     npm install react-native-worklets@0.5.1 --legacy-peer-deps
     npm install react-native-worklets-core --legacy-peer-deps
     npx expo start --clear
     ```
   - Lihat `SDK54_COMPLETE_FIX.md` untuk detail lengkap

6. **SDK Version Mismatch dengan Expo Go**
   - Pastikan Expo Go di device Anda adalah versi SDK 54
   - Download versi yang sesuai dari App Store/Play Store
   - Atau gunakan: `npx expo install --fix` untuk update dependencies

7. **Peer Dependency Warnings**
   - Selalu gunakan flag `--legacy-peer-deps` saat install
   - Ini normal untuk SDK 54 karena beberapa package masih catching up

### Clean Install (Jika Semua Gagal)

```bash
# 1. Hapus node_modules dan cache
rm -rf node_modules
npm cache clean --force

# 2. Install ulang dependencies
npm install --legacy-peer-deps

# 3. Start dengan clear cache
npx expo start --clear
```

### Dokumentasi Tambahan

Untuk troubleshooting lebih detail, lihat file-file berikut:
- `SDK54_COMPLETE_FIX.md` - Panduan lengkap upgrade SDK 53 → 54
- `SPLASH_SCREEN_DEBUG.md` - Debug splash screen issues
- `REANIMATED_FIX.md` - Fix untuk react-native-reanimated
- `EXPO_SDK_UPGRADE.md` - Catatan upgrade SDK

## Fitur Utama

- Manajemen akun (tabungan, deposito, pinjaman)
- Riwayat transaksi dan cek saldo
- Layanan pembayaran dan tagihan
- Autentikasi dan manajemen profil pengguna
- Dukungan multi-platform (iOS, Android, Web)

## Deployment

### Development Build
```bash
eas build --profile development
```

### Production Build
```bash
eas build --platform all
```

## Informasi Proyek

- **Package**: com.abunda.poskospin
- **Owner**: Abunda
- **EAS Project ID**: 0cfb8075-db1d-4a85-a096-b29d6d2f4aca
- **Primary Color**: #0066AE

## Bergabung dengan Komunitas

Bergabunglah dengan komunitas pengembang kami yang membuat aplikasi universal.

- [Expo di GitHub](https://github.com/expo/expo): Lihat platform open source kami dan berkontribusi.
- [Komunitas Discord](https://chat.expo.dev): Mengobrol dengan pengguna Expo dan ajukan pertanyaan.

## Changelog

### v1.0.1 - SDK 54 Upgrade (Januari 2026)

**Major Changes:**
- ✅ Upgrade dari Expo SDK 53 → SDK 54
- ✅ Update React 19.0.0 → 19.1.0
- ✅ Update React Native 0.79.5 → 0.81.5
- ✅ Update Expo Router 5.1.4 → 6.0.21
- ✅ Update React Native Reanimated 3.17.4 → 4.1.1

**New Dependencies:**
- ✅ React Native Worklets 0.5.1 (required for Reanimated 4.x)
- ✅ React Native Worklets Core 1.6.2

**Bug Fixes:**
- ✅ Fixed splash screen stuck issue after SDK upgrade
- ✅ Fixed Metro bundler cache compatibility
- ✅ Fixed missing worklets plugin error
- ✅ Added comprehensive error logging for debugging

**Documentation:**
- ✅ Added `SDK54_COMPLETE_FIX.md` - Complete upgrade guide
- ✅ Added `SPLASH_SCREEN_DEBUG.md` - Splash screen troubleshooting
- ✅ Added `REANIMATED_FIX.md` - Reanimated worklets fix
- ✅ Updated README with SDK 54 information

### v1.0.0 - Initial Release (2025)

**Features:**
- ✅ Expo SDK 53 implementation
- ✅ Tab-based navigation with Expo Router
- ✅ Authentication system with SecureStore
- ✅ Banking features (Tabungan, Deposito, Pinjaman)
- ✅ Transaction history and balance checking
- ✅ Bill payment integration
- ✅ Multi-platform support (iOS, Android, Web)

## Lisensi

Proyek ini dilindungi oleh lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.
