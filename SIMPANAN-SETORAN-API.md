# API Simpanan — Setoran & Penarikan (Mobile)

Dokumentasi API untuk fitur **Setoran Simpanan (QRIS / Transfer Rekening)** dan **Penarikan Simpanan** pada aplikasi mobile React Native. Endpoint ini mereplikasi flow halaman dashboard user `/user/setoran-simpanan` dan `/user/penarikan-simpanan`.

- Base URL: `{APP_URL}/api`
- Autentikasi: Laravel Sanctum (Bearer Token)
- Format: JSON (kecuali upload berkas → `multipart/form-data`)

---

## 1. Autentikasi

Semua endpoint simpanan **wajib** membawa token Sanctum:

```
Authorization: Bearer {token}
Accept: application/json
```

Dapatkan token dari endpoint login yang sudah ada:

```
POST /api/login
Content-Type: application/json

{ "email": "user@mail.com", "password": "secret" }
```

Response sukses (`200`):

```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "Nama Anggota", "email": "user@mail.com" },
    "token": "3|AbCdEf..."
  }
}
```

Simpan `token` (mis. dengan `react-native-keychain` / `AsyncStorage`) dan sertakan di setiap request. Jika token tidak valid/kosong, API mengembalikan `401`:

```json
{ "status": false, "message": "Unauthenticated" }
```

Logout: `POST /api/logout`.

---

## 2. Format Response Umum

Semua endpoint memakai amplop yang sama:

**Sukses:**

```json
{
  "status": true,
  "message": "Pesan untuk user",
  "data": { ... }
}
```

**Gagal (business error / 422):**

```json
{ "status": false, "message": "Nominal penarikan melebihi saldo tersedia (Rp500.000)." }
```

**Validasi gagal (422):**

```json
{
  "status": false,
  "message": "Validasi gagal",
  "errors": {
    "jumlah": ["Nominal penarikan minimal Rp 10.000."]
  }
}
```

| Kode | Arti |
|---|---|
| 200 / 201 | Sukses |
| 401 | Tidak terautentikasi (token invalid/kosong) |
| 403 | Aksi tidak diizinkan pada status transaksi saat ini |
| 404 | Data tidak ditemukan / bukan milik user |
| 422 | Validasi gagal atau business rule menolak |
| 500 | Kesalahan server |

---

## 3. Penarikan Simpanan

### 3.1 Daftar Rekening Sumber

```
GET /api/penarikan/rekening-options
```

Response `200`:

```json
{
  "status": true,
  "message": "Data rekening tabungan berhasil diambil",
  "data": [
    {
      "id": 12,
      "no_tabungan": "00123-01",
      "nama_produk": "Simpanan Harian",
      "saldo_akhir": 500000
    }
  ]
}
```

### 3.2 Ajukan Penarikan

```
POST /api/penarikan
Content-Type: multipart/form-data
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id_tabungan` | integer | ya | ID dari `rekening-options` |
| `jumlah` | integer | ya | Nominal penarikan (Rp). Min 10.000, maks 100.000.000 (dari config `penarikan`) |
| `bank` | string | ya | Salah satu: `BRI`, `BNI`, `BCA`, `MANDIRI`, `BSI`, `BTPN`, `LAINNYA` |
| `nama_bank` | string | ya | Contoh: `BRI Unit Kota` |
| `nama_nasabah` | string | ya | Nama sesuai rekening bank tujuan |
| `referensi_penarikan` | string | tidak | Maks 100 karakter |
| `bukti_penarikan` | file | tidak | JPG/PNG/PDF, maks 4 MB |
| `catatan_pengguna` | string | tidak | Maks 1000 karakter |

Nominal preset UI web (boleh dipakai sebagai quick-pick di mobile): `10000, 25000, 50000, 100000, 250000, 500000` + nominal kustom.

Response sukses `201`:

