# AGENTS.md

## Stack dan setup

- Aplikasi mobile banking Expo SDK 54 / React Native 0.81 / React 19 dengan Expo Router; pertahankan seluruh teks UI dalam Bahasa Indonesia.
- `app.json` mengaktifkan New Architecture dan typed routes; TypeScript memakai `strict`, dan alias `@/` menunjuk ke root repo.
- Instal dependensi dengan `npm install --legacy-peer-deps`; peer dependency SDK 54 tidak selaras tanpa flag ini.
- Reanimated 4 bergantung pada paket langsung `react-native-worklets` dan `react-native-worklets-core`; jangan hapus keduanya. Setelah upgrade SDK atau Metro macet di splash, gunakan `npx expo start --clear`.
- Versi rilis aplikasi berasal dari `app.json`/EAS (`eas.json` memakai `appVersionSource: remote`), bukan field `version` di `package.json`.

## Perintah dan baseline

- Dev: `npm start`; target langsung: `npm run android`, `npm run ios`, `npm run web`.
- Urutan verifikasi: `npm run lint`, lalu `npx tsc --noEmit`, lalu test yang relevan. Tidak ada CI; verifikasi hanya lokal.
- Baseline lint saat ini gagal: 5 error dan 114 warning. Pastikan perubahan tidak menambah masalah baru.
- `npm test` masuk watch mode. Sekali jalan: `npx jest --watchAll=false`; fokus satu-satunya test: `npx jest components/__tests__/ThemedText-test.tsx --watchAll=false`. Snapshot tersebut saat ini gagal (`Received: null`); typecheck lolos bersih.
- `npm run reset-project` destruktif: memindahkan `app`, `components`, `hooks`, `constants`, dan `scripts` ke `app-example`, lalu membuat app kosong. Jangan gunakan untuk verifikasi.
- EAS CLI minimal 16.14.1; profil `development` dan `preview` memakai distribusi internal, sedangkan `production` mengaktifkan auto-increment.

## Arsitektur dan alur

- Entry point adalah `expo-router/entry`. `app/_layout.tsx` menangani font/splash/theme dan membungkus seluruh app dengan `components/AutoLogoutProvider.tsx`.
- `app/(tabs)/` berisi empat tab utama; login berada inline di `index.tsx`. `app/(menu)/` adalah stack fitur terautentikasi, termasuk flow bertingkat `kredit/` dan `tabungan/`. Komponen reusable berada di root `components/`, bukan `app/components/`.
- Guard `app/(menu)/_layout.tsx` memeriksa SecureStore key `secure_token` saat mount dan setiap focus; tanpa token, navigasi ke `(tabs)` memakai `replace` di Android dan `push` di iOS. Pertahankan perbedaan platform ini pada navigasi kembali ke tab.
- Storage autentikasi tidak konsisten: login menyimpan `secure_token` di SecureStore dan `userData` di AsyncStorage, dashboard membaca/menulis `userData` di SecureStore, sedangkan `(tabs)/_layout.tsx` membaca key legacy AsyncStorage `userToken` yang tidak ditulis oleh login. Telusuri seluruh flow sebelum menyamakan key atau storage.
- Auto-logout aktif setelah 60 detik tanpa sentuhan atau berada di background; prosesnya menghapus `secure_token` dan kedua salinan `userData` sebelum request logout server best-effort.
- `app/config/api.ts` mengambil base URL secara asinkron saat module dimuat, dengan fallback `https://app.kospinsinaraartha.co.id`. Screen menggabungkan hasil `getApiBaseUrl()` dengan `API_ENDPOINTS` dan memanggil `fetch` langsung; nilai base URL dapat masih `undefined` saat startup.

## Konvensi yang mudah terlewat

- NativeWind v2 memakai mode Babel `transformOnly`, tetapi hanya login `app/(tabs)/index.tsx` yang mengimpor `app/globals.css`; screen lain dominan memakai `StyleSheet.create`. Ada juga `globals.css` duplikat di root, jadi jangan mengubah import secara asumtif.
- `react-native-toast-message` tidak dipasang di root layout; screen yang memanggil `Toast.show` harus merender `<Toast />` sendiri agar pesan terlihat.
- Ikon tab adalah PNG lokal di `assets/tab-icons/` dengan `tintColor`; warna brand aktif adalah hijau `#1F7900`.
- Sumber kebenaran: `package.json`, `app.json`, `eas.json`, dan `babel.config.js`. File `CLAUDE.md` dan `.cursor/rules/app-kospin.mdc` berisi panduan serupa namun bisa tertinggal. File markdown lain di root (`EXPO_SDK_UPGRADE.md`, `REANIMATED_FIX.md`, dll.) hanya catatan sejarah, bukan referensi.
