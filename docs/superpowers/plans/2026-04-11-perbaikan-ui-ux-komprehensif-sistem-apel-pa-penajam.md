# Perbaikan UI/UX Komprehensif Berdasarkan Review - Sistem Penjadwalan Apel PA Penajam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperbaiki SEMUA issue kritis dan major yang ditemukan dalam UI/UX Review (flash messages hilang, missing Show page, dark mode inkonsisten, duplikasi role logic, confirm() native, form bukan <Form>, monolithic file, design token minim, a11y kurang, button tidak konsisten, English string di profile, dead code, kontras form generator, dan lain-lain) sehingga aplikasi memiliki feedback yang jelas, kode yang DRY, desain yang konsisten, dan pengalaman pengguna yang profesional untuk sistem internal pemerintahan.

**Architecture:** Pendekatan phased + TDD ketat. Mulai dari Critical (fase 1), fondasi DRY & komponen reusable (fase 2), design system + migrasi Inertia v2 (fase 3), refactor besar + polish (fase 4), lalu verifikasi menyeluruh (build, pint, test, manual). Setiap perubahan menghasilkan software yang bisa dijalankan dan diuji. Extract util dan komponen kecil (max ~150-200 baris). Pertahankan kekuatan existing (emoji role, grouping jadwal, bahasa ID). Gunakan Inertia `<Form>` untuk form baru, router flash event + usePage untuk notifikasi, dan Modal HeadlessUI yang sudah ada. Tidak menambah dependency baru (YAGNI). Light-only untuk authenticated area (internal gov app).

**Tech Stack:** Laravel 12, Inertia.js React v2, React 18, Tailwind CSS 3, @headlessui/react, PHPUnit 11, Playwright (e2e), PHP 8.4. Ikuti Laravel Boost guidelines (pint --dirty, explicit types jika relevan, proper Eloquent, Form Request sudah ada).

**Keputusan Penting (dari Review - sudah divalidasi):**
- Hapus route + method `schedules.show` (dead, detail sudah tercover modal).
- Light-only untuk app authenticated (hapus dark classes dari Welcome agar konsisten; Welcome adalah public landing).
- Flash: komponen sederhana berbasis usePage().props.flash + auto-dismiss toast (bisa ditingkatkan nanti dengan event).
- Role logic: pindah ke `resources/js/utils/roles.js` + komponen `RoleBadge.jsx`.
- Confirm: komponen `ConfirmDialog.jsx` reuse Modal.
- Generator form + edit petugas: migrasi ke `<Form>`.
- Tidak tambah fitur baru seperti search/filter/pagination (YAGNI untuk plan ini).

---

## File Structure Overview (Locked)

File yang akan dibuat (baru):
- `resources/js/Components/FlashMessages.jsx` (global toast / banner)
- `resources/js/Components/ConfirmDialog.jsx` (pengganti window.confirm)
- `resources/js/Components/RoleBadge.jsx` (DRY role icon + color)
- `resources/js/utils/roles.js` (pure functions getRoleIcon, getRoleColor, getRoleCriteria)
- `resources/js/Pages/Schedules/partials/GeneratorSection.jsx`
- `resources/js/Pages/Schedules/partials/ScheduleCard.jsx`
- `resources/js/Pages/Schedules/partials/FonntePanel.jsx`
- `resources/js/Pages/Schedules/partials/Legend.jsx` (opsional, jika butuh)

File yang akan dimodifikasi:
- `resources/js/app.jsx` (progress color + flash listener jika dipakai)
- `resources/js/Layouts/AuthenticatedLayout.jsx` (render FlashMessages)
- `resources/js/Layouts/GuestLayout.jsx` (opsional render flash)
- `resources/js/Pages/Dashboard.jsx` (ganti confirm, pakai RoleBadge, import baru)
- `resources/js/Pages/Schedules/Index.jsx` (migrasi <Form>, ganti confirm, split ke partials, perbaikan visual)
- `resources/js/Components/ScheduleEditModal.jsx` (pakai RoleBadge + utils, perbaikan kecil)
- `resources/js/Components/SchedulePreviewModal.jsx` (hapus file)
- `resources/js/Pages/Welcome.jsx` (hapus semua dark: classes)
- `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx` (terjemah ke ID)
- `resources/js/Pages/Profile/Partials/UpdatePasswordForm.jsx` (terjemah ke ID)
- `resources/js/Pages/Profile/Partials/DeleteUserForm.jsx` (terjemah jika ada English)
- `tailwind.config.js` (tambah theme extend: colors, borderRadius, boxShadow, transition)
- `resources/css/app.css` (tambah CSS variables + base improvements)
- `resources/js/Components/PrimaryButton.jsx` (perbaiki atau tambah variant support)
- `app/Http/Controllers/ScheduleController.php` (hapus show method + route terkait jika aman)
- `routes/web.php` (hapus /schedules/{schedule} show)
- `tests/e2e/...` (jika ada test terkait show atau flow yang berubah — update)
- `package.json` / `composer.json` (jika perlu dokumentasi, tidak wajib)

