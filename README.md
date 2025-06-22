# Selamat Datang di Aplikasi Kospin 👋

Ini adalah aplikasi [Expo](https://expo.dev) yang dibuat menggunakan [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Persyaratan Sistem

- Node.js versi 16.0.0 atau lebih baru
- npm versi 7.0.0 atau lebih baru
- Git
- Android Studio (untuk pengembangan Android)
- Xcode (untuk pengembangan iOS, hanya di macOS)
- Expo Go di perangkat fisik (opsional)

## Teknologi yang Digunakan

- **Expo**: versi 52.0.30
- **React**: versi 18.3.1
- **React Native**: versi 0.76.6
- **Expo Router**: versi 4.0.17 untuk navigasi berbasis file
- **React Navigation**: Bottom Tabs (versi 7.2.0) dan Stack (versi 7.1.1)
- **NativeWind**: versi 2.0.11 untuk styling dengan Tailwind CSS
- **Penyimpanan Data**: AsyncStorage dan SecureStore
- **UI/UX**: Expo Blur, Expo Linear Gradient, React Native Reanimated
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
  - `(menu)/`: Menu-menu utama aplikasi
  - `(tabs)/`: Tab navigasi utama
  - `components/`: Komponen yang digunakan di routes
- `assets/`: Gambar, ikon, dan font
- `components/`: Komponen yang dapat digunakan ulang
- `config/`: Konfigurasi aplikasi
- `constants/`: Konstanta dan tema
- `hooks/`: Custom React hooks
- `types/`: TypeScript type definitions

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

## Deployment

### Development Build
```bash
eas build --profile development
```

### Production Build
```bash
eas build --platform all
```

## Bergabung dengan Komunitas

Bergabunglah dengan komunitas pengembang kami yang membuat aplikasi universal.

- [Expo di GitHub](https://github.com/expo/expo): Lihat platform open source kami dan berkontribusi.
- [Komunitas Discord](https://chat.expo.dev): Mengobrol dengan pengguna Expo dan ajukan pertanyaan.

## Lisensi

Proyek ini dilindungi oleh lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.
