# Design Document: Pembersihan Placeholder Laravel pada Sistem Penjadwalan Apel PA Penajam

**Tanggal:** 2026-04-10  
**Status:** Disetujui (dengan revisi kecil pada Section 3)  
**Penulis:** Grok (berdasarkan proses brainstorming dengan user)  
**Pendekatan yang Dipilih:** Balanced (Pendekatan 2) dengan revisi scope

---

## 1. Latar Belakang dan Masalah

Proyek **Sistem Penjadwalan Apel PA Penajam** dibangun di atas Laravel 12 + Breeze + Inertia React v2. Namun, masih banyak sisa-sisa scaffolding default dari Laravel dan Breeze yang membuat aplikasi terasa seperti "proyek Laravel baru" alih-alih aplikasi produksi milik Pengadilan Agama Penajam.

Placeholder yang masih ada:
- Nama aplikasi masih default "Laravel" di banyak tempat.
- Halaman Welcome `/` masih berisi konten marketing Laravel penuh (link ke laravel.com, Laracasts, Laravel News, ecosystem, dll).
- README.md adalah dokumentasi framework Laravel, bukan proyek ini.
- composer.json dan package.json masih menggunakan identitas "laravel/laravel".
- .env.example dan config/app.php masih menggunakan default Laravel (termasuk timezone UTC dan locale en).
- DatabaseSeeder masih membuat user "Test User" dengan email example.com.
- Beberapa string English dari scaffolding Breeze masih muncul di halaman login.

Tujuan: Menghapus semua placeholder tersebut dan mengganti dengan konten yang sesuai dengan **workflow nyata** aplikasi, yaitu:
- Penjadwalan apel otomatis dengan rotasi berdasarkan jenis jabatan dan gender.
- 6 peran tetap (Pembina Apel, Pembaca Doa, Pembaca 8 Nilai MA, MC, Pemimpin Apel, Pembaca Lainnya).
- Broadcast notifikasi ke 1 grup WhatsApp via Fonnte (strategi "jalur aman").
- Import data pegawai dari master.xlsx.
- Nama resmi: **Sistem Penjadwalan Apel PA Penajam**.

---

## 2. Nama Resmi Aplikasi (Disetujui)

**"Sistem Penjadwalan Apel PA Penajam"**

Nama ini akan digunakan di:
- APP_NAME (config + .env + VITE_APP_NAME)
- Judul browser
- Halaman Welcome (landing)
- README.md
- composer.json / package.json (description)
- Semua teks user-facing yang relevan

---

## 3. Pendekatan yang Dipilih

**Pendekatan 2 (Balanced)** dengan revisi kecil yang diminta user:

- Bersihkan semua placeholder branding dan metadata Laravel.
- Rewrite halaman Welcome menjadi landing informatif (pilihan A).
- Bersihkan data placeholder di seeder.
- **Revisi scope (user request):** Hanya bersihkan string pada **modul Login saja**. Tidak menyentuh halaman Register, Forgot Password, Reset Password, Confirm Password, Verify Email, maupun form Profile.

Alasan revisi: Menghindari perubahan pada scaffolding autentikasi "milik Fortify/Breeze" yang mungkin masih diperlukan atau ingin dibiarkan standar untuk saat ini.

---

## 4. Design Section 1: Core Branding & Identity (Disetujui)

### Perubahan File:

| File | Perubahan Utama |
|------|-----------------|
| `config/app.php` | APP_NAME default = "Sistem Penjadwalan Apel PA Penajam", timezone = 'Asia/Jakarta', locale = 'id', fallback = 'id', faker_locale = 'id_ID' |
| `.env.example` | APP_NAME, locale, tambahkan contoh FONNTE_TOKEN dan FONNTE_TARGET_GROUP |
| `resources/views/app.blade.php` | Ganti fallback title dari 'Laravel' |
| `resources/js/app.jsx` | Ganti default appName dari 'Laravel' |
| `routes/web.php` | Hapus pengiriman `laravelVersion` dan `phpVersion` ke Welcome |
| `composer.json` | Ubah name, description, dan keywords agar mencerminkan proyek APEL |
| `package.json` | Tambahkan name dan description |
| `README.md` | Tulis ulang total menjadi dokumentasi proyek (fitur, setup, workflow, Fonnte, seeding master.xlsx) |

