# ⚡ QUICK REFERENCE - Login Testing

## 🎯 Dalam 5 Langkah

1. **Buka**: http://localhost:3000
2. **Debug**: Tekan **Ctrl+Shift+D** 
3. **Username**: `admin`
4. **Password**: `admin`
5. **Submit**: Klik "Masuk"

## ✅ Saat Berhasil
```
✓ Toast "Login Berhasil!" muncul
✓ Halaman pindah ke scanner
✓ Debug console show semua logs
✓ localStorage punya 'absensi_admin_session'
```

## ⚙️ Technical Details

| Item | Value |
|------|-------|
| **URL** | http://localhost:3000 |
| **Username** | admin |
| **Password** | admin |
| **Session Key** | absensi_admin_session |
| **Debug Key** | Ctrl+Shift+D |
| **Form ID** | login-form |

## 🐛 Jika Tidak Bisa Login

### Step 1: Buka Debug Console
```
Tekan: Ctrl+Shift+D
Lihat: Logs di bawah layar
```

### Step 2: Cek Logs
Harus lihat:
- ✓ "✅ Login form found"
- ✓ "🔐 Login form submitted"
- ✓ "✅✅✅ CREDENTIALS CORRECT"

### Step 3: Cek Browser Console
```
F12 → Console tab
Cari error messages
```

### Step 4: Check Storage
```
F12 → Application → Local Storage
Cari: absensi_admin_session = active
```

## 🔧 Jika Masih Ada Masalah

### Option 1: Hard Refresh
```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

### Option 2: Clear Storage
```
F12 → Application → Local Storage
Right-click → Clear All
Reload page
```

### Option 3: Check Server
```
Buka: http://localhost:3000/
Harus melihat: {"ok":true, "message":"..."}
Berarti server OK
```

## 📱 Verifikasi Checklist

- [ ] Browser bisa akses http://localhost:3000
- [ ] Debug console bisa dibuka (Ctrl+Shift+D)
- [ ] Form input untuk username ada
- [ ] Form input untuk password ada
- [ ] Tombol "Masuk" bisa diklik
- [ ] Credentials diisi: admin/admin
- [ ] Toast atau error message muncul
- [ ] Debug logs terlihat di console

## 🎊 Success Indicators

**Login Berhasil jika:**
```
1. Toast "Login Berhasil!" tampil
2. Halaman otomatis ke scanner
3. Header menampilkan "Absensi" dengan tombol
4. Camera permission dialog mungkin muncul
5. localStorage punya session active
```

**Debug Console Show:**
```
✅ CREDENTIALS CORRECT - LOGGING IN
Session saved to localStorage: active
✅ Session active - showing main app
Initializing app...
Volunteers rendered successfully
navigating to scanner
```

## 🚀 Produksi Checklist

Sebelum go live:
- [ ] Ubah admin/admin ke credentials sebenarnya
- [ ] Setup server-side validation
- [ ] Enable HTTPS
- [ ] Setup proper auth (JWT/OAuth)
- [ ] Test on mobile devices
- [ ] Test on different browsers

---

**Need Help?**
1. Check debug console (Ctrl+Shift+D)
2. Check browser console (F12)
3. Check server logs
4. Hard refresh (Ctrl+Shift+R)
5. Clear storage & try again

**Server Status**: ✅ Running on http://localhost:3000

