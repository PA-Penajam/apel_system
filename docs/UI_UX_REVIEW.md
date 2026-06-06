# Laporan Review Komprehensif UI/UX — Sistem Penjadwalan Apel PA Penajam

**Tanggal Review**: April 2026 (oleh Grok 4.3)  
**Proyek**: apel_system (Laravel 12 + Inertia.js v2 + React 18 + Tailwind CSS 3)  
**Tujuan**: Analisis menyeluruh terhadap seluruh antarmuka pengguna dan pengalaman pengguna (UI/UX) aplikasi, termasuk konsistensi, aksesibilitas, kepatuhan best practice, dan kualitas visual.

---

## Ringkasan Eksekutif

Aplikasi ini adalah sistem internal pemerintahan untuk pengelolaan jadwal apel (senin & jumat) beserta 6 peran petugas di Pengadilan Agama Penajam, dengan integrasi notifikasi WhatsApp via Fonnte.

**Kekuatan Utama**:
- Bahasa antarmuka sepenuhnya dalam Bahasa Indonesia (kecuali sebagian kecil di halaman Profile).
- Visualisasi peran dengan emoji + warna pastel yang konsisten dan informatif (sangat membantu pemahaman domain).
- Welcome page (landing publik) cukup modern dan branded.
- Banyak indikator loading dan empty state yang baik.
- Fitur inti (generate jadwal, broadcast, edit petugas) sudah berfungsi secara fungsional.

**Masalah Kritis (Blocker)**:
1. **Flash message / feedback sistem rusak total** — pengguna tidak melihat konfirmasi sukses/gagal dari aksi penting (generate, broadcast, update petugas, dll).
2. **Halaman Schedules/Show hilang** — route dan controller ada, tapi komponen React tidak ada (akan error 500 di production).
3. **Tidak ada dark mode** di seluruh aplikasi authenticated (sementara Welcome page mendukung penuh).

**Skor Keseluruhan (subjektif, skala 10)**: **5.8 / 10**

Aplikasi "bisa jalan" dan domain logic kuat, tetapi UI/UX masih terasa seperti proyek Breeze default yang "di-custom secukupnya" tanpa design system yang matang dan tanpa perhatian terhadap feedback pengguna.

---

## 1. Critical Issues (Harus Diperbaiki Segera)

### 1.1 Flash Messages / Notifikasi Sukses-Gagal Tidak Muncul (Critical — UX #1)

**Lokasi**:
- Hampir semua controller Schedule & Profile menggunakan `redirect()->back()->with('success', ...)` atau `with('error')` / `with('warning')`.
- Lihat: [app/Http/Controllers/ScheduleController.php](/app/Http/Controllers/ScheduleController.php) (baris 59, 117, 135, 172, 224, 244, 266, 298, 361, 397, dst).
- Dashboard & Schedules/Index tidak memiliki komponen untuk menampilkan `usePage().props.flash`.

**Dampak**: Pengguna melakukan aksi penting (Generate Jadwal, Kirim Notifikasi, Edit Petugas) tapi tidak ada indikasi visual apapun berhasil atau gagal. Sangat membingungkan.

**Rekomendasi** (sesuai Inertia v2 docs):
- Tambahkan global flash handler di `resources/js/app.jsx` atau layout menggunakan `router.on('flash', ...)`.
- Buat komponen `Toast` atau `FlashMessage` yang reusable.
- Gunakan `Inertia::flash()` untuk kasus yang lebih kompleks.

### 1.2 Halaman Detail Jadwal (Schedules/Show) Tidak Ada (Critical — Bug)

**Lokasi**:
- Route: `GET /schedules/{schedule}` → `ScheduleController@show`
- Controller: [app/Http/Controllers/ScheduleController.php:279](/app/Http/Controllers/ScheduleController.php) merender `'Schedules/Show'`
- File tidak ada di `resources/js/Pages/Schedules/`

**Dampak**: Akses langsung ke detail jadwal akan error. Juga ada link potensial yang broken.

**Rekomendasi**: Hapus route jika tidak diperlukan, atau buat halaman Show sederhana (bisa reuse logic dari modal detail yang sudah ada di Dashboard).

### 1.3 Ketidakkonsistenan Dark Mode (Critical — Branding & Aksesibilitas)

- Welcome.jsx: penuh dukungan `dark:` classes + `dark:bg-*`.
- AuthenticatedLayout, Dashboard, Schedules/Index, semua komponen, Modal: **0 dark class**.
- Tidak ada toggle tema dan tidak ada class `dark` di `<html>` atau body.

**Rekomendasi**: Putuskan strategi (light-only untuk internal app atau full dark mode). Jika light-only, bersihkan dark classes di Welcome agar konsisten.

