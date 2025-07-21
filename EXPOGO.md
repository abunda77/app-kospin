# Panduan Penggunaan Expo Go

## Mode Koneksi

### 1. LAN Mode (Default)
- Menggunakan jaringan lokal
- Tercepat untuk development
- Membutuhkan perangkat dan komputer dalam jaringan yang sama
- Ideal untuk pengembangan sehari-hari

### 2. Tunnel Mode
- Menggunakan layanan tunnel (ngrok)
- Bisa diakses dari mana saja dengan internet
- Lebih lambat dibanding LAN mode
- Berguna saat:
  - Bekerja di belakang firewall
  - Menggunakan VPN
  - Jaringan Wi-Fi berbeda

### 3. Localhost Mode
- Hanya berjalan di emulator/simulator lokal
- Tidak bisa diakses dari perangkat fisik
- Paling aman untuk pengembangan sensitif

## 🚀 Opsi Flag pada `npx expo start`

| Flag                                   | Fungsi / Keterangan                                    |
|-----------------------------------------|--------------------------------------------------------|
| `--lan`                                | Koneksi menggunakan LAN (default)                      |
| `--tunnel`                             | Koneksi dengan tunnel (ngrok)                          |
| `--localhost`                          | Hanya koneksi dari localhost                           |
| `--port, -p <number>`                  | Tentukan port Metro bundler                            |
| `--https` / `--no-https`               | Pakai HTTPS (khusus web/webpack)                       |
| `--clear, -c`                          | Bersihkan cache Metro bundler sebelum start            |
| `--dev` / `--no-dev`                   | Aktifkan/nonaktifkan mode development                  |
| `--minify` / `--no-minify`             | Aktifkan/nonaktifkan minifikasi JavaScript             |
| `--offline`                            | Jalankan server secara offline (tanpa internet)        |
| `--dev-client`                         | Paksa buka dengan development build (expo-dev-client)  |
| `--go`                                 | Paksa buka dengan Expo Go app                          |
| `--send-to <email>`                    | Kirim link QR/URL ke email                             |
| `--max-workers <number>`               | Atur jumlah maksimum Metro worker threads              |
| `--scheme <uri>`                       | Tentukan custom URI scheme untuk dev client            |
| `--config <file>` (deprecated)         | Pilih file config khusus (lebih baik pakai app.config) |

### Contoh Penggunaan:

```bash
# Start dengan tunnel, clear cache, port custom
npx expo start --tunnel -c -p 19002

# Start dalam mode produksi (minify, no-dev)
npx expo start --no-dev --minify

# Paksa gunakan dev-client & offline mode
npx expo start --dev-client --offline
```

## Building Android App Bundle (AAB)

Android App Bundle (AAB) adalah format publikasi resmi untuk Google Play Store yang menggantikan APK. Dengan AAB, ukuran unduhan aplikasi menjadi lebih kecil karena Google Play hanya mengirimkan kode dan resource yang dibutuhkan oleh perangkat spesifik pengguna.

### Persiapan untuk Building AAB

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login ke Expo Account**:
   ```bash
   eas login
   ```

3. **Konfigurasi Proyek**:
   ```bash
   eas build:configure
   ```
   Command ini akan membuat file `eas.json` di root project

### Konfigurasi Build Profile

Edit file `eas.json` untuk menyesuaikan konfigurasi build:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Memulai Build AAB

Untuk membangun Android App Bundle (AAB):

```bash
eas build --platform android --profile production
```

Ini akan memulai proses build di server Expo dan akan menghasilkan file AAB yang siap diupload ke Google Play Store.

### Opsi Tambahan Build AAB

1. **Build dan Submit Otomatis**:
   ```bash
   eas build --platform android --profile production --auto-submit
   ```
   Perintah ini akan melakukan build AAB dan langsung mengirimnya ke Google Play Store (memerlukan konfigurasi service account Google).

2. **Konfigurasi Track Rilis**:
   Untuk mengatur track rilis (internal, alpha, beta, production) pada Google Play Store, edit bagian `submit` di `eas.json`:
   
   ```json
   {
     "submit": {
       "production": {
         "android": {
           "serviceAccountKeyPath": "./path-to-service-account.json",
           "track": "internal"  // bisa internal, alpha, beta, production
         }
       }
     }
   }
   ```

3. **Submit AAB yang Sudah Ada**:
   ```bash
   eas submit --platform android
   ```
   Perintah ini akan menanyakan apakah ingin menggunakan build yang sudah ada atau membuat yang baru.

### Proses Build AAB

Saat menjalankan perintah build, proses berikut terjadi:
1. Kode aplikasi diunggah ke server build Expo
2. Server melakukan:
   - Instalasi dependencies
   - Konfigurasi kredensial signing aplikasi
   - Menjalankan perintah build (bundle)
   - Menghasilkan file AAB
3. File AAB siap diunduh atau disubmit ke Google Play Store

### Keuntungan AAB vs APK

1. **Ukuran download lebih kecil**: Pengguna hanya mengunduh komponen yang dibutuhkan perangkat mereka
2. **Dukungan Dynamic Features**: Memungkinkan fitur on-demand yang diunduh saat dibutuhkan
3. **Optimasi otomatis**: Google Play mengoptimalkan APK untuk setiap konfigurasi perangkat
4. **Kemudahan pengelolaan**: Satu AAB mencakup semua konfigurasi perangkat

## Best Practice Penggunaan

- Gunakan mode LAN untuk kecepatan maksimal saat perangkat dan komputer dalam satu jaringan Wi-Fi.
- Gunakan mode Tunnel jika perangkat dan komputer berbeda jaringan, atau jika mengalami masalah firewall/VPN.
- Gunakan mode Localhost untuk pengujian di emulator/simulator saja.

## Troubleshooting

- **Tidak bisa scan QR di Expo Go:**
  - Pastikan perangkat dan komputer satu jaringan (untuk LAN)
  - Coba mode tunnel jika tetap gagal
  - Matikan firewall/antivirus yang memblokir port
- **Metro bundler tidak merespon:**
  - Jalankan `npx expo start --clear` untuk membersihkan cache
  - Pastikan tidak ada proses node/expo lain yang berjalan di port yang sama
- **Aplikasi tidak update di perangkat:**
  - Tutup aplikasi Expo Go, buka ulang, dan scan QR lagi
  - Pastikan tidak ada error di Metro bundler
- **Error saat build AAB:**
  - Pastikan `app.json` dan `eas.json` terkonfigurasi dengan benar
  - Periksa error log di EAS Dashboard
  - Jika ada error signing, pastikan keystore dikonfigurasi dengan benar

## Lingkungan Pengembangan

- Disarankan menggunakan Node.js versi terbaru LTS
- Pastikan npm dan expo-cli sudah terupdate
- Untuk Windows, gunakan PowerShell atau Command Prompt
- Untuk pengembangan Android, install Android Studio dan set up emulator
- Untuk pengembangan iOS, hanya bisa di macOS dengan Xcode

## Referensi
- [Expo CLI Documentation](https://docs.expo.dev/workflow/expo-cli/)
- [Troubleshooting Expo](https://docs.expo.dev/troubleshooting/common-issues/)
- [Expo Go](https://expo.dev/client)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
