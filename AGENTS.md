# AGENTS.md

## Stack dan batasan

- Aplikasi mobile banking Expo SDK 54 / React Native 0.81 / React 19 dengan Expo Router; seluruh teks UI harus tetap dalam Bahasa Indonesia.
- `app.json` mengaktifkan React Native New Architecture dan typed routes. Alias `@/` menunjuk ke root repo.
- Instal dependensi dengan `npm install --legacy-peer-deps`; peer dependency SDK 54 tidak selaras tanpa flag ini.
- Jangan hapus `react-native-worklets@0.5.1` atau `react-native-worklets-core@1.6.2`; keduanya dibutuhkan Reanimated 4. Setelah upgrade SDK atau Metro macet di splash, gunakan `npx expo start --clear`.
- File `.env` di root kosong dan tidak dibaca oleh kode; Expo tidak memuat `.env` secara default.

## Perintah verifikasi

- Dev: `npm start`; Android/iOS/web: `npm run android`, `npm run ios`, `npm run web`.
- Lint: `npm run lint` — sudah gagal dengan 5 error bawaan (react-hooks, unescaped entities) plus banyak warning; jangan berharap exit 0, cukup pastikan tidak menambah error baru.
- Typecheck: `npx tsc --noEmit` (tidak ada script npm khusus); saat ini lolos bersih.
- `npm test` menjalankan watch mode tanpa selesai. Sekali jalan: `npx jest --watchAll=false`; test terfokus: `npx jest components/__tests__/ThemedText-test.tsx --watchAll=false`. Satu-satunya test (snapshot `ThemedText`) saat ini gagal sejak awal — bukan tanda perubahan Anda merusak build.
- `npm run reset-project` destruktif: memindahkan `app`, `components`, `hooks`, `constants`, dan `scripts` ke `app-example`, lalu membuat app kosong. Jangan jalankan untuk verifikasi biasa.
- EAS CLI minimal 16.14.1; profil `development` dan `preview` adalah distribusi internal, sedangkan `production` mengaktifkan auto-increment.

## Arsitektur yang mudah terlewat

- Entry point adalah `expo-router/entry`. `app/_layout.tsx` menangani font, splash, dan theme, serta membungkus app dengan `AutoLogoutProvider` (dari root `components/`).
- `app/(tabs)/` berisi tab utama dan login inline di `index.tsx`; `app/(menu)/` berisi stack fitur terautentikasi.
- Guard autentikasi utama ada di `app/(menu)/_layout.tsx` dan memeriksa SecureStore key `secure_token` saat mount serta setiap focus; tanpa token, redirect ke `(tabs)`.
- Login menyimpan token ke SecureStore key `secure_token`, tetapi menyimpan `userData` ke AsyncStorage. Dashboard membaca/menulis `userData` di SecureStore, dan `(tabs)/_layout.tsx` masih membaca AsyncStorage key legacy `userToken`; jangan menyamakan atau memigrasikan key/storage ini tanpa menelusuri seluruh flow.
- Navigasi dari `(menu)` kembali ke tab memakai `router.replace` di Android dan `router.push` di iOS; ikuti pola yang sama jika menambah navigasi.
- `app/config/api.ts` memuat base URL secara asinkron (fallback `https://app.kospinsinaraartha.co.id`) lalu screen menggabungkannya dengan `API_ENDPOINTS` dan memanggil `fetch` langsung; tidak ada API client terpusat. `getApiBaseUrl()` dapat mengembalikan `undefined` saat startup — jangan menganggapnya selalu siap tanpa memperbaiki semua call site terkait.
- `app/components/` kosong; komponen reusable berada di root `components/`. Ikon tab adalah PNG lokal di `assets/tab-icons/` yang diberi `tintColor`.

## Konvensi implementasi

- NativeWind v2 (`transformOnly`) dan `StyleSheet.create` dipakai bersamaan. Screen yang memakai class NativeWind harus mengimpor `globals.css` dengan path relatif yang benar.
- `react-native-toast-message` dirender per-screen (`<Toast />` di tiap screen yang butuh), bukan di root layout; ikuti pola screen sekitar agar toast terlihat.
- Warna brand aktual hanya hijau `#1F7900` (splash, header menu, tab aktif, tombol, gradient). Klaim lama tentang biru `#0066AE` tidak lagi ada di kode.
- Perlakukan `.kiro/steering/tech.md`, `.cursor/rules/app-kospin.mdc`, dan sebagian `CLAUDE.md`/`README.md` sebagai stale untuk versi dependency dan warna; `package.json`, `app.json`, `eas.json`, dan `babel.config.js` adalah sumber kebenaran.
