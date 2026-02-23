# Plan: Tampilkan Riwayat Absensi di Halaman Scanner

## Task Understanding
- Menampilkan riwayat absensi di bagian bawah halaman scan QR code
- Hanya menampilkan data 5 hari terakhir
- Kolom yang ditampilkan: Nama, Loker, Jabatan, Waktu, Status

## Implementation Plan

### 1. Update HTML Structure (index.html)
- [ ] Menambahkan container untuk riwayat absensi di dalam #view-scanner
- [ ] Menambahkan style CSS untuk tabel riwayat scanner

### 2. Add JavaScript Functions (index.html)
- [ ] Membuat fungsi `getRecentHistory()` untuk mendapatkan data 5 hari terakhir
- [ ] Membuat fungsi `renderScannerHistory()` untuk menampilkan riwayat di scanner
- [ ] Memanggil render saat scanner dimulai
- [ ] Update riwayat setelah scan berhasil

## Files to Edit
- index.html: Tambahkan HTML dan logic untuk menampilkan riwayat di scanner page