```json
{
  "status": true,
  "message": "Permohonan penarikan berhasil diajukan dan menunggu verifikasi.",
  "data": {
    "id": 45,
    "nomor_penarikan": "PNK-20260807-123456",
    "jenis_simpanan": "Simpanan Harian",
    "jumlah": 100000,
    "bank": "BRI",
    "nama_bank": "BRI Unit Kota",
    "nama_nasabah": "Nasabah Uji",
    "referensi_penarikan": "REF-API-123",
    "catatan_pengguna": "Catatan API",
    "status": "menunggu_verifikasi",
    "status_label": "MENUNGGU VERIFIKASI",
    "catatan_verifikasi": null,
    "alasan_penolakan": null,
    "referensi_transfer": null,
    "waktu_transfer": null,
    "dikirim_at": "2026-08-07T10:00:00+00:00",
    "disetujui_at": null,
    "ditolak_at": null,
    "selesai_at": null,
    "no_tabungan": "00123-01",
    "created_at": "2026-08-07T10:00:00+00:00"
  }
}
```

Contoh penolakan business rule (`422`): saldo kurang, rekening tidak aktif, masih ada transaksi penarikan aktif untuk rekening tersebut, nominal di luar batas.

### 3.3 Penarikan Aktif

```
GET /api/penarikan/aktif
```

Mengembalikan 1 penarikan dengan status `menunggu_verifikasi`, `sedang_diperiksa`, `perlu_revisi`, atau `disetujui` (atau `data: null`).

### 3.4 Riwayat Penarikan

```
GET /api/penarikan/history
```

Mengembalikan array objek penarikan (urutan terbaru dulu), format sama seperti 3.2.

### 3.5 Detail Penarikan

```
GET /api/penarikan/{id}
```

`404` jika tidak ditemukan atau milik user lain.

### 3.6 Kirim Revisi Penarikan

```
POST /api/penarikan/{id}/revisi
Content-Type: multipart/form-data
```

Hanya bisa saat status penarikan `perlu_revisi` (tampilkan `catatan_verifikasi` dari admin kepada user).

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `referensi_penarikan` | string | tidak | Maks 100 karakter |
| `bukti_penarikan` | file | tidak | JPG/PNG/PDF, maks 4 MB |
| `catatan_pengguna` | string | tidak | Maks 1000 karakter |

Response sukses `200`: objek penarikan dengan `status` kembali ke `menunggu_verifikasi`.

### 3.7 Batalkan Penarikan

```
POST /api/penarikan/{id}/batalkan
Content-Type: application/json
```

Request tidak memerlukan body. Penarikan hanya dapat dibatalkan oleh pemilik transaksi ketika status masih `menunggu_verifikasi`. Setelah dibatalkan:

- Status berubah menjadi `dibatalkan`.
- Penarikan tidak lagi dikembalikan oleh `GET /api/penarikan/aktif`.
- Penarikan tetap tersedia pada `GET /api/penarikan/history` sebagai riwayat.
- User dapat membuat pengajuan penarikan baru.

Response sukses `200`:

```json
{
  "status": true,
  "message": "Penarikan berhasil dibatalkan.",
  "data": {
    "id": 45,
    "nomor_penarikan": "PNK-20260807-123456",
    "jenis_simpanan": "Simpanan Harian",
    "jumlah": 100000,
    "bank": "BRI",
    "nama_bank": "BRI Unit Kota",
    "nama_nasabah": "Nasabah Uji",
    "status": "dibatalkan",
    "status_label": "DIBATALKAN",
    "no_tabungan": "00123-01",
    "created_at": "2026-08-07T10:00:00+00:00"
  }
}
```

Kemungkinan response gagal:

- `401`: token tidak valid atau tidak dikirim.
- `403`: penarikan sudah diproses atau statusnya bukan `menunggu_verifikasi`.
- `404`: ID tidak ditemukan atau transaksi bukan milik user yang login.
- `422`: status berubah ketika proses pembatalan berlangsung.

### 3.8 Status Penarikan

| Nilai | Keterangan |
|---|---|
| `menunggu_verifikasi` | Baru diajukan / revisi dikirim, menunggu admin |
| `sedang_diperiksa` | Admin sedang mereview |
| `perlu_revisi` | User harus kirim revisi (lihat `catatan_verifikasi`) |
| `disetujui` | Disetujui admin, menunggu posting |
| `selesai` | Dana diproses/diposting ke rekening |
| `ditolak` | Ditolak (lihat `alasan_penolakan`) |
| `dibatalkan` | Dibatalkan |

---

## 4. Setoran Simpanan (QRIS / Transfer Rekening)

