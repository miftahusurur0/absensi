# 🔐 Panduan Testing Login - Absensi Relawan v7.3

## 📋 Setup
- ✅ Server running: http://localhost:3000
- ✅ Debug Console: Tekan **Ctrl+Shift+D** untuk buka
- ✅ Console otomatis menampilkan errors

## 🚀 Langkah Testing Login

### 1. Buka Halaman Login
```
http://localhost:3000
```

### 2. Tekan Ctrl+Shift+D (PENTING!)
- Debug console akan terbuka di bagian bawah layar
- Anda akan melihat semua log debug secara real-time
- Ini sangat penting untuk troubleshooting

### 3. Masukkan Credentials
- **Username**: `admin`
- **Password**: `admin`

### 4. Klik Tombol "Masuk"

### 5. Pantau Debug Console
Anda harus melihat logs seperti ini:

```
📍 Script loaded, setting up login form...
🔧 setupLoginForm() starting...
✅ Login form found, attaching submit listener
✅ Submit listener attached successfully
🚀 FINAL SETUP - Calling checkAuth()
🔍 checkAuth() called
```

## ✅ Saat Login Berhasil
Anda akan melihat:
```
🔐 Login form submitted
📝 Username entered: admin
📝 Password entered: (***HIDDEN***)
✓ Validating credentials...
Checking: username=admin? true
Checking: password=admin? true
Result: isCorrect = true
✅✅✅ CREDENTIALS CORRECT - LOGGING IN
Session saved to localStorage: active
Toast: [success] ✅ Login Berhasil! Mengalihkan...
Form cleared
⏳ Executing redirect...
🔍 checkAuth() called
✅ Session active - showing main app
Initializing app...
```

## ❌ Saat Login Gagal
Anda akan melihat:
```
🔐 Login form submitted
📝 Username entered: (whatever you typed)
📝 Password entered: (***HIDDEN***)
❌ CREDENTIALS WRONG
Toast: [error] ❌ Username atau Password salah
```

## 🐛 Troubleshooting

### 1. Form tidak submit
- Buka Ctrl+Shift+D
- Cek apakah ada error di debug console
- Klik button "Masuk" - lihat apa yang muncul di console

### 2. Login berhasil tapi halaman tidak berubah
- Cek di console apakah ada error saat checkAuth()
- Lihat step setelah "✅ Session active - showing main app"
- Lihat apakah ada error saat renderVolunteers()

### 3. Toast tidak muncul
- Buka Ctrl+Shift+D
- Cek apakah ada "Toast:" logs
- Cek apakah ada [error] logs

## 📝 Informasi Penting

### Session Storage
- Disimpan di: `localStorage['absensi_admin_session'] = 'active'`
- Logout akan menghapusnya
- Halaman refresh akan maintain session

### Default Credentials
- Username: `admin`
- Password: `admin`
(Tidak ada validasi ke server, hanya hardcoded check di client)

### Debug Keys
- **Ctrl+Shift+D**: Toggle debug console
- Semua logs ditampilkan dalam console
- Max 50 logs terakhir disimpan

## 🎯 Expected Flow

```
1. Halaman load
2. Script setup login form
3. checkAuth() check session (kosong)
4. Tampilkan login page
5. User klik Masuk
6. handleLoginSubmit dijalankan
7. Credentials checked
8. localStoragesetSession
9. checkAuth() dipanggil
10. Session active ditemukan
11. Main app ditampilkan
12. initApp() dijalankan
13. navigateTo('scanner')
14. Scanner page loaded
```

## 💡 Tips
- Jangan close debug console saat testing
- Buka F12 di browser untuk melihat console browser juga
- Monitor localStorage: buka DevTools > Application > Local Storage
- Check Network tab jika ada API calls