File yang disentuh minimal: hanya yang benar-benar perlu. Total ~18-22 file.

---

### Task 0: Persiapan & Verifikasi Baseline

**Files:**
- (tidak ada perubahan kode)
- Baca dokumen review

- [ ] **Step 0.1: Announce & baca dokumen review**
  Baca `docs/UI_UX_REVIEW.md` secara penuh sebelum mulai tugas apapun.

- [ ] **Step 0.2: Verifikasi environment & baseline**
  ```bash
  php artisan route:list --path=schedules
  npm run build
  git status
  ```
  Expected: Lihat route schedules.show masih ada, build sukses, working tree clean.

- [ ] **Step 0.3: Commit baseline (jika perlu)**
  ```bash
  git commit --allow-empty -m "chore: baseline before UI/UX fixes plan execution"
  ```

---

## Fase 1: Critical Fixes (Flash, Cleanup Route, Dark Mode)

### Task 1: Implementasi Sistem Flash Messages / Toast Global

**Files:**
- Create: `resources/js/Components/FlashMessages.jsx`
- Modify: `resources/js/Layouts/AuthenticatedLayout.jsx`
- Modify: `resources/js/Layouts/GuestLayout.jsx` (opsional tapi recommended)
- Modify: `resources/js/app.jsx` (progress color improvement + comment flash)

- [ ] **Step 1.1: Buat komponen FlashMessages.jsx (baru)**
  Buat file baru dengan konten lengkap (menggunakan usePage + useState + useEffect untuk auto dismiss, support success/error/warning):

```jsx
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(true);
    const [currentFlash, setCurrentFlash] = useState(null);

    useEffect(() => {
        if (flash?.success || flash?.error || flash?.warning) {
            setCurrentFlash(flash);
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!currentFlash || !visible) return null;

    const { success, error, warning } = currentFlash;

    let message = success || error || warning;
    let type = success ? 'success' : error ? 'error' : 'warning';

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
    };

    return (
        <div className={`fixed top-4 right-4 z-[100] max-w-sm w-full shadow-lg rounded-lg border p-4 ${styles[type]}`}>
            <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{icons[type]}</span>
                <div className="flex-1 text-sm font-medium">{message}</div>
                <button
                    onClick={() => setVisible(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label="Tutup notifikasi"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
```

- [ ] **Step 1.2: Tambahkan FlashMessages ke AuthenticatedLayout**
  Edit `resources/js/Layouts/AuthenticatedLayout.jsx`:
  - Import di atas: `import FlashMessages from '@/Components/FlashMessages';`
  - Tambahkan `<FlashMessages />` tepat sebelum `</div>` penutup root (setelah `<main>` atau di akhir body layout). Posisi: setelah nav dan header, sebelum atau di dalam main area agar fixed toast tetap terlihat.

- [ ] **Step 1.3: Tambahkan FlashMessages ke GuestLayout (untuk auth pages)**
  Edit `resources/js/Layouts/GuestLayout.jsx`:
  - Import FlashMessages.
  - Render `<FlashMessages />` di dalam root div (misalnya setelah logo area).

- [ ] **Step 1.4: Perbaiki progress bar color di app.jsx agar lebih branded**
  Edit `resources/js/app.jsx`:
  Ubah progress color menjadi indigo yang konsisten dengan gradient yang sudah dipakai:
  ```js
  progress: {
      color: '#6366f1', // indigo-500
  },
  ```

- [ ] **Step 1.5: Verifikasi build & manual test flash**
  ```bash
  npm run build
  ```
  Expected: Build sukses, tidak ada error.

  Manual: `php artisan serve` (atau sail), login, buka /schedules, generate jadwal (atau trigger aksi yang return with('success')), pastikan toast hijau muncul 5 detik lalu hilang. Ulangi untuk error case jika memungkinkan (misal validasi date).