Flow: pilih metode pembayaran → tampilkan QRIS atau rekening tujuan → user membayar → kirim klaim pembayaran → verifikasi admin → dana masuk ke tabungan.

### 4.1 Daftar Rekening Tujuan

```
GET /api/setoran/rekening-options
```

Format response sama dengan 3.1.

### 4.2 Buat Instruksi Pembayaran Setoran

```
POST /api/setoran
Content-Type: application/json

{
  "id_tabungan": 12,
  "jumlah": 50000,
  "metode_pembayaran": "qris"
}
```

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id_tabungan` | integer | ya | ID dari `rekening-options` |
| `jumlah` | integer | ya | Nominal setoran (Rp). Min 10.000, maks 100.000.000 (dari config `setoran`) |
| `metode_pembayaran` | string | tidak | `qris` atau `transfer_rekening`. Default `qris` jika tidak dikirim |

Response sukses `201`:

```json
{
  "status": true,
  "message": "Instruksi pembayaran berhasil dibuat.",
  "data": {
    "id": 77,
    "nomor_setoran": "STR-20260807-654321",
    "jenis_simpanan": "Simpanan Harian",
    "jumlah": 50000,
    "kode_unik": 12,
    "jumlah_bayar": 50012,
    "metode_pembayaran": "qris",
    "metode_pembayaran_label": "QRIS",
    "rekening_transfer": null,
    "qris_payload": "000201010212...",
    "qris_image_url": "https://app.example.com/storage/qris-generated/qris-dynamic-20260807.png",
    "qris_dibuat_at": "2026-08-07T10:00:00+00:00",
    "kedaluwarsa_at": "2026-08-07T10:30:00+00:00",
    "status": "menunggu_pembayaran",
    "status_label": "MENUNGGU PEMBAYARAN",
    "waktu_klaim_bayar": null,
    "nama_pembayar": null,
    "referensi_pembayaran": null,
    "catatan_pengguna": null,
    "catatan_verifikasi": null,
    "alasan_penolakan": null,
    "dikirim_at": null,
    "disetujui_at": null,
    "ditolak_at": null,
    "selesai_at": null,
    "no_tabungan": "00123-01",
    "created_at": "2026-08-07T10:00:00+00:00"
  }
}
```

Catatan penting untuk UI:

- **`jumlah_bayar`** = `jumlah` + `kode_unik` — inilah nominal yang harus dibayar user (tampilkan dengan jelas, termasuk kode unik).
- **`metode_pembayaran`** — gunakan sebagai sumber kebenaran untuk percabangan UI.
- **`qris_image_url`** — hanya digunakan untuk metode `qris`. Jika `null` tetapi payload tersedia, aplikasi dapat merender `qris_payload` memakai library QR generator.
- **`rekening_transfer`** — hanya berisi detail rekening untuk `transfer_rekening`; bernilai `null` untuk QRIS.
- **`kedaluwarsa_at`** — buat countdown untuk kedua metode; instruksi pembayaran default berlaku 30 menit.
- Penolakan umum (`422`): masih ada setoran aktif. Khusus QRIS, request dapat ditolak jika QRIS statis tidak tersedia.

### 4.3 Setoran Aktif

```
GET /api/setoran/aktif
```

Mengembalikan 1 setoran dengan status `menunggu_pembayaran`, `menunggu_verifikasi`, `sedang_diperiksa`, `perlu_revisi`, atau `disetujui` (atau `data: null`).

### 4.4 Riwayat Setoran

```
GET /api/setoran/history
```

Array objek setoran (urutan terbaru dulu), format sama seperti 4.2.

### 4.5 Detail Setoran

```
GET /api/setoran/{id}
```

`404` jika tidak ditemukan atau milik user lain.

### 4.6 Klaim Pembayaran

```
POST /api/setoran/{id}/klaim
Content-Type: multipart/form-data
```

Dipanggil setelah user membayar, atau saat admin meminta revisi bukti (status `perlu_revisi`).

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `waktu_klaim_bayar` | string datetime | ya | Format `YYYY-MM-DD HH:mm:ss` (waktu user melakukan pembayaran) |
| `nama_pembayar` | string | ya | Nama pengirim sesuai rekening sumber |
| `referensi_pembayaran` | string | tidak | Maks 100 karakter |
| `bukti_pembayaran` | file | tidak | JPG/PNG/PDF, maks 4 MB |
| `catatan_pengguna` | string | tidak | Maks 1000 karakter |

Response sukses `200`: objek setoran dengan `status` menjadi `menunggu_verifikasi`.

### 4.7 Batalkan Setoran

```
POST /api/setoran/{id}/batalkan
Content-Type: application/json
```

Request tidak memerlukan body. Setoran hanya dapat dibatalkan oleh pemilik transaksi ketika status masih `menunggu_pembayaran`. Setelah dibatalkan:

- Status berubah menjadi `dibatalkan`.
- Setoran tidak lagi dikembalikan oleh `GET /api/setoran/aktif`.
- Setoran tetap tersedia pada `GET /api/setoran/history` sebagai riwayat.
- User dapat membuat setoran baru.

Response sukses `200`:

```json
{
  "status": true,
  "message": "Setoran berhasil dibatalkan.",
  "data": {
    "id": 77,
    "nomor_setoran": "STR-20260807-654321",
    "jenis_simpanan": "Simpanan Harian",
    "jumlah": 50000,
    "kode_unik": 12,
    "jumlah_bayar": 50012,
    "metode_pembayaran": "transfer_rekening",
    "metode_pembayaran_label": "Transfer Rekening",
    "rekening_transfer": {
      "bank": "BCA",
      "nomor_rekening": "0889333288",
      "atas_nama": "KOPERASI SINARA ARTHA"
    },
    "status": "dibatalkan",
    "status_label": "DIBATALKAN",
    "no_tabungan": "00123-01",
    "created_at": "2026-08-07T10:00:00+00:00"
  }
}
```

Kemungkinan response gagal:

- `401`: token tidak valid atau tidak dikirim.
- `403`: pembayaran sudah diklaim atau statusnya bukan `menunggu_pembayaran`.
- `404`: ID tidak ditemukan atau transaksi bukan milik user yang login.
- `422`: status berubah ketika proses pembatalan berlangsung.

> Pembatalan tidak dapat menarik kembali payload QRIS atau instruksi rekening yang sudah ditampilkan. Aplikasi harus meminta konfirmasi user bahwa pembayaran belum dilakukan sebelum memanggil endpoint ini.

### 4.8 Status Setoran

| Nilai | Keterangan |
|---|---|
| `menunggu_pembayaran` | Instruksi pembayaran dibuat, belum ada klaim |
| `menunggu_verifikasi` | Klaim dikirim, menunggu admin |
| `sedang_diperiksa` | Admin sedang mereview |
| `perlu_revisi` | User harus kirim ulang klaim (lihat `catatan_verifikasi`) |
| `disetujui` | Disetujui admin, menunggu posting |
| `selesai` | Dana masuk ke tabungan |
| `ditolak` | Ditolak (lihat `alasan_penolakan`) |
| `kedaluwarsa` | Instruksi pembayaran lewat waktu tanpa klaim |
| `dibatalkan` | Dibatalkan |

---

## 5. Update API: Metode Transfer Rekening

Section ini menjadi referensi migrasi aplikasi mobile setelah penambahan metode pembayaran transfer rekening.

### 5.1 Ringkasan Perubahan Kontrak

Tidak ada endpoint baru dan tidak ada perubahan HTTP method. Tujuh endpoint setoran tetap digunakan:

| Method | Endpoint | Perubahan |
|---|---|---|
| `POST` | `/api/setoran` | Menerima field opsional `metode_pembayaran` |
| `GET` | `/api/setoran/aktif` | Objek setoran memuat field metode dan rekening transfer |
| `GET` | `/api/setoran/history` | Setiap objek memuat field metode dan rekening transfer |
| `GET` | `/api/setoran/{id}` | Objek setoran memuat field metode dan rekening transfer |
| `POST` | `/api/setoran/{id}/klaim` | Request tidak berubah; response memuat field baru |
| `POST` | `/api/setoran/{id}/batalkan` | Request tidak berubah; response memuat field baru |
| `GET` | `/api/setoran/rekening-options` | Tidak berubah |

Field baru pada seluruh objek setoran:

| Field | Tipe | Nilai |
|---|---|---|
| `metode_pembayaran` | string | `qris` atau `transfer_rekening` |
| `metode_pembayaran_label` | string | `QRIS` atau `Transfer Rekening` |
| `rekening_transfer` | object \| null | Detail rekening jika transfer; `null` jika QRIS |

Schema `rekening_transfer`:

```json
{
  "bank": "BCA",
  "nomor_rekening": "0889333288",
  "atas_nama": "KOPERASI SINARA ARTHA"
}
```

Nomor rekening harus diperlakukan sebagai **string**, bukan number, agar angka nol di depan tidak hilang. Data rekening harus dibaca dari response API dan tidak di-hardcode di aplikasi mobile agar perubahan konfigurasi server otomatis diterapkan.

### 5.2 Request Transfer Rekening

```http
POST /api/setoran
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

