# Sistem Penjadwalan Apel PA Penajam

Sistem web otomatis untuk penjadwalan petugas Apel di Pengadilan Agama Penajam dengan rotasi adil dan notifikasi WhatsApp grup via Fonnte.

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2-9553E9)](https://inertiajs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Apa itu Sistem Penjadwalan Apel PA Penajam?

Aplikasi berbasis Laravel + Inertia + React untuk mengelola jadwal Apel (Senin & Jumat) secara otomatis. 

Sistem ini menggantikan penugasan manual dengan algoritma rotasi yang mempertimbangkan:
- Jenis jabatan (Pimpinan, Struktural, Fungsional, Staff)
- Jenis pegawai (Hakim, PNS, CPNS/CPAPES, PPPK)
- Gender (L/P)
- Riwayat penugasan sebelumnya (fair rotation)

Data pegawai di-import dari file `master.xlsx`. Notifikasi dikirim otomatis atau manual ke **1 grup WhatsApp** (strategi "Jalur Aman" untuk menghindari blokir akun WA).

## Fitur Utama

- **Generate Jadwal Otomatis**: Pilih rentang tanggal → sistem buat jadwal Senin & Jumat dengan 6 petugas per hari.
- **Rotasi Otomatis Berdasarkan Aturan**:
  | Peran              | Kriteria Petugas                          |
  |--------------------|-------------------------------------------|
  | Pembina Apel       | Pimpinan (Hakim + Panitera + Sekretaris) |
  | Pembaca Doa        | Laki-laki PNS + CPAPES                    |
  | Pembaca 8 Nilai MA | Perempuan PNS Staff                       |
  | MC                 | Perempuan CPAPES/PPPK Staff               |
  | Pemimpin Apel      | Laki-laki PPPK                            |
  | Pembaca Lainnya    | CPAPES Staff                              |
- Pengecualian otomatis: 1 petugas tidak boleh rangkap peran di jadwal yang sama atau minggu yang sama.
- **Broadcast WhatsApp Grup via Fonnte**: 1 pesan informatif ke grup (bukan 30 pesan individu).
- **Import dari master.xlsx**: Seeder `UserSeeder` membaca data NIP, Nama, Jabatan, Unit Kerja, Jenis Pegawai, Jenis Jabatan.
- **Monitoring Notifikasi**: Status pending/sent/failed, tombol force-send manual, update petugas manual.
- Test koneksi Fonnte & cek kuota langsung dari aplikasi (`/fonnte/test`, `/fonnte/quota`).
- Dashboard statistik & upcoming schedules.
- Autentikasi dengan Laravel Breeze + Sanctum.

## Requirement

- PHP ^8.2 (direkomendasikan 8.4+)
- Composer
- Node.js >= 18 + npm
- SQLite (default) atau MySQL/PostgreSQL
- Akun Fonnte aktif (https://fonnte.com) + device WhatsApp yang terhubung
- File `master.xlsx` di root proyek (template data pegawai PA Penajam)

## Cara Instalasi & Setup

### 1. Persiapan Project

```bash
cd /path/to/apel_system/.worktrees/clean-laravel-placeholders

composer install
cp .env.example .env
php artisan key:generate
```

### 2. Database & Seed Data Pegawai

```bash
php artisan migrate

# Pastikan master.xlsx sudah ada di root project
php artisan db:seed --class=UserSeeder
# atau
php artisan db:seed
```

Data default user: `password123` (ubah segera di produksi).

### 3. Setup Fonnte (WhatsApp API)

1. Daftar di https://fonnte.com/register
2. Verifikasi email, login ke https://app.fonnte.com/
3. **Device** → Tambah Device → Scan QR Code dengan WhatsApp HP Anda (HP harus online terus).
4. **Settings** → **API** → Copy **API Token**
5. Edit `.env`:

```env
FONNTE_TOKEN=paste_token_disini
FONNTE_TARGET_GROUP=120363xxxxxx@g.us   # ID grup WA (opsional, jika kosong gunakan allgroup)
```

Lihat detail lengkap di:
- `docs/QUICKSTART_FONNTE.md`
- `docs/SETUP_WHATSAPP_API.md`

### 4. Frontend & Run

```bash
npm install
npm run build          # produksi
# atau
npm run dev            # development (hot reload)
```

Jalankan aplikasi:

```bash
php artisan serve
# atau gunakan script dev lengkap
composer run dev
```

Buka: http://localhost:8000

Login dengan user yang di-seed, generate jadwal, lalu broadcast.

### 5. Scheduled Tasks (Otomatis)

Tambahkan ke crontab server produksi:

```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

Atau di development, script `composer run dev` sudah menjalankan queue.

## Perintah Penting

```bash
# Setup awal
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed --class=UserSeeder

# Generate jadwal (via UI atau bisa lewat controller)
# Buka /schedules → isi tanggal mulai & selesai → Generate Jadwal

# Kirim notifikasi manual / cek
php artisan notifications:send-scheduled
php artisan schedule:send-reminder

# Development
composer run dev          # server + queue + logs + vite
npm run dev
npm run build

# Testing & Quality
php artisan test --compact
vendor/bin/pint --dirty   # format code
php artisan test --filter=...

# Fonnte
# Buka di browser:
# /fonnte/test   → test koneksi
# /fonnte/quota  → cek sisa kuota

# Reset semua jadwal (hati-hati)
php artisan tinker
# lalu: \App\Models\Schedule::truncate(); \App\Models\Assignment::truncate();
```

Lihat juga perintah lengkap:

```bash
php artisan list | grep -E "(schedule|notification|seed|migrate)"
```

## Catatan Keamanan & Operasional

- **Strategi Jalur Aman**: Hanya 1 pesan broadcast ke grup WhatsApp per jadwal. Sangat mengurangi risiko akun WA Business diblokir.
- **Jangan commit** `.env`, `master.xlsx` (jika berisi data sensitif), atau token Fonnte ke Git.
- Token Fonnte disimpan hanya di `.env`.
- HP yang dipakai untuk Fonnte device **harus selalu nyala & online**.
- Kuota Fonnte: Free trial 50 pesan + paket Bronze (Rp150rb/1000 pesan) cukup untuk ~6 bulan (2 broadcast/minggu).
- Password seed default (`password123`) **harus diganti** sebelum produksi.
- Gunakan `QUEUE_CONNECTION=database` (sudah default) dan jalankan queue worker di produksi.
- Backup database sebelum migrasi besar atau reset jadwal.
- Monitoring: Cek halaman dashboard untuk notifikasi `failed`, lalu gunakan tombol force-send.

Lihat `CHANGELOG_APEL.md` untuk riwayat perubahan aturan & migrasi.

## Struktur Data Pegawai (contoh setelah import)

| Jenis Jabatan | Jumlah | Contoh                  |
|---------------|--------|-------------------------|
| Pimpinan      | 6      | Ketua, Wakil, Panitera, Sekretaris |
| Struktural    | 4      | Panmud, Kasubbag        |
| Fungsional    | 4      | Panitera Pengganti, Juru Sita |
| Staff PNS     | 4      | Analis Perkara          |
| CPAPES        | 5      | Teknisi, Pengelola      |
| PPPK          | 6      | Penata Layanan, Operator |

## Credit & Lisensi

Dikembangkan untuk kebutuhan operasional **Pengadilan Agama Penajam**.

- Framework: Laravel 12 + Inertia.js v2 + React 18 + Tailwind CSS
- WhatsApp API: Fonnte
- Lisensi: [MIT](LICENSE)

Terima kasih kepada semua kontributor dan tim PA Penajam.

---

**Versi saat ini mengikuti** `CHANGELOG_APEL.md` (v2.0.0+).

Untuk bantuan lebih lanjut, lihat dokumentasi di folder `docs/`.
