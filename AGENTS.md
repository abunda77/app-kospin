# AGENTS.md

## Stack dan batasan

- Aplikasi mobile banking Expo SDK 54 / React Native 0.81 / React 19 dengan Expo Router; seluruh teks UI harus tetap dalam Bahasa Indonesia.
- `app.json` mengaktifkan React Native New Architecture dan typed routes. Alias `@/` menunjuk ke root repo.
- Instal dependensi dengan `npm install --legacy-peer-deps`; peer dependency SDK 54 tidak selaras tanpa flag ini.
- Jangan hapus `react-native-worklets@0.5.1` atau `react-native-worklets-core@1.6.2`; keduanya dibutuhkan Reanimated 4. Setelah upgrade SDK atau Metro macet di splash, gunakan `npx expo start --clear`.

## Perintah verifikasi

- Dev: `npm start`; Android/iOS/web: `npm run android`, `npm run ios`, `npm run web`.
- Lint: `npm run lint`.
- Typecheck: `npx tsc --noEmit` (tidak ada script npm khusus).
- `npm test` menjalankan watch mode tanpa selesai. Untuk sekali jalan gunakan `npx jest --watchAll=false`; test terfokus: `npx jest components/__tests__/ThemedText-test.tsx --watchAll=false`.
- `npm run reset-project` destruktif: memindahkan `app`, `components`, dan `hooks` ke `app-example`, lalu membuat app kosong. Jangan jalankan untuk verifikasi biasa.
- EAS CLI minimal 16.14.1; profil `development` dan `preview` adalah distribusi internal, sedangkan `production` mengaktifkan auto-increment remote version.

## Arsitektur yang mudah terlewat

- Entry point adalah `expo-router/entry`. `app/_layout.tsx` menangani font, splash, dan theme.
- `app/(tabs)/` berisi tab utama dan login inline di `index.tsx`; `app/(menu)/` berisi stack fitur terautentikasi.
- Guard autentikasi utama ada di `app/(menu)/_layout.tsx` dan memeriksa SecureStore key `secure_token` saat mount serta focus.
- Login menyimpan token ke SecureStore key `secure_token`, tetapi menyimpan `userData` ke AsyncStorage. Kode dashboard juga memakai SecureStore key `userData`, dan layout tab masih membaca AsyncStorage key legacy `userToken`; jangan menyamakan atau memigrasikan key/storage ini tanpa menelusuri seluruh flow.
- `app/config/api.ts` memuat base URL secara asinkron lalu screen menggabungkannya dengan `API_ENDPOINTS` dan memanggil `fetch` langsung. `getApiBaseUrl()` dapat belum terisi saat startup; jangan menganggapnya Promise atau selalu siap tanpa memperbaiki semua call site terkait.

## Konvensi implementasi

- NativeWind v2 (`transformOnly`) dan `StyleSheet.create` dipakai bersamaan. Screen yang memakai class NativeWind harus mengimpor `globals.css` dengan path relatif yang benar.
- Komponen reusable berada di root `components/`, bukan `app/components/`. Ikon tab adalah PNG lokal di `assets/tab-icons/` yang diberi `tintColor`.
- `react-native-toast-message` saat ini dirender per-screen, bukan di root layout; ikuti pola screen sekitar agar toast terlihat.
- Warna brand aktual: hijau `#1F7900` untuk splash/header menu/tab aktif dan biru `#0066AE` untuk header/login/aksi. Dokumentasi lama yang menyebut biru sebagai satu-satunya primary tidak mencerminkan pemakaian kode.
- Perlakukan `.kiro/steering/tech.md` dan `.cursor/rules/app-kospin.mdc` sebagai stale untuk versi dependency; `package.json`, `app.json`, dan konfigurasi executable adalah sumber kebenaran.