---

## 2. Major Issues (Dampak Besar terhadap Pengalaman)

### 2.1 Tidak Menggunakan `<Form>` Component Inertia v2 (Major — Best Practice)

Dari dokumentasi Inertia v2 (via Laravel Boost MCP):
- Direkomendasikan menggunakan `<Form action="..." method="post">` dari `@inertiajs/react`.
- Memberikan `resetOnSuccess`, `resetOnError`, `setDefaultsOnSuccess`, progressive enhancement, dll.

Saat ini semua form menggunakan `useForm()` + `<form onSubmit>` manual (Schedules/Index generator, Profile forms, Login, dll).

### 2.2 Monolitik & Duplikasi Kode Besar di UI (Major — Maintainability)

- `resources/js/Pages/Schedules/Index.jsx`: **~720 baris** dalam satu file (generator + list + fonnte tools + legend).
- Logika `getRoleIcon()` + `getRoleColor()` **diduplikasi minimal 5 tempat** (Dashboard, Index, EditModal, PreviewModal, Welcome).
- Banyak inline SVG identik untuk spinner dan icon.

**Rekomendasi**:
- Ekstrak `RoleBadge`, `ScheduleCard`, `RoleUtils` ke komponen terpisah.
- Pecah Schedules/Index menjadi sub-komponen (GeneratorSection, ScheduleGrid, FonntePanel, Legend).

### 2.3 Penggunaan `window.confirm()` untuk Aksi Kritis (Major — UX & Risiko)

Ditemukan 4 tempat:
- Dashboard.jsx:20, 37 (retry notif & reset semua)
- Schedules/Index.jsx:25, 40 (broadcast grup & manual)

**Dampak**: Dialog browser jelek, tidak accessible, tidak bisa di-style, tidak ada detail, irreversible.

**Rekomendasi**: Ganti dengan Modal konfirmasi yang cantik (sudah punya Modal component berbasis Headless UI).

### 2.4 Inconsistent Button & Component Styling (Major — Visual Cohesion)

- `PrimaryButton.jsx`: `bg-gray-800 uppercase tracking-widest text-xs` (Breeze default lama).
- Halaman custom (Dashboard, Schedules): `bg-blue-600 text-white rounded-lg px-4 py-2` (modern).
- Banyak tombol icon-only tanpa `aria-label` (edit pencil di card jadwal).

### 2.5 Form Generator di Schedules/Index Sulit Dibaca (Major — Visual & Aksesibilitas)

- Input date di atas gradient biru-indigo dengan `bg-white/10 text-white` + `border-transparent`.
- Label menggunakan `text-blue-100` (kontras mungkin lemah).
- Error message `text-red-300`.

---

## 3. Design System, Theming & Konsistensi Visual

### 3.1 Design Tokens Hampir Tidak Ada

- `tailwind.config.js`: hanya extend fontFamily Figtree. Tidak ada warna custom, spacing scale, radius, shadow, transition.
- `resources/css/app.css`: hanya 3 baris `@tailwind`.
- Semua warna hard-coded (`blue-600`, `indigo-700`, `gray-100`, `red-600`, dll).

**Rekomendasi**: Definisikan semantic tokens di config + CSS variables:
- `--primary`, `--danger`, `--success`, `--surface`, `--text`, dll.
- Role colors sebaiknya jadi token juga.

### 3.2 Layout & Navigation (AuthenticatedLayout)

- Top nav klasik Breeze, cukup untuk 2 menu utama.
- Mobile: hamburger + dropdown user ok.
- Tapi: `bg-gray-100` body + konten `bg-gray-50` + kartu `bg-white` terasa "Breeze banget".
- Header halaman (judul) kadang lemah dibandingkan konten di dalamnya (banyak section punya judul sendiri yang lebih besar).

### 3.3 Kartu & Visual Hierarchy

Dashboard dan Schedules punya pola kartu yang bagus, tapi:
- Shadow dan border tidak konsisten (`shadow-sm`, `shadow`, `shadow-xl`, `border border-gray-100`).
- Welcome banner gradient bagus, tapi tidak ada ilustrasi atau hero image yang lebih kuat.

### 3.4 Emoji sebagai Design Element

Penggunaan emoji untuk peran dan jenis apel (1️⃣ / 6️⃣) sangat efektif dan humanis. Pertahankan, tapi pastikan ada fallback atau aria-hidden yang benar.

---

## 4. Accessibility (a11y) & Responsiveness

**Positif**:
- Modal menggunakan @headlessui (Dialog + Transition) — sudah cukup accessible.
- Beberapa `aria-label` sudah ditambahkan di tombol close modal.