**Catatan:** Semua perubahan ini membuat aplikasi mengenali identitasnya sendiri di level konfigurasi dan metadata.

---

## 5. Design Section 2: Welcome / Landing Page Redesign (Disetujui - Opsi A)

**File:** `resources/js/Pages/Welcome.jsx`

**Konten baru (informative landing):**

- Header/nav minimal dengan logo + tautan ke Login/Dashboard (kondisional berdasarkan `auth.user`).
- Hero section: Logo besar + judul "Sistem Penjadwalan Apel PA Penajam" + tagline yang menjelaskan manfaat.
- Paragraf singkat penjelasan bahwa aplikasi ini digunakan di Pengadilan Agama Penajam.
- Bagian "Fitur Utama":
  - Generate jadwal untuk rentang tanggal
  - Rotasi petugas otomatis sesuai aturan jenis jabatan & gender
  - Broadcast notifikasi ke grup WhatsApp (1 pesan via Fonnte)
- Highlight 6 peran apel (menggunakan ikon dan warna yang konsisten dengan Dashboard.jsx):
  - Pembina Apel, Pembaca Doa, Pembaca 8 Nilai MA, MC, Pemimpin Apel, Pembaca Lainnya
- Call-to-action besar: "Masuk ke Sistem" (link ke login). Jika sudah login, tombol "Buka Dashboard".
- Footer sederhana dengan nama instansi.

**Yang dihapus total:**
- Semua gambar dan link eksternal ke laravel.com, Laracasts, Laravel News.
- Background SVG Laravel.
- Semua card ecosystem Laravel.
- Props `laravelVersion` dan `phpVersion`.
- Warna aksen merah Laravel.

Halaman ini harus mencerminkan workflow nyata aplikasi dan terasa profesional untuk instansi pemerintah.

---

## 6. Design Section 3: Seeders Cleanup + Konsistensi Bahasa (Disetujui dengan Revisi)

### 6.1 Database Seeder (Tetap Dibersihkan)

**File:** `database/seeders/DatabaseSeeder.php`

- Hapus kode yang membuat placeholder user:
  ```php
  User::factory()->create([
      'name' => 'Test User',
      'email' => 'test@example.com',
  ]);
  ```
- Pertahankan `$this->call(UserSeeder::class);` (ini sudah spesifik PA Penajam).

### 6.2 String Bahasa Indonesia (Revisi Kecil User)

**Hanya** menyentuh **modul Login** saja.

**File:** `resources/js/Pages/Auth/Login.jsx`

Terjemahkan string English yang tersisa:
- "Remember me" → "Ingat saya"
- "Forgot your password?" → "Lupa kata sandi?"

**Tidak disentuh sama sekali** (sesuai revisi user):
- Register.jsx
- ForgotPassword.jsx
- ResetPassword.jsx
- ConfirmPassword.jsx
- VerifyEmail.jsx
- Semua form di `resources/js/Pages/Profile/Partials/`
- Teks "Profile" dan "Log Out" di AuthenticatedLayout (kecuali jika user minta nanti)

Alasan: User secara eksplisit meminta hanya modul login. Halaman autentikasi lain (register, lupa password, dll) dibiarkan seperti scaffolding aslinya untuk saat ini.

### 6.3 ApplicationLogo & Komponen Kecil

- `ApplicationLogo.jsx`: Dibiarkan apa adanya (SVG abstrak generik). Tidak ada perubahan dalam scope ini (YAGNI).
- `GuestLayout.jsx`: Tidak diubah.

