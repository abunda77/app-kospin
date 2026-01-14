# Troubleshooting: Aplikasi Stuck di Splash Screen

## Masalah
Aplikasi terjebak di splash screen pada Expo Go tanpa menampilkan error di terminal.

## Kemungkinan Penyebab

### 1. **Font Loading Issue**
   - Font `SpaceMono` gagal dimuat
   - useFonts hook tidak mengembalikan error dengan benar

### 2. **AsyncStorage Issue** 
   - Operasi AsyncStorage di TabLayout mungkin gagal
   - Tidak ada error handling yang memadai

### 3. **React Navigation/Router Issue**
   - Kompatibilitas dengan SDK 54
   - Layout routing tidak ter-render dengan benar

### 4. **JavaScript Bundle Issue**
   - Bundle gagal dimuat pada device
   - Cache issue di Metro bundler

## Solusi yang Sudah Diterapkan

### ✅ Penambahan Error Logging di `_layout.tsx`

Saya telah menambahkan console.log di beberapa tempat kritis:

```typescript
// Root Layout (_layout.tsx)
- Logging saat fonts loaded/error
- Error boundary untuk menampilkan error jika ada
- Timeout handling untuk splash screen

// Tab Layout ((tabs)/_layout.tsx)
- Logging saat TabLayout mounted
- Logging saat checking login status
- Logging saat TabLayout ready
```

## Langkah Debugging

### 1. **Cek Console Logs**
Setelah reload aplikasi di Expo Go, periksa terminal untuk log berikut:
```
RootLayout mounted
Fonts loaded: true/false
Font error: null/error
Starting app preparation...
Fonts ready, hiding splash screen
App ready!
TabLayout mounted
Checking login status...
Token found: true/false
TabLayout ready
Rendering main app layout
```

### 2. **Jika Tidak Ada Log Sama Sekali**
Artinya JavaScript bundle tidak ter-load. Kemungkinan penyebab:
- Metro bundler issue
- Network connectivity issue
- Expo Go cache issue

**Solusi:**
```bash
# Stop server dengan Ctrl+C
# Lalu jalankan:
npx expo start --clear --reset-cache
```

### 3. **Jika Log Berhenti di "RootLayout mounted"**
Kemungkinan masalah dengan font loading.

**Solusi:**
- Coba hapus font loading sementara (lihat "Solusi Sementara" di bawah)

### 4. **Jika Log Berhenti di "TabLayout mounted"**
Kemungkinan masalah dengan AsyncStorage.

**Solusi:**
- Cek apakah AsyncStorage ter-install dengan benar
- Restart Expo Go app
- Clear app data di settings device

## Solusi Sementara: Disable Font Loading

Jika masalah tetap ada, coba disable font loading sementara:

```typescript
// Dalam _layout.tsx, comment out font loading:
const [loaded, fontError] = useFonts({
  // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
});

// Atau langsung set loaded = true:
// const loaded = true;
// const fontError = null;
```

## Solusi Alternatif: Restart Complete

1. **Stop Expo Server** (Ctrl+C di terminal)

2. **Clear Metro Cache:**
   ```bash
   npx expo start --clear
   ```

3. **Clear Expo Go Cache:**
   - Android: Settings → Apps → Expo Go → Storage → Clear Cache
   - iOS: Uninstall dan install ulang Expo Go

4. **Clear npm cache (jika perlu):**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```

## Checklist Debugging

- [ ] Periksa logs di terminal setelah scan QR code
- [ ] Pastikan Metro bundler tidak ada error "Cannot find module..."
- [ ] Coba reload app di Expo Go (shake device → Reload)
- [ ] Coba clear cache Expo Go di device
- [ ] Coba restart Metro bundler dengan --clear flag
- [ ] Cek apakah ada route yang tidak ditemukan (404)
- [ ] Pastikan semua file route ada (index.tsx, dashboard.tsx, dll)

## Logs yang Harus Muncul (Normal Flow)

```
Starting Metro Bundler
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
[QR Code]
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

› Metro waiting on exp://192.168.100.247:8081

[Setelah scan QR code:]
RootLayout mounted
Fonts loaded: true
Font error: null
Starting app preparation...
Fonts ready, hiding splash screen
App ready!
Rendering main app layout
TabLayout mounted
Checking login status...
Token found: false
TabLayout ready
```

## Next Steps

1. **Restart Expo server** dengan clear cache
2. **Scan QR code** di Expo Go
3. **Perhatikan logs** di terminal
4. **Screenshot logs** jika ada error dan bagikan ke saya

## Catatan Penting

- SDK 54 memiliki beberapa breaking changes dari SDK 53
- Pastikan menggunakan Expo Go versi terbaru (SDK 54)
- Jika masalah berlanjut, mungkin perlu rebuild development client
