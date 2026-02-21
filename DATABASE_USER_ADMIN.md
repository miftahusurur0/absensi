# Database User & Admin Management

## Fitur Baru ✨

Aplikasi Absensi Relawan sekarang memiliki sistem user/admin dengan database management yang lengkap.

---

## 📝 Default Admin Account

### Akun Login Default (Otomatis Dibuat)
- **Username**: `admin`
- **Password**: `admin`
- **Role**: `admin`
- **Status**: Aktif

> 💡 **Info**: Akun admin default ini akan dibuat **otomatis** saat pertama kali aplikasi dijalankan jika belum ada dalam database.

---

## 🔐 Cara Login

1. Buka halaman login aplikasi
2. Masukkan **Username**: `admin`
3. Masukkan **Password**: `admin`
4. Klik tombol **"Masuk"**

### Feedback Login
Jika ada kesalahan login, sistem akan menampilkan pesan yang jelas:
- ✅ "Username dan Password tidak benar" - untuk password salah
- ✅ "Username tidak ditemukan dalam database" - untuk username yang tidak terdaftar
- ✅ "Username tidak boleh kosong" - untuk field kosong
- ✅ "Password tidak boleh kosong" - untuk field kosong

---

## 👥 Manajemen User Admin

Setelah login, Anda dapat mengelola user admin melalui Menu **Database** > **Manajemen User Admin**

### Fitur yang Tersedia:
- **Tambah User** - Menambahkan user admin baru
  - Username (unique)
  - Password (aman)
  - Role (admin/user)
  
- **Lihat Daftar User** - Menampilkan semua user yang terdaftar
  - Username
  - Role
  - Status (Aktif/Nonaktif)
  - Tanggal dibuat
  
- **Hapus User** - Menghapus user (kecuali admin default)
  - Proteksi khusus untuk user `admin` default

---

## 💾 Database Storage

### Lokasi Penyimpanan
Data user disimpan di **dua tempat** untuk keamanan maksimal:

1. **localStorage** (Web Browser)
   - Disimpan secara lokal di browser
   - Tetap ada meski offline
   - Tidak bisa diakses dari browser lain

2. **Supabase (Cloud Database)** - *Opsional*
   - Jika tersedia, data akan di-sync ke cloud
   - Bisa diakses dari mana saja
   - Fallback ke localStorage jika tidak tersedia

### Fallback System
- ✅ Jika Supabase tidak tersedia → Otomatis gunakan localStorage
- ✅ Semua data tetap aman disimpan di perangkat lokal
- ✅ Tidak ada data yang hilang

---

## 🔄 Backup & Restore

### Backup Database
1. Pergi ke Menu **Database**
2. Klik **Backup (.json)**
3. File akan didownload secara otomatis
4. File ini berisi semua data termasuk user admin

### Restore Database
1. Pergi ke Menu **Database**
2. Klik **Restore**
3. Pilih file .json backup
4. Semua data akan dikembalikan, termasuk user admin

---

## 🛡️ Keamanan

### Best Practices
- ✅ Ubah password `admin` default setelah installation
- ✅ Jangan bagikan password ke orang lain
- ✅ Gunakan password yang kuat untuk user baru
- ✅ Reguler backup database
- ✅ Hapus user yang tidak diperlukan

---

## 🔧 Troubleshooting

### Login Gagal
**Masalah**: Tidak bisa login meski sudah input username dan password
**Solusi**:
1. Buka Console Browser (F12)
2. Cek apakah ada error message
3. Pastikan username dan password benar (case-sensitive)
4. Coba refresh halaman (F5)
5. Clear localStorage dan coba lagi

### User Tidak Tersimpan
**Masalah**: User baru tidak muncul setelah ditambahkan
**Solusi**:
1. Cek di Menu Database > Manajemen User Admin
2. Jika tidak ada, cek Console Browser untuk error message
3. Pastikan localStorage tidak penuh
4. Coba gunakan browser yang berbeda

### Lupa Password
**Solusi**:
1. Buka Developer Tools (F12)
2. Buka tab Console
3. Copy & paste: `localStorage.getItem('absensi_users_v73')`
4. Cari user di JSON yang ditampilkan
5. Clear localStorage dan setup ulang, atau hubungi administrator

---

## 📌 Catatan Penting

- **Proteksi User Default**: User `admin` default tidak bisa dihapus untuk keamanan akses emergency
- **Password Plain Text**: Password disimpan sebagai plain text di localStorage (bukan hashed)
  - Untuk production, gunakan sistem auth yang lebih aman
  - Pertimbangkan menggunakan Supabase Auth atau JWT token
- **Multi-Device**: Jika menggunakan multiple device, data akan terpisah per device
  - Gunakan Supabase untuk sync antar device
  - Atau manual backup/restore

---

## 📞 Support

Jika ada masalah dengan sistem user/admin:
1. Cek tab Console Browser untuk error messages
2. Lihat bagian Troubleshooting di atas
3. Hubungi developer/administrator aplikasi

---

**Versi**: v7.3
**Update**: Februari 2026
**Status**: ✅ Production Ready
