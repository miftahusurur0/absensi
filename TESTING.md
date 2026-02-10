# 🧪 Testing Guide - Absensi Relawan v7.3

Panduan lengkap untuk testing semua fitur aplikasi.

---

## 📋 Pre-Testing Checklist

- [ ] Supabase project aktif dan tables sudah dibuat (`volunteers` & `history`)
- [ ] Browser modern (Chrome, Firefox, Edge, Safari)
- [ ] Akses kamera di-enable di browser
- [ ] Internet connection stabil
- [ ] `.env` file sudah dikonfigurasi (jika menggunakan server)

---

## 🚀 Cara Membuka Aplikasi

### Metode 1: Direct File (Recommended untuk Development)
```
Buka file d:\absensi\index.html di browser
atau
File > Open > d:\absensi\index.html
```

**Kelebihan:**
- Tidak perlu server khusus
- Akses langsung ke Supabase via client SDK
- Development cepat

**Catatan:** Browser harus allow webcam access di localhost atau file protocol.

### Metode 2: Via Express Server (Optional)
```bash
cd d:\absensi
npm start
# Buka: http://localhost:3000
```

---

## 🔐 Test 1: Login

### Step 1.1 - Check Login Form
1. Buka `index.html`
2. Lihat form login dengan 2 field:
   - ✓ Username input
   - ✓ Password input
   - ✓ "Masuk" button

### Step 1.2 - Test Invalid Login
1. Input username: `invalid`
2. Input password: `invalid`
3. Click "Masuk"
4. **Expected:** ✓ Toast error: "Username/Password salah"
5. **Expected:** ✓ Tidak masuk ke main app

### Step 1.3 - Test Valid Login
1. Input username: `admin`
2. Input password: `admin`
3. Click "Masuk"
4. **Expected:** ✓ Toast success: "Login Berhasil"
5. **Expected:** ✓ Tampil main app dengan header "Absensi" dan tombol navigasi
6. **Expected:** ✓ Otomatis ke view Scanner (tampil kamera)

---

## 📱 Test 2: Scanner QR Code

### Step 2.1 - Allow Camera Access
1. Browser akan ask permission untuk akses kamera
2. Click "Allow" / "Izinkan"
3. **Expected:** ✓ Kamera preview tampil di `#reader` div

