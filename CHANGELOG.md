# Changelog

Semua perubahan penting pada proyek ini akan dicatat dalam file ini.

Format ini didasarkan pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan proyek ini mengikuti [Pemversian Semantik](https://semver.org/lang/id/spec/v2.0.0.html).



## [Unreleased] - 2025-07-14

### Ditambahkan
- Aplikasi mobile Kospin versi pertama
- Fitur autentikasi pengguna
- Dashboard utama dengan menu navigasi
- Fitur tabungan:
  - Setoran tabungan
  - Penarikan tabungan
  - Riwayat transaksi tabungan
- Fitur pinjaman:
  - Pengajuan pinjaman
  - Detail angsuran
  - Pembayaran angsuran
- Fitur transfer antar rekening ( coming soon)
- Fitur pembayaran tagihan (PLN, BPJS, Telkom, dll) ( coming soon)
- Fitur top-up e-wallet (Dana, GoPay, OVO, ShopeePay, LinkAja) ( coming soon)
- Fitur pembelian pulsa dan paket data ( coming soon)
- Fitur pembayaran QRIS ( coming soon)
- Fitur gadai emas
- Fitur deposito
- Halaman mutasi transaksi
- Halaman aktivitas pengguna
- Halaman profil dan pengaturan akun

### Diubah
- Tidak ada perubahan pada versi awal

### Perbaikan
- Tidak ada perbaikan pada versi awal

### Dihapus
- Tidak ada penghapusan pada versi awal

## [0.0.2] - 2025-07-21

### Ditambahkan

### Diubah
- Tidak ada

### Perbaikan
- Update SDK 53
- Fix error bug "text rendering"
- fix banner callback
- fix bug tab menu overlapping
- Fix save area browser scrolling
- Fix saldo balance switch account

### Dihapus
- Tidak ada

## [0.0.3] - 2025-07-23

### Ditambahkan

### Diubah
- Tidak ada

### Perbaikan
- Fix fetch banner timeout
- fix posisi toast login failed

### Dihapus
- Tidak ada

---

## Catatan Format

### Format Penulisan Versi
- Gunakan format [MAJOR.MINOR.PATCH]
- Contoh: [1.2.3]

### Format Tanggal
- Gunakan format YYYY-MM-DD
- Contoh: 2025-07-21

### Kategori Perubahan
- **Ditambahkan** untuk fitur baru
- **Diubah** untuk perubahan pada fitur yang sudah ada
- **Perbaikan** untuk perbaikan bug
- **Dihapus** untuk fitur yang dihapus
- **Keamanan** untuk perubahan keamanan (jika ada)

### Contoh Penulisan
```
## [1.1.0] - 2025-07-25
### Ditambahkan
- Fitur dark mode
- Notifikasi push untuk transaksi

### Diubah
- Tampilan halaman login menjadi lebih modern

### Perbaikan
- Bug pada tombol back di halaman transfer
- Error validasi nominal transfer
```

### Panduan Kontribusi
1. Tambahkan entri baru di bagian [Unreleased] untuk perubahan yang belum dirilis
2. Pindahkan item dari [Unreleased] ke versi baru saat release
3. Gunakan bahasa Indonesia yang jelas dan deskriptif
4. Sertakan nomor issue atau PR jika relevan