### 6.4 Hal yang Sengaja Tidak Diubah

- Semua file di folder `tests/` (test@example.com adalah standar testing).
- Komentar dokumentasi di `config/*.php` ("Laravel supports...").
- Logic bisnis, model, controller, service, dan halaman Dashboard/Schedules (sudah spesifik dan bagus).
- Semua pesan WhatsApp dan aturan rotasi (sudah sesuai workflow).

---

## 7. Daftar File yang Akan Diubah (Final)

1. `config/app.php`
2. `.env.example`
3. `resources/views/app.blade.php`
4. `resources/js/app.jsx`
5. `routes/web.php`
6. `composer.json`
7. `package.json`
8. `README.md` (total rewrite)
9. `resources/js/Pages/Welcome.jsx` (total rewrite sesuai Section 2)
10. `database/seeders/DatabaseSeeder.php`
11. `resources/js/Pages/Auth/Login.jsx` (hanya 2 string)

**Total 11 file.** Semua perubahan bersifat penggantian placeholder + penyesuaian branding & konsistensi.

---

## 8. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Tidak ada lagi string "Laravel" yang muncul di halaman publik atau setelah login (kecuali di file panduan AI).
- [ ] Saat membuka `/`, tampil halaman landing informatif sesuai desain Section 2 (pilihan A).
- [ ] Title browser dan metadata menggunakan "Sistem Penjadwalan Apel PA Penajam".
- [ ] `php artisan db:seed` tidak lagi membuat user "Test User".
- [ ] Halaman Login menggunakan "Ingat saya" dan "Lupa kata sandi?".
- [ ] README.md menjelaskan proyek ini, bukan Laravel.
- [ ] Semua perubahan lolos `vendor/bin/pint --dirty`.
- [ ] Tidak ada regresi pada fitur utama (generate jadwal, broadcast, edit petugas).

---

## 9. Strategi Implementasi & Testing

- Ikuti **Test-Driven Development (TDD)** secara ketat (RED → GREEN → REFACTOR) untuk setiap perubahan yang memungkinkan.
- Gunakan `php artisan test --compact --filter=...` untuk menjalankan test minimal yang relevan.
- Setelah semua perubahan, jalankan `vendor/bin/pint --dirty`.
- Verifikasi manual:
  - Buka halaman Welcome (guest & logged-in).
  - Login dan cek title browser.
  - Jalankan seeder di environment fresh.
  - Cek tampilan halaman Login.
- Karena perubahan mayoritas adalah konten & konfigurasi, test otomatis akan difokuskan pada seeder dan route.

---

## 10. Risiko & Batasan

- Perubahan pada Welcome.jsx bersifat total rewrite → butuh verifikasi visual yang teliti.
- Revisi scope user berarti beberapa halaman auth masih dalam English (Register, password reset, profile). Ini disengaja dan akan dicatat di dokumentasi.
- Tidak ada perubahan pada logo visual saat ini.

---

## 11. Langkah Selanjutnya (Setelah User Menyetujui Dokumen Ini)

1. User mereview dokumen ini.
2. Jika disetujui, lanjut ke `writing-plans` skill untuk memecah menjadi micro-task.
3. Eksekusi menggunakan `executing-plans` atau subagent dengan TDD.
4. Setiap batch perubahan akan melalui review (requesting-code-review).
5. Akhir: verification-before-completion + `vendor/bin/pint --dirty`.

---

**Catatan Revisi dari User (2026-04-10):**  
Hanya modul Login yang dibersihkan string-nya. Register, lupa password, reset password, confirm password, verify email, dan semua form Profile dibiarkan tidak disentuh.

---

Dokumen ini adalah hasil lengkap dari proses brainstorming. Semua section telah disetujui dengan revisi di atas.

Silakan review dokumen ini. Jika sudah sesuai, balas dengan "Disetujui" atau "Lanjut ke writing-plans" agar saya bisa melanjutkan ke tahap perencanaan implementasi yang detail.