### Step 2.2 - Test QR Code Scanning
**Preparation:**
1. Generate sebuah QR code terlebih dahulu:
   - Buka online QR generator (e.g., https://www.qr-code-generator.com/)
   - Input text: `STA41001` (atau ID volunteer yang ada)
   - Generate QR code

2. Atau gunakan ID dari database jika sudah ada

**Test Scan Masuk (pertama kali):**
1. Arahkan QR code ke kamera
2. **Expected:** ✓ Toast success: "Absen Masuk: [Nama]"
3. **Expected:** ✓ History table (Riwayat) terupdate dengan status="Masuk"
4. **Expected:** ✓ Scanner pause 2 detik untuk prevent double-scan

**Test Scan Pulang (scan kedua):**
1. Tunggu 2 detik, scanner resume
2. Scan QR yang sama
3. **Expected:** ✓ Toast success: "Absen Pulang: [Nama]"
4. **Expected:** ✓ Status berubah menjadi "Pulang"

**Test Cooldown (Optional):**
1. Scan QR lagi dalam 5 menit
2. **Expected:** ✓ Cooldown error: "Cooldown: Tunggu X menit"

**Test Invalid ID:**
1. Scan QR dengan ID yang tidak ada (e.g., `INVALID123`)
2. **Expected:** ✓ Toast error: "ID INVALID123 tidak ditemukan"

---

## 👥 Test 3: Volunteer Management

### Step 3.1 - Navigate to Volunteers
1. Click tab "Relawan" di header
2. **Expected:** ✓ Tabel volunteer kosong (atau berisi data jika sudah ada)

### Step 3.2 - Add New Volunteer
1. Click "Tambah" button
2. **Expected:** ✓ Modal "Tambah Relawan" muncul
3. Fill form:
   - **Nama:** "Ahmad Ridho"
   - **Jabatan:** "Staff"
   - **No Loker:** "201"
   - **Foto:** (upload photo atau kosongkan)
4. Click "Simpan"
5. **Expected:** ✓ Toast success: "Relawan berhasil ditambahkan"
6. **Expected:** ✓ Modal tertutup
7. **Expected:** ✓ Nama muncul di tabel (dengan generated ID)

### Step 3.3 - Edit Volunteer
1. Click icon edit (pensil) di tabel
2. **Expected:** ✓ Modal "Edit Relawan" muncul dengan data terisi
3. Change name: "Ahmad Ridho Santoso"
4. Click "Simpan"
5. **Expected:** ✓ Toast success: "Data relawan diperbarui"
6. **Expected:** ✓ Tabel terupdate

### Step 3.4 - Delete Volunteer
1. Click icon delete (trash) di tabel
2. **Expected:** ✓ Confirm dialog: "Hapus data ini?"
3. Click "OK"
4. **Expected:** ✓ Toast success: "Dihapus"
5. **Expected:** ✓ Data hilang dari tabel

### Step 3.5 - Test Duplicate Locker
1. Add volunteer dengan locker "201"
2. Try add another dengan locker "201"
3. Click "Simpan"
4. **Expected:** ✓ Toast error: "Nomor Loker 201 sudah digunakan!"

### Step 3.6 - Test Photo Upload
1. Add volunteer
2. Click "Pilih Foto" / upload image
3. **Expected:** ✓ Preview foto muncul (circular thumbnail)
4. **Expected:** ✓ Photo disave sebagai Base64

---

## 📊 Test 4: History & Riwayat Absensi

### Step 4.1 - View History
1. Click tab "Riwayat" di header
2. **Expected:** ✓ Tabel berisi scan history dengan kolom: Waktu, ID, Nama, Jabatan, Status
3. **Expected:** ✓ Data sorted terbaru di atas
4. **Expected:** ✓ Status "Masuk" warna hijau, "Pulang" warna merah

### Step 4.2 - Export to Excel
1. Cari button "Export" / Excel icon di Riwayat
2. Click button
3. **Expected:** ✓ File "History_Absensi.xlsx" terdownload
4. **Expected:** ✓ Buka dengan Excel/Sheets, data lengkap (Waktu, ID, Nama, Jabatan, Loker, Status)

---

## 🎫 Test 5: ID Card Generation

### Step 5.1 - Generate Cards
1. Click tab "Kartu" di header
2. **Expected:** ✓ Loading message muncul
3. **Expected:** ✓ Setiap volunteer muncul dengan preview kartu
4. **Expected:** ✓ Kartu berisi: foto, nama, ID, loker, QR code

### Step 5.2 - Download Card
1. Click pada card preview
2. **Expected:** ✓ Modal "Pratinjau Cetak" muncul
3. **Expected:** ✓ Card image ditampilkan
4. **Expected:** ✓ Button "Download" ada
5. Click "Download"
6. **Expected:** ✓ File "IDCard-[ID].png" terdownload

---

## 💾 Test 6: Backup & Restore Database

### Step 6.1 - Full Backup
1. Click tab "DB" (Database)
2. Click button "Backup (.json)"
3. **Expected:** ✓ File "backup_absensi_[TANGGAL].json" terdownload
4. **Expected:** ✓ Toast success: "Backup berhasil didownload"

### Step 6.2 - Check Backup Content (Optional)
1. Open file JSON dengan text editor
2. **Expected:** ✓ Struktur: `{ version, timestamp, volunteers: [], history: [] }`
3. **Expected:** ✓ All data terimpor dalam JSON

### Step 6.3 - Restore from Backup
1. Add beberapa volunteer baru
2. Note jumlah volunteer sekarang
3. Click "Restore" button
4. Select backup JSON file sebelumnya
5. **Expected:** ✓ Confirm dialog: "Data akan ditimpa. Lanjutkan?"
6. Click "OK"
7. **Expected:** ✓ Toast success: "Database direstore!"
8. **Expected:** ✓ Data kembali ke state sewaktu backup

---

## 📈 Test 7: Excel Import/Export Volunteers

### Step 7.1 - Export Volunteers
1. Click tab "Relawan"
2. Click button "Export" (Excel icon)
3. **Expected:** ✓ File "Data_Relawan.xlsx" terdownload
4. **Expected:** ✓ Kolom: ID, Nama, Jabatan, Loker

### Step 7.2 - Download Template
1. Click "Download Template"
2. **Expected:** ✓ File "Template.xlsx" terdownload
3. **Expected:** ✓ Berisi sample: Nama, Jabatan, Loker

### Step 7.3 - Prepare Import File
1. Edit "Template.xlsx" atau "Data_Relawan.xlsx"
2. Add/modify rows:
   ```
   | Nama              | Jabatan | Loker |
   |-------------------|---------|-------|
   | Budi Santoso      | Manager | 301   |
   | Citra Indonesia   | Staff   | 302   |
   ```
3. Save as .xlsx

### Step 7.4 - Import File
1. Click "Import" button (upload icon)
2. Select modified Excel file
3. **Expected:** ✓ File explorer dialog muncul
4. Choose file & Click "Buka"
5. **Expected:** ✓ Toast success: "X data diimport"
6. **Expected:** ✓ Volunteer list updated dengan data baru
7. **Expected:** ✓ ID otomatis generate untuk setiap

---

## 🔍 Test 8: QR Code Display

### Step 8.1 - View QR Modal
1. Go to "Relawan" tab
2. Click QR icon (next to volunteer name)
3. **Expected:** ✓ Modal "QR Code" muncul
4. **Expected:** ✓ QR code gambar ditampilkan
5. **Expected:** ✓ Nama dan ID di bawah QR ditampilkan
6. Click "Tutup"
7. **Expected:** ✓ Modal tertutup

---

## 🖥️ Test 9: Multi-View Navigation

### Step 9.1 - Tab Switching
1. Click semua tab berturut-turut:
   - "Scan" → Scanner view
   - "Riwayat" → History table
   - "Relawan" → Volunteer table
   - "Kartu" → Card grid
   - "DB" → Database management
2. **Expected:** ✓ View berubah dengan smooth
3. **Expected:** ✓ Data terupdate setiap kali view berubah

### Step 9.2 - Logout
1. Click red "Exit" button (icon tutup/logout)
2. **Expected:** ✓ Confirm dialog: "Keluar?"
3. Click "OK"
4. **Expected:** ✓ Page reload
5. **Expected:** ✓ Kembali ke login form
6. **Expected:** ✓ Session localStorage dihapus

---

## 🐛 Test 10: Error Handling & Edge Cases

### Step 10.1 - Network Error Simulation
1. (Optional) Turn off internet
2. Try to scan/add volunteer
3. **Expected:** ✓ Toast error muncul dengan pesan error dari Supabase

### Step 10.2 - Empty Form Submit
1. Navigate to "Relawan"
2. Click "Tambah"
3. Click "Simpan" tanpa mengisi data
4. **Expected:** ✓ Browser validation: "Nama Lengkap harus diisi"

### Step 10.3 - Duplicate Scan Prevention
1. Scan QR code yang sama 2x berturut-turut cepat
2. **Expected:** ✓ Scan kedua diabaikan (pause scanner 2 detik)

### Step 10.4 - Base64 Image Compression
1. Upload large photo (10MB+)
2. **Expected:** ✓ Image di-convert ke Base64 dan disave
3. **Expected:** ✓ Not freeze browser (asynchronous)

---

## ✅ Test Checklist

Print checklist ini atau gunakan untuk tracking:

```
Login & Auth:
  [ ] Invalid login error ✓
  [ ] Valid login works ✓
  [ ] Logout works ✓

Scanner:
  [ ] Kamera accessible ✓
  [ ] Scan detect Masuk ✓
  [ ] Scan detect Pulang ✓
  [ ] Cooldown works ✓
  [ ] Invalid ID error ✓

Volunteer Mgmt:
  [ ] Add volunteer ✓
  [ ] Edit volunteer ✓
  [ ] Delete volunteer ✓
  [ ] Duplicate locker check ✓
  [ ] Photo upload ✓
  [ ] Generate from Excel ✓

History & Export:
  [ ] History visible ✓
  [ ] Export to Excel ✓
  [ ] Data format correct ✓

Cards:
  [ ] Generate cards ✓
  [ ] Download card ✓
  [ ] QR code visible ✓

Database:
  [ ] Backup JSON ✓
  [ ] Restore JSON ✓
  [ ] Data integrity ✓

Navigation:
  [ ] Tab switching smooth ✓
  [ ] Data persist ✓
  [ ] Logout clear session ✓

Error Handling:
  [ ] Network errors ✓
  [ ] Form validation ✓
  [ ] Edge cases ✓
```

---

## 🚀 Performance Expectations

| Feature | Expected Time |
|---------|---|
| Page load | < 3s |
| Add volunteer | < 1s (with Supabase) |
| Scan detect | < 500ms |
| Export Excel (100 rows) | < 2s |
| Generate 20 cards | < 5s |
| Backup download | < 1s |

---

## 📞 Troubleshooting During Testing

### Issue: Kamera tidak muncul
**Solution:**
- Refresh page
- Check browser camera permission (Settings > Site settings)
- Use HTTPS atau localhost (tidak bisa di domain HTTP)
- Use modern browser (Chrome, Firefox, Edge)

### Issue: Supabase connection error
**Solution:**
- Check `.env` file untuk SUPABASE_URL & KEY
- Verify table exists di Supabase Dashboard
- Check RLS policies (should allow public read/write untuk development)

### Issue: Excel import not working
**Solution:**
- Verify column names: "Nama", "Jabatan", "Loker"
- Use template provided di app
- Check Excel format (.xlsx bukan .csv)

### Issue: QR generate error
**Solution:**
- Check browser console (F12) untuk error details
- May need internet (QR library CDN)
- Try refresh page

### Issue: Data tidak muncul
**Solution:**
- Check browser localStorage (F12 > Application > Storage)
- Verify Supabase credentials correct
- Check Supabase table actually contains data

---

## 📝 Test Report Template

Buat file `TEST_REPORT_[DATE].md`:

```markdown
# Test Report - [DATE]

## Environment
- Browser: [Chrome/Firefox]
- OS: [Windows/Mac/Linux]
- Supabase: [Connected/Failed]

## Results Summary
- Total Tests: X
- Passed: Y
- Failed: Z

## Detailed Results

### Login
- [PASS/FAIL] Valid login
- [PASS/FAIL] Invalid login error

### Scanner
- [PASS/FAIL] QR scan detect

... [continue for all tests]

## Issues Found
1. [Issue description]
   - Steps: ...
   - Expected: ...
   - Actual: ...

## Notes
[Any additional observations]

## Signature
Tester: ___________
Date: ___________
```

---

## 🎯 Sign Off

Setelah semua tests PASS, aplikasi siap untuk:
✅ Production deployment
✅ Mobile PWA installation
✅ Multi-user access (dengan proper RLS/auth)
✅ Real-time data sync

---

**Last Updated:** Feb 10, 2026
**Version:** 7.3
**Status:** Ready for Testing ✅