```json
{
  "id_tabungan": 12,
  "jumlah": 50000,
  "metode_pembayaran": "transfer_rekening"
}
```

Response sukses `201`:

```json
{
  "status": true,
  "message": "Instruksi pembayaran berhasil dibuat.",
  "data": {
    "id": 78,
    "nomor_setoran": "STR-20260808-654322",
    "jenis_simpanan": "Simpanan Harian",
    "jumlah": 50000,
    "kode_unik": 17,
    "jumlah_bayar": 50017,
    "metode_pembayaran": "transfer_rekening",
    "metode_pembayaran_label": "Transfer Rekening",
    "rekening_transfer": {
      "bank": "BCA",
      "nomor_rekening": "0889333288",
      "atas_nama": "KOPERASI SINARA ARTHA"
    },
    "qris_payload": null,
    "qris_image_url": null,
    "qris_dibuat_at": null,
    "kedaluwarsa_at": "2026-08-08T10:30:00+00:00",
    "status": "menunggu_pembayaran",
    "status_label": "MENUNGGU PEMBAYARAN",
    "waktu_klaim_bayar": null,
    "nama_pembayar": null,
    "referensi_pembayaran": null,
    "catatan_pengguna": null,
    "catatan_verifikasi": null,
    "alasan_penolakan": null,
    "dikirim_at": null,
    "disetujui_at": null,
    "ditolak_at": null,
    "selesai_at": null,
    "no_tabungan": "00123-01",
    "created_at": "2026-08-08T10:00:00+00:00"
  }
}
```

