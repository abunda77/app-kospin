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
