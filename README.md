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

- **Expo SDK**: 53.0.20 (new architecture enabled)
- **React**: 19.0.0
- **React Native**: 0.79.5
- **TypeScript**: 5.3.3 (strict mode)
- **Expo Router**: 5.1.4 untuk navigasi berbasis file
- **React Navigation**: Bottom Tabs (7.2.0) dan Stack (7.1.1)
- **NativeWind**: 2.0.11 untuk styling dengan Tailwind CSS
- **Penyimpanan Data**: AsyncStorage dan Expo SecureStore
- **UI/UX**: Expo Blur, Expo Linear Gradient, React Native Reanimated 3.17.4
- **Notifikasi**: React Native Toast Message

## Memulai

1. Pasang dependensi

   ```bash
   npm install
   ```

2. Jalankan aplikasi

   ```bash
   npx expo start
   ```

Di output, Anda akan menemukan opsi untuk membuka aplikasi di:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Emulator Android](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Simulator iOS](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), sandbox terbatas untuk mencoba pengembangan aplikasi dengan Expo

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
   - Hapus folder node_modules dan jalankan `npm install`

2. **Expo Go Connection Issues**
   - Pastikan ponsel dan komputer dalam jaringan yang sama
   - Coba gunakan mode tunnel dengan `--tunnel`

3. **Build Errors**
   - Periksa versi Node.js dan npm
   - Pastikan semua dependensi terinstal dengan benar

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

## Lisensi

Proyek ini dilindungi oleh lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.