Untuk transfer rekening:

- Tampilkan `rekening_transfer.bank`, `rekening_transfer.nomor_rekening`, dan `rekening_transfer.atas_nama`.
- Highlight `jumlah_bayar`; nominal ini wajib ditransfer tepat termasuk kode unik.
- Jangan mencoba merender QR karena seluruh field QRIS bernilai `null`.
- Setelah user membayar, gunakan endpoint klaim yang sama: `POST /api/setoran/{id}/klaim`.
- Klaim akan masuk ke dashboard admin dan memicu notifikasi WhatsApp admin seperti klaim QRIS.

### 5.3 Validasi dan Kompatibilitas

- `metode_pembayaran` bersifat opsional agar mobile versi lama tetap berfungsi.
- Request tanpa `metode_pembayaran` diproses sebagai `qris`.
- Nilai selain `qris` atau `transfer_rekening` menghasilkan `422` dengan error pada field `metode_pembayaran`.
- Transfer rekening tidak bergantung pada ketersediaan QRIS statis.
- Status, endpoint klaim, upload bukti, revisi, pembatalan, dan proses verifikasi admin tidak berubah.

Contoh validasi gagal:

```json
{
  "status": false,
  "message": "Validasi gagal",
  "errors": {
    "metode_pembayaran": ["Metode pembayaran tidak valid."]
  }
}
```

### 5.4 TypeScript Contract untuk React Native