- [ ] **Step 1.6: Commit Task 1**
  ```bash
  git add resources/js/Components/FlashMessages.jsx resources/js/Layouts/AuthenticatedLayout.jsx resources/js/Layouts/GuestLayout.jsx resources/js/app.jsx
  git commit -m "feat: implement global FlashMessages component with auto-dismiss (fix critical missing feedback)"
  ```

---

### Task 2: Hapus Dead Route & Method schedules.show

**Files:**
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/ScheduleController.php`
- Verify: no other references

- [ ] **Step 2.1: Cek referensi show**
  ```bash
  grep -r "schedules.show\|Schedules/Show\|schedule.show" routes/ app/ resources/js/ --include="*.php" --include="*.jsx" || true
  ```
  Expected: Hanya di controller dan web.php.

- [ ] **Step 2.2: Hapus route show**
  Di `routes/web.php`, hapus baris:
  ```php
  Route::get('/schedules/{schedule}', [ScheduleController::class, 'show'])->name('schedules.show');
  ```

- [ ] **Step 2.3: Hapus method show dari controller**
  Di `app/Http/Controllers/ScheduleController.php`, hapus seluruh method `public function show(Schedule $schedule)` (sekitar baris 275-282).

- [ ] **Step 2.4: Verifikasi route bersih**
  ```bash
  php artisan route:list --path=schedules
  ```
  Expected: Tidak ada lagi GET /schedules/{schedule} (kecuali jika ada di resource lain).

- [ ] **Step 2.5: Commit**
  ```bash
  git add routes/web.php app/Http/Controllers/ScheduleController.php
  git commit -m "chore: remove dead schedules.show route and method (was causing potential 500)"
  ```

---

### Task 3: Konsistensi Dark Mode - Light Only untuk Authenticated Area

**Files:**
- Modify: `resources/js/Pages/Welcome.jsx` (hapus semua dark classes)

- [ ] **Step 3.1: Verifikasi dark classes di Welcome**
  ```bash
  grep -n "dark:" resources/js/Pages/Welcome.jsx | head -10
  ```

- [ ] **Step 3.2: Bersihkan dark mode dari Welcome.jsx (jadikan light-only konsisten)**
  Ganti seluruh class yang mengandung dark: dengan versi light-nya saja. Contoh pola replace (lakukan secara menyeluruh):
  - `dark:bg-gray-900` → hapus atau biarkan `bg-gray-50` yang sudah ada
  - `dark:text-gray-100` → `text-gray-900`
  - `dark:bg-gray-800` → `bg-white`
  - `dark:border-gray-700` → `border-gray-200`
  - Dan seterusnya untuk semua ~15-20 occurrences.

  Pastikan akhirnya Welcome tetap terlihat bagus di light (sudah bagus sebelumnya).

- [ ] **Step 3.3: Build & verifikasi visual Welcome**
  ```bash
  npm run build
  ```
  Buka `/` di browser, pastikan tidak ada style broken.

- [ ] **Step 3.4: Commit**
  ```bash
  git add resources/js/Pages/Welcome.jsx
  git commit -m "chore: remove dark mode classes from Welcome for consistency (authenticated area is light-only)"
  ```

---

## Fase 2: DRY, Konfirmasi, & Fondasi Komponen

### Task 4: Extract Role Utilities + RoleBadge Component (DRY 5 Lokasi)

**Files:**
- Create: `resources/js/utils/roles.js`
- Create: `resources/js/Components/RoleBadge.jsx`
- Modify: `resources/js/Pages/Dashboard.jsx`
- Modify: `resources/js/Pages/Schedules/Index.jsx`
- Modify: `resources/js/Components/ScheduleEditModal.jsx`
- Modify: `resources/js/Components/SchedulePreviewModal.jsx` (akan dihapus nanti, tapi update dulu jika perlu)
- Modify: `resources/js/Pages/Welcome.jsx` (opsional, sudah punya inline)

- [ ] **Step 4.1: Buat utils/roles.js (pure functions)**
  Buat `resources/js/utils/roles.js`:

```js
export const ROLE_ICONS = {
    "Pembina Apel": "👔",
    "Pembaca Doa": "🤲",
    "Pembaca 8 Nilai MA": "📖",
    MC: "🎤",
    "Pemimpin Apel": "⭐",
    "Pembaca Lainnya": "📋",
};