**Masalah**:
- Banyak tombol icon-only (edit, broadcast icons) tanpa label teks atau `aria-label`.
- Native `<select>` di ScheduleEditModal (bisa diganti combobox yang lebih baik).
- Kontras pada input generator form di gradient perlu dicek (gunakan Lighthouse nanti).
- Tidak ada focus-visible yang konsisten di semua custom button.
- Profile forms masih pakai label English ("Profile Information", "Save").

**Responsiveness**: Secara umum baik (grid 1-2-3-4 kolom, flex wrap). Tapi di layar sangat kecil, action buttons di card jadwal bisa terlalu sempit.

---

## 5. Kepatuhan Inertia v2 + Laravel Boost Guidelines

- Masih banyak pola Breeze v1-ish.
- Belum memanfaatkan fitur v2: `<Form>`, deferred props, `WhenVisible`, infinite scroll merging, prefetch.
- Dashboard memuat banyak data sekaligus (`allUpcomingSchedules`, `failedNotifications`, dll) — cocok untuk deferred + skeleton.
- Beberapa controller return `Inertia::back()` (bagus), tapi campur dengan `redirect()->back()`.

---

## 6. Temuan Lain (Minor / Polish)

- `SchedulePreviewModal.jsx` dibuat tapi **tidak pernah dipakai** (dead code).
- Test Playwright ada dan ada yang gagal (lihat `test-results/`).
- PrimaryButton, SecondaryButton, DangerButton dari Breeze jarang dipakai di halaman utama.
- Beberapa halaman Auth (Register, Forgot, dll) masih standar Breeze tanpa sentuhan branding PA Penajam.
- Tidak ada loading skeleton untuk data berat di dashboard.
- Tidak ada konfirmasi "Anda yakin?" yang lebih baik sebelum Reset Semua Jadwal.

---

## 7. Rekomendasi Prioritas (Action Plan)

### Fase 1 — Critical (1-2 hari)
1. Implementasi global Flash/Toast system + `router.on('flash')`.
2. Buat atau hapus route `schedules.show` + halaman Show (atau hilangkan).
3. Putuskan & terapkan strategi dark mode (atau hapus dark classes dari Welcome).

### Fase 2 — Major UX & Konsistensi (3-5 hari)
4. Refactor duplikasi role icon/color → komponen `RoleBadge.jsx` + utils.
5. Ganti semua `confirm()` dengan `<ModalConfirm>` atau dialog Headless.
6. Migrasi form penting ke `<Form>` Inertia (minimal generator jadwal & edit petugas).
7. Standardisasi button variants (buat design token + komponen Button baru yang menggantikan PrimaryButton lama).
8. Pecah `Schedules/Index.jsx` menjadi beberapa komponen kecil.

### Fase 3 — Design System & Polish (2-4 hari)
9. Perluas `tailwind.config.js` + tambah CSS variables untuk warna, radius, shadow.
10. Buat komponen reusable: `ScheduleCard`, `StatusBadge`, `StatCard`, `EmptyState`.
11. Perbaiki kontras & styling form generator.
12. Tambah `aria-label` di semua icon button.
13. Buat halaman Auth & Profile mengikuti branding yang sama dengan Dashboard.

### Fase 4 — Lanjutan (Opsional tapi Direkomendasikan)
- Tambah search + filter + pagination di daftar jadwal.
- Optimasi data loading dengan deferred props + skeleton.
- Tambah e2e visual regression atau update playwright tests yang gagal.
- Pertimbangkan library icon (Lucide / Heroicons) alih-alih inline SVG + emoji campur.

---

## Lampiran

- Routes lengkap tersedia via `php artisan route:list` atau MCP `list-routes`.
- Dokumentasi Inertia Form & Flash: https://inertiajs.com/docs/v2/the-basics/forms dan flash data.
- Playwright reports & screenshots error ada di `test-results/`.

---

**Catatan untuk Tim**:
Review ini dibuat berdasarkan pembacaan seluruh source code frontend (JSX), controller terkait, konfigurasi, dan dokumentasi Laravel Boost + Inertia v2. Untuk validasi visual aktual (contrast, layout di berbagai device, interaksi), disarankan menjalankan Lighthouse via chrome-devtools MCP dan memperbaiki test Playwright yang gagal.

Jika Anda ingin saya **membuat implementation plan** (menggunakan writing-plans skill) atau langsung **memperbaiki** isu-isu tertentu (mulai dari Critical), beri tahu bagian mana yang diprioritaskan terlebih dahulu.

---

*Dokumen ini disimpan di `docs/UI_UX_REVIEW.md` untuk referensi tim.*