```typescript
type MetodePembayaranSetoran = 'qris' | 'transfer_rekening';

type RekeningTransfer = {
  bank: string;
  nomor_rekening: string;
  atas_nama: string;
};

type Setoran = {
  id: number;
  nomor_setoran: string;
  jenis_simpanan: string;
  jumlah: number;
  kode_unik: number;
  jumlah_bayar: number;
  metode_pembayaran: MetodePembayaranSetoran;
  metode_pembayaran_label: string;
  rekening_transfer: RekeningTransfer | null;
  qris_payload: string | null;
  qris_image_url: string | null;
  qris_dibuat_at: string | null;
  kedaluwarsa_at: string | null;
  status: string;
  status_label: string;
  waktu_klaim_bayar: string | null;
  nama_pembayar: string | null;
  referensi_pembayaran: string | null;
  catatan_pengguna: string | null;
  catatan_verifikasi: string | null;
  alasan_penolakan: string | null;
  dikirim_at: string | null;
  disetujui_at: string | null;
  ditolak_at: string | null;
  selesai_at: string | null;
  no_tabungan: string | null;
  created_at: string | null;
};

type SetoranResponse = {
  status: true;
  message: string;
  data: Setoran;
};
```

Contoh membuat setoran:

```typescript
async function buatSetoran(
  idTabungan: number,
  jumlah: number,
  metodePembayaran: MetodePembayaranSetoran,
) {
  return api<SetoranResponse>('/setoran', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      id_tabungan: idTabungan,
      jumlah,
      metode_pembayaran: metodePembayaran,
    }),
  });
}
```

Contoh percabangan UI:

```tsx
import {Image, Text, View} from 'react-native';

function InstruksiPembayaran({setoran}: {setoran: Setoran}) {
  if (setoran.metode_pembayaran === 'transfer_rekening') {
    if (!setoran.rekening_transfer) {
      return <Text>Informasi rekening tidak tersedia.</Text>;
    }

    return (
      <View>
        <Text>Bank: {setoran.rekening_transfer.bank}</Text>
        <Text>No. Rekening: {setoran.rekening_transfer.nomor_rekening}</Text>
        <Text>Atas Nama: {setoran.rekening_transfer.atas_nama}</Text>
        <Text>Total Transfer: Rp{setoran.jumlah_bayar.toLocaleString('id-ID')}</Text>
      </View>
    );
  }

  if (setoran.qris_image_url) {
    return (
      <Image
        source={{uri: setoran.qris_image_url}}
        style={{width: 280, height: 280}}
      />
    );
  }

  return <Text>QRIS tidak tersedia.</Text>;
}
```

---

## 6. Contoh Integrasi React Native

### 6.1 API client sederhana

```typescript
const API_URL = 'https://app.example.com/api';

let authToken: string | null = null; // simpan aman, mis. react-native-keychain

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    // arahkan user ke halaman login
    throw new Error('Unauthenticated');
  }

  const body = await res.json();
  if (!res.ok || body.status === false) {
    const err = new Error(body.message || 'Terjadi kesalahan') as Error & {
      code: number;
      errors?: Record<string, string[]>;
    };
    err.code = res.status;
    err.errors = body.errors;
    throw err;
  }
  return body as T;
}
```

### 6.2 Buat Setoran QRIS

```typescript
const res = await api<SetoranResponse>('/setoran', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_tabungan: 12,
    jumlah: 50000,
    metode_pembayaran: 'qris',
  }),
});

if (res.data.qris_image_url) {
  // tampilkan gambar QRIS
  <Image source={{uri: res.data.qris_image_url}} style={{width: 280, height: 280}} />;
}
```

### 6.3 Ajukan penarikan dengan upload bukti

```typescript
const formData = new FormData();
formData.append('id_tabungan', '12');
formData.append('jumlah', '100000');
formData.append('bank', 'BRI');
formData.append('nama_bank', 'BRI Unit Kota');
formData.append('nama_nasabah', 'Nasabah Uji');

if (file) {
  // file dari react-native-image-picker / expo-image-picker
  formData.append('bukti_penarikan', {
    uri: file.uri,
    name: file.fileName ?? 'bukti.jpg',
    type: file.type ?? 'image/jpeg',
  });
}

const res = await api('/penarikan', {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: formData,
});
```

### 6.4 Klaim pembayaran setoran

```typescript
const formData = new FormData();
formData.append('waktu_klaim_bayar', '2026-08-07 10:25:00');
formData.append('nama_pembayar', 'Nama Pengirim');
formData.append('referensi_pembayaran', 'REF-123456');
if (file) {
  formData.append('bukti_pembayaran', {
    uri: file.uri,
    name: file.fileName ?? 'bukti.jpg',
    type: file.type ?? 'image/jpeg',
  });
}

const res = await api(`/setoran/${setoranId}/klaim`, {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: formData,
});
```