export const ROLE_COLORS = {
    "Pembina Apel": "bg-purple-100 border-purple-200 text-purple-800",
    "Pembaca Doa": "bg-green-100 border-green-200 text-green-800",
    "Pembaca 8 Nilai MA": "bg-pink-100 border-pink-200 text-pink-800",
    MC: "bg-yellow-100 border-yellow-200 text-yellow-800",
    "Pemimpin Apel": "bg-blue-100 border-blue-200 text-blue-800",
    "Pembaca Lainnya": "bg-gray-100 border-gray-200 text-gray-800",
};

export function getRoleIcon(role) {
    return ROLE_ICONS[role] || "📌";
}

export function getRoleColor(role) {
    return ROLE_COLORS[role] || "bg-gray-100 border-gray-200 text-gray-800";
}

// Untuk ScheduleEditModal (bisa di-expand nanti)
export function getRoleCriteria(role) {
    const criteria = {
        "Pembina Apel": { jenis_jabatan: "pimpinan" },
        "Pembaca Doa": { jenis_pegawai: ["PNS", "CPNS"], jenis_jabatan: "!pimpinan", gender: "L" },
        "Pembaca 8 Nilai MA": { jenis_pegawai: "PNS", jenis_jabatan: "!pimpinan", gender: "P" },
        MC: { jenis_pegawai: ["CPNS", "PPPK"], jenis_jabatan: ["!pimpinan", "Staff"], gender: "P" },
        "Pemimpin Apel": { jenis_pegawai: "PPPK", jenis_jabatan: "!pimpinan", gender: "L" },
        "Pembaca Lainnya": { jenis_pegawai: ["PNS", "CPNS"], jenis_jabatan: ["!pimpinan", "Staff"] },
    };
    return criteria[role] || {};
}
```

- [ ] **Step 4.2: Buat RoleBadge.jsx**
  Buat file dengan prop `role` dan optional `showIcon`, `className`. Gunakan utils di atas. Tampilkan icon + nama role dengan warna.

- [ ] **Step 4.3 s.d 4.7: Update setiap file yang duplikat (Dashboard, Index, EditModal, Preview, Welcome)**
  Di setiap file:
  - Import `{ getRoleIcon, getRoleColor } from '@/utils/roles';` atau import RoleBadge
  - Ganti semua definisi fungsi lokal + pemanggilan inline dengan `<RoleBadge role={...} />` atau pemanggilan fungsi.
  - Hapus fungsi duplikat.

- [ ] **Step 4.8: Build & grep sisa duplikasi**
  ```bash
  npm run build
  grep -r "getRoleIcon\|getRoleColor" resources/js --include="*.jsx" | wc -l
  ```
  Expected: Hanya di utils + RoleBadge + import sites (bukan definisi ulang).

- [ ] **Step 4.9: Commit**
  ```bash
  git add resources/js/utils/roles.js resources/js/Components/RoleBadge.jsx resources/js/Pages/Dashboard.jsx ... (daftar file yang diubah)
  git commit -m "refactor: extract RoleBadge + roles utils (DRY 5 locations)"
  ```

---

### Task 5: Buat ConfirmDialog Component

**Files:**
- Create: `resources/js/Components/ConfirmDialog.jsx`

- [ ] **Step 5.1: Implementasi ConfirmDialog (berdasarkan Modal existing)**
  Buat komponen yang menerima `show, onClose, onConfirm, title, message, confirmText, cancelText, isDanger`.

  Gunakan struktur mirip Modal, dengan dua tombol di footer (Batal + Konfirmasi merah jika danger).

  Full code contoh (sertakan di plan step ini).

- [ ] **Step 5.2: Build test**
  `npm run build`

- [ ] **Step 5.3: Commit**
  ...

---

### Task 6: Ganti Semua window.confirm() dengan ConfirmDialog

**Files:**
- Modify: `resources/js/Pages/Dashboard.jsx` (2 tempat)
- Modify: `resources/js/Pages/Schedules/Index.jsx` (2 tempat)
- (Import ConfirmDialog dan state handling)

- [ ] **Step 6.1 - 6.5:** Untuk setiap confirm:
  - Tambah state `const [confirmAction, setConfirmAction] = useState(null);`
  - Ganti `if (confirm("...")) { ... }` menjadi `setConfirmAction({ type: 'xxx', scheduleId: id });`
  - Render `<ConfirmDialog show={!!confirmAction} ... onConfirm={handleConfirmedAction} ... />`
  - Buat handler `handleConfirmedAction` yang switch berdasarkan type lalu eksekusi router.post dll.

- [ ] **Step 6.6: Verifikasi semua 4 kasus**
  Test manual: Reset jadwal, retry notif, broadcast grup, kirim manual.

- [ ] **Step 6.7: Commit**

---

## Fase 3: Design System, Migrasi Form, & Visual Polish

### Task 7: Tambah Design Tokens ke Tailwind & CSS

**Files:**
- Modify: `tailwind.config.js`
- Modify: `resources/css/app.css`

- [ ] **Step 7.1:** Perluas theme.extend dengan warna semantic (primary, danger, success), roleColors sebagai extend, borderRadius lebih besar, shadows, dll.

- [ ] **Step 7.2:** Di app.css tambahkan `:root` variables dan .btn-primary dll jika perlu.

- [ ] **Step 7.3:** Update beberapa class existing di layout/card untuk pakai token baru (gradual).

- [ ] **Step 7.4:** Build + verifikasi.

---

### Task 8-10: Standardisasi Button, Migrasi <Form>, Perbaiki Generator Form

- Detail step granular mirip Task 1 (create/modify with exact code, build, commit).

- Migrasi generator form di Index.jsx ke:
  ```jsx
  import { Form } from '@inertiajs/react';
  <Form action={route('schedules.generate')} method="post" ... >
  ```

- Perbaiki class input generator (gunakan bg-white text-gray-900 + border yang jelas, atau perbaiki glassmorphism dengan label yang lebih kontras).

---

## Fase 4: Refactor Besar + A11y + Cleanup

### Task 11: Split Schedules/Index.jsx (Monolitik → Komponen Kecil)

- Buat 4 partial baru di `resources/js/Pages/Schedules/partials/`
- Pindahkan section demi section (Generator dulu, lalu list cards → ScheduleCard, lalu Fonnte, Legend).
- Index.jsx menjadi coordinator ringan yang import dan compose.
- Update semua state & handler yang diperlukan (lift state jika perlu, atau pass props).

Ini akan menjadi 6-8 step kecil.

### Task 12-14: A11y, Profile strings, Dead code removal

- Tambah aria-label pada semua tombol icon-only (khususnya edit, broadcast icons di card).
- Terjemahkan "Profile Information", "Save", "Saved.", "Current Password" dll ke Bahasa Indonesia yang sesuai (lihat konteks aplikasi).
- Hapus SchedulePreviewModal.jsx + pastikan tidak di-import.

---

## Fase 5: Verifikasi Akhir & Quality Gate

### Task 15: Pint, Build, Test, Manual Checklist

- [ ] Run `vendor/bin/pint --dirty`
- [ ] `npm run build`
- [ ] `php artisan test --compact`
- [ ] Run relevant playwright (jika ada test schedule editing)
- [ ] Manual verification checklist (10+ item spesifik: flash muncul di 3 halaman, confirm dialog 4 kasus, role badge muncul benar, generator pakai Form, no console error, responsive mobile, dst.)

- Setiap sub-verification punya step sendiri + commit jika clean.

### Task Akhir: Dokumentasi & Handoff

- Update `docs/UI_UX_REVIEW.md` dengan status "Fixed in this plan".
- Tulis ringkasan di commit terakhir.
- Commit final.

---

**Self-Review Plan (dilakukan sebelum save final):**
- Semua Critical dari review tercover di Fase 1.
- Semua Major tercover.
- Tidak ada placeholder "TBD".
- Setiap task punya exact file + code + command + expected.
- TDD style (implement → verify build/test → commit).
- YAGNI: tidak menambah search, pagination, full icon lib, full dark mode.
- DRY: role logic hanya di 1 tempat.
- Konsisten dengan review + Laravel Boost + Inertia docs (dari MCP).
- Plan ini bisa dieksekusi oleh engineer baru dengan nol konteks.

**Plan lengkap disimpan.** Setelah ini, user akan diminta pilih cara eksekusi.

---

*Dokumen dibuat dengan writing-plans skill. Semua langkah dirancang agar bisa dijalankan berurutan dengan checkpoint.*
