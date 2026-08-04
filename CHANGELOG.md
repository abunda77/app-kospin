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
- Menyesuaikan tema warna aplikasi dari nuansa biru ke hijau tua (`#1F7900`) pada tombol, ikon, teks, gradient, dan latar di folder `app` serta komponen pendukung.

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

## [1.0.2] - 2026-06-16

### Ditambahkan
- Dokumentasi agen: `CLAUDE.md` (menyusul) dan kiro steering

### Diubah
- Upgrade Expo SDK 54
- Pembaruan animasi banner
- Ganti logo aplikasi dan naikkan versi ke 1.0.2

### Perbaikan
- Fix fetch banner dan toast login
- Fix bug RVE

### Dihapus
- Tidak ada

## [1.0.4] - 2026-07-16

### Ditambahkan
- Dokumentasi `CLAUDE.md`

### Diubah
- Warna dasar aplikasi diubah ke hijau `#1F7900`
- Penyesuaian pola warna (colour pattern) di seluruh halaman

### Perbaikan
- Fix perhitungan saldo total di dashboard

### Dihapus
- Tidak ada

## [1.0.6] - 2026-08-02

### Ditambahkan

### Diubah
- Tidak ada

### Perbaikan
- Tidak ada

### Dihapus
- Hapus tab dan halaman "Aktivitas" dari navigasi (`aktivitas.tsx` dihapus, referensi di `_layout.tsx` dan `index.tsx` dibersihkan)

## [1.0.5] - 2026-07-30

### Ditambahkan
- Fitur update password
- Auto logout otomatis setelah tidak ada aktivitas (`AutoLogoutProvider`)

### Diubah
- Ganti data alamat lama dengan alamat baru pada profil
- Sembunyikan status pernikahan pada halaman profil
- Naikkan versi aplikasi ke 1.0.5

### Perbaikan
- Fix mekanisme auto logout
- Fix banner tidak menampilkan gambar terbaru tanpa clear cache/data: ditambahkan cache busting `?v={updated_at}` pada URL gambar banner di halaman utama (`index.tsx`)
- Fix cache busting banner di `dashboard.tsx`: render gambar banner kini menggunakan `withCacheBuster(banner.url, banner.updated_at)` sehingga gambar diperbarui sesuai perubahan di server

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