### 6.5 Batalkan setoran atau penarikan

Endpoint pembatalan tidak memerlukan request body:

```typescript
async function batalkanSetoran(setoranId: number) {
  return api<SetoranResponse>(`/setoran/${setoranId}/batalkan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

async function batalkanPenarikan(penarikanId: number) {
  return api(`/penarikan/${penarikanId}/batalkan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}
```

Tampilkan dialog konfirmasi sebelum menjalankan fungsi. Setelah sukses, refresh endpoint `/aktif` dan `/history` agar form pengajuan baru serta status riwayat langsung diperbarui.

---

## 7. Panduan Flow UI

### Penarikan Simpanan

1. `GET /penarikan/rekening-options` → isi dropdown rekening.
2. User pilih nominal (preset/kustom) + isi data bank → `POST /penarikan`.
3. Jika ada `GET /penarikan/aktif`, tampilkan kartu status dan sembunyikan form (sama seperti web: hanya 1 penarikan aktif per rekening).
4. Jika status `menunggu_verifikasi`, tampilkan tombol "Batalkan Penarikan" dengan dialog konfirmasi → `POST /penarikan/{id}/batalkan`.
5. Jika status aktif `perlu_revisi` → tampilkan `catatan_verifikasi` + form revisi → `POST /penarikan/{id}/revisi`.
6. Setelah pembatalan berhasil, refresh `/penarikan/aktif` dan `/penarikan/history`.
7. Riwayat: `GET /penarikan/history` — tampilkan `status_label`, `alasan_penolakan` / `catatan_verifikasi` sesuai konteks, dan `referensi_transfer` + `waktu_transfer` bila sudah selesai.

### Setoran Simpanan (QRIS / Transfer Rekening)

1. `GET /setoran/rekening-options` → isi dropdown rekening.
2. User pilih nominal dan metode `qris` / `transfer_rekening` → `POST /setoran`.
3. Percabangkan UI berdasarkan `metode_pembayaran`: tampilkan QRIS atau detail `rekening_transfer`.
4. Tampilkan nominal **`jumlah_bayar`** (highlight kode unik) dan countdown menuju `kedaluwarsa_at` untuk kedua metode.
5. Selama status `menunggu_pembayaran`, tampilkan tombol "Batalkan Setoran" dengan konfirmasi bahwa pembayaran belum dilakukan → `POST /setoran/{id}/batalkan`.
6. Tombol "Saya Sudah Bayar" → form klaim → `POST /setoran/{id}/klaim`.
7. Jika setoran aktif berstatus `perlu_revisi` → tampilkan `catatan_verifikasi` dan izinkan kirim ulang klaim ke endpoint yang sama.
8. Setelah pembatalan berhasil, refresh `/setoran/aktif` dan `/setoran/history`.
9. Jika instruksi kedaluwarsa (`kedaluwarsa`), arahkan user membuat setoran baru.

---

## 8. Catatan Teknis

- Semua tanggal memakai format ISO 8601 (`toIso8601String()`), mis. `2026-08-07T10:00:00+00:00`. Parsing dengan `new Date(value)` di JS.
- Nilai nominal selalu integer Rupiah tanpa desimal.
- Field `status_label` siap tampil (`MENUNGGU VERIFIKASI`); `status` (snake_case) untuk logika percabangan UI.
- Maksimal 1 transaksi aktif per rekening untuk masing-masing jenis (penarikan & setoran) — enforce juga di sisi UI dengan mengecek endpoint `/aktif`.
- Gambar QRIS berada di disk publik (`/storage/...`) dan dapat di-cache. Bukti upload disimpan di disk privat server dan tidak dikembalikan sebagai URL.
- Error validasi (`422`) berisi `errors` berbentuk map field → array pesan berbahasa Indonesia; cocok untuk ditampilkan langsung di bawah field form.
- Gunakan `metode_pembayaran` sebagai sumber kebenaran untuk percabangan UI. Jangan mengandalkan field QRIS `null` sebagai penentu metode.
- Nomor rekening transfer adalah string dan harus ditampilkan persis seperti response server.
