# CHANGELOG APEL System

## v2.0.0 (Januari 2025)

### 🚀 Fitur Baru
- **Sistem Notifikasi WhatsApp ke Grup**
  - Notifikasi dikirim ke 1 grup WhatsApp (strategi aman)
  - Format pesan yang lebih informatif dengan emoji
  - Mengurangi risiko blokir karena terlalu banyak pesan

- **Import Data dari master.xlsx**
  - Seeder baru `UserSeeder.php` untuk import data pegawai
  - Mendukung kolom: NIP, Nama, Jabatan, Unit Kerja, Jenis Pegawai, Jenis Jabatan
  - Auto-determine gender dari nama

### 📋 Perubahan Aturan Penugasan

| Peran | Aturan Lama | Aturan Baru |
|-------|-------------|-------------|
| Pembina Apel | Ketua, Wakil, Hakim, Sekretaris, Panitera | Pimpinan (Hakim + Panitera + Sekretaris) |
| Pembaca Doa | Daftar tetap (Awaluddin, dll) | Laki-laki PNS + CPAPES |
| Pembaca 8 Nilai MA | Daftar tetap (Faridah, dll) | Perempuan PNS Staff |
| MC | Daftar tetap (Qurrotu, dll) | Perempuan CPAPES/PPPK Staff |
| Pemimpin Apel | Ashar, Amin Nur, Adi, Damai | Laki-laki PPPK |
| Pembaca Lainnya | Sisa pegawai | CPAPES Staff |

### 🔧 Perubahan Teknis

#### Database Migration
- `2026_01_02_083313_add_phone_to_users_table.php`
  - Tambah kolom `phone`
  - Tambah kolom `gender` (L/P)
  - Tambah kolom `jenis_pegawai` (Hakim, PNS, CPAPES, PPPK)
  - Tambah kolom `jenis_jabatan` (pimpinan, Struktural, Fungsional, Staff)
  - Tambah kolom `nip`

#### Model (User.php)
- Method helper baru:
  - `isMale()` / `isFemale()`
  - `isPNS()` / `isCPNS()` / `isPPPK()`
  - `isPimpinan()` / `isStruktural()` / `isFungsional()` / `isStaff()`

#### SchedulerService
- Algoritma rotasi berdasarkan peran (per-role assignment history)
- Pengecualian otomatis: user yang sudah bertugas tidak dipilih untuk peran lain di jadwal yang sama
- Query lebih efisien menggunakan `whereNotIn`

#### ScheduleController
- Metode `broadcast()`: Kirim ke grup WhatsApp
- Metode `broadcastIndividual()`: Kirim ke masing-masing pegawai (backup)
- Metode `destroy()`: Hapus jadwal
- Metode `show()`: Lihat detail jadwal

#### Frontend (React)
- UI/UX lebih baik dengan warna per peran
- Loading spinner saat broadcast
- Tombol broadcast dengan icon WhatsApp
- Legend keterangan peran

### 📁 File Baru
- `database/seeders/UserSeeder.php` - Import data dari master.xlsx
- `database/data/users_apel.sql` - SQL dump data pegawai
- `composer.json` - Tambah `phpoffice/phpspreadsheet`

### ⚙️ Konfigurasi .env
```env
FONTEE_TOKEN=your_fontee_api_token
FONTEE_TARGET_GROUP=group_id_for_broadcast
```

### 📊 Struktur Data Pegawai
| Jenis Jabatan | Jumlah | Contoh |
|--------------|--------|--------|
| Pimpinan | 6 | Ketua, Wakil Ketua, Panitera, Sekretaris |
| Struktural | 4 | Panmud, Kasubbag |
| Fungsional | 4 | Panitera Pengganti, Juru Sita, Pranata Komputer |
| Staff PNS | 4 | Analis Perkara Peradilan |
| CPAPES | 5 | Teknisi, Pengelola, Dokumentalis |
| PPPK | 6 | Penata Layanan, Operator, Pengelola |

### 🔒 Catatan Keamanan
- Strategi "Jalur Aman": 1 pesan ke grup (bukan 30 pesan ke individu)
- Mencegah blokir akun WhatsApp Business
- Token Fontee disimpan di .env (tidak di code)

### 📝 Cara Migrasi
1. Backup database lama
2. Jalankan migration baru:
   ```bash
   php artisan migrate
   ```
3. Seed data dari master.xlsx:
   ```bash
   php artisan db:seed --class=UserSeeder
   ```
4. Update file `.env` dengan konfigurasi Fontee

---

## v1.0.0
- Versi awal dengan sistem penjadwalan apel dasar
- Hardcoded list untuk penugasan
- Notifikasi ke grup WhatsApp