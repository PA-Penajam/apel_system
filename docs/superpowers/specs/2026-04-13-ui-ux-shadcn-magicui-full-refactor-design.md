# Design Document: Full UI/UX Refactor ke Shadcn + Magic UI

**Tanggal**: 2026-04-13  
**Penulis**: Grok (Superpowers Brainstorming)  
**Status**: Approved by user — Ready for implementation planning  
**Proyek**: apel_system (Laravel 12 + Inertia v2 + React 18 + Tailwind 3)  
**Tujuan**: Refactor total seluruh antarmuka menggunakan shadcn/ui sebagai foundation + Magic UI untuk polish visual & interaksi, sesuai pilihan user A + modal replace + Magic UI level C.

---

## Ringkasan Eksekutif

User meminta analisis UI/UX kemudian refactor **semua** komponen menggunakan shadcn dan Magic UI.

Setelah proses brainstorming (explore codebase, review UI_UX_REVIEW.md sebelumnya, klarifikasi scope, presentasi 3 pendekatan + 7 section design):

- **Scope disetujui**: A (Total & Agresif)
- Ganti UI ScheduleEditModal sepenuhnya (shadcn Dialog + form controls lebih baik)
- Magic UI level C (bebas selama tetap profesional untuk aplikasi internal pemerintahan)
- Pendekatan eksekusi: **Phased dengan human checkpoint** (Pendekatan 2) + kemungkinan worktree + subagent untuk fase independen.

Fondasi sudah cukup matang dari pekerjaan sebelumnya (design tokens shadcn-style, beberapa komponen ui/, cn util, framer-motion, lucide-react, partial migrasi ke Button/Card/Badge). Tugas utama adalah inisialisasi resmi shadcn, konsolidasi total, penggantian legacy Breeze component, dan integrasi Magic UI yang bernilai.

---

## Tujuan (Goals)

- Seluruh UI/UX (100%) menggunakan **shadcn/ui** sebagai base component system.
- Inisialisasi resmi `components.json` agar penambahan komponen di masa depan standar dan maintainable.
- Ganti **semua** legacy Breeze custom component (PrimaryButton, TextInput, InputLabel, old Modal, dll.).
- Ganti UI ScheduleEditModal menjadi shadcn Dialog + kontrol form yang lebih baik (shadcn Select/Command), sambil mempertahankan **100% logic eligibility petugas** (jenis_jabatan, jenis_pegawai, gender).
- Integrasikan **Magic UI level C** secara profesional: magic-card, bento-grid, animated-list, shine-border, blur-fade, shimmer/shiny button, interactive-hover-button, dll.
- Hasil akhir: UI jauh lebih konsisten, modern, accessible, dan menyenangkan secara visual, tanpa mengubah perilaku fungsional pengguna sedikit pun.
- Ikuti prinsip: YAGNI, KISS, SOLID, Laravel Boost, Inertia v2 best practices, full Bahasa Indonesia.

## Non-Goals (Tidak Dilakukan)

- Menambah fitur baru.
- Mengubah logic bisnis apapun (termasuk filtering petugas di modal).
- Mengubah routing, controller, model, atau data flow (kecuali sangat minimal untuk mendukung Inertia `<Form>` v2).
- Mengaktifkan dark mode penuh (tetap light-only sesuai keputusan sebelumnya; token sudah siap).
- Rewrite total tanpa memanfaatkan fondasi existing (tokens, beberapa ui/ component, framer-motion).
- Mengubah desain role emoji + warna (ini adalah kekuatan domain yang dipertahankan).

## Pendekatan Eksekusi yang Dipilih

**Pendekatan 2: Phased dengan Human Checkpoint** (direkomendasikan dan disetujui).

Alasan:
- Risiko rendah untuk sistem yang sudah berjalan.
- Mudah rollback per fase.
- Sesuai Superpowers workflow (executing-plans + checkpoints).
- Bisa percepat dengan isolated worktree + dispatching subagent untuk fase independen.

**Fase yang direncanakan (akan dipecah lebih detail di writing-plans):**
1. Foundation (shadcn init resmi, components.json, standarisasi Tailwind, core primitives baru).
2. Layouts + Navigation + Auth pages + GuestLayout + Welcome.
3. Core application (Dashboard + Schedules + partials + **ScheduleEditModal full replace**).
4. Profile + Magic UI enhancements level C + final cleanup legacy component.
5. Verification menyeluruh + finishing.

Setiap fase besar akan menggunakan git worktree terisolasi. Verifikasi (pint, build, test, manual flow) wajib di akhir setiap fase sebelum lanjut.

---

## Strategi Komponen & Inisialisasi Shadcn

### Inisialisasi Resmi
- Jalankan `npx shadcn@latest init` (atau equivalent via MCP) untuk membuat `components.json`.
- Pilih style: **New York** (modern & clean).
- Aliases yang akan dikonfigurasi:
  - components: `@/Components/ui`
  - utils: `@/lib/utils`
  - lib: `@/lib`
- Tailwind: Perbaiki inkonsistensi antara tailwindcss ^3 + @tailwindcss/vite ^4. Standarisasi ke konfigurasi yang stabil (pertahankan semantic tokens yang sudah bagus: primary, danger, success, muted, card, dll. + magicui animations).

### Komponen Shadcn yang Akan Ditambahkan (minimal)
- dialog + alert-dialog (pengganti utama custom Modal & ConfirmDialog)
- select / command (untuk user picker di modal & form lain)
- skeleton (untuk loading states yang lebih baik)
- popover (jika diperlukan)
- table (opsional untuk future list, jika relevan)

Semua komponen baru akan menggunakan:
- `cn()` utility (sudah ada)
- Semantic design tokens (sudah di-extend di tailwind.config & app.css)
- Lucide icons (sudah ada)
- Framer-motion untuk animasi halus (sudah ada)

### Legacy Component yang Akan Dihapus (setelah migrasi penuh)
- PrimaryButton, SecondaryButton, DangerButton
- TextInput, InputLabel, Checkbox (lama)
- Custom Modal.jsx (setelah semua consumer pindah)
- Komponen lama lain yang tidak dipakai lagi

---

## Pilihan Magic UI Level C (Profesional)

Dari magicuidesign-mcp registry, komponen yang dipilih untuk level C (bebas tapi tetap serius untuk app internal pemerintahan):

**Akan diintegrasikan (high-value):**
- `magic-card` — spotlight hover effect (sangat cocok untuk ScheduleCard dan stat cards Dashboard)
- `bento-grid` — organisasi stats/features yang lebih elegan (Dashboard & Welcome)
- `animated-list` — sequential reveal untuk daftar jadwal terbaru / upcoming / failed notifications
- `shine-border` / `border-beam` — highlight pada status penting (failed notif, action required)
- `blur-fade` — transisi smooth pada modal, list, empty state, dan page transitions
- `shimmer-button` / `shiny-button` / `interactive-hover-button` — varian tombol utama (ekstensi dari button "magic" existing)

**Akan dihindari:**
- Efek berlebihan seperti confetti, neon gradient berat, dock, globe, typing animation yang mencolok, dll.

Magic UI akan ditambahkan secara bertahap di Fase 4, setelah fondasi shadcn stabil. Semua efek harus accessible dan tidak mengganggu performa.

---

## Strategi Migrasi Detail

### 1. ScheduleEditModal (Kritis)
- Ganti base menjadi shadcn `Dialog`.
- Pertahankan **exact** logic `getFilteredUsers` dan kriteria eligibility (port ke dalam komponen baru atau util terpisah).
- UI baru:
  - Header + info jadwal menggunakan Card primitives + magicui subtle.
  - Setiap role dalam card yang lebih modern (magic-card atau shine-border ringan).
  - User selector: shadcn `Select` atau `Command` (searchable) untuk UX yang jauh lebih baik daripada native select.
  - Action buttons menggunakan shadcn Button dengan variant yang sudah ada.
- Loading, error, dan post-save behavior (`router.reload()`) tetap identik 100%.
- Pastikan keyboard navigation & focus management bekerja dengan baik (shadcn Dialog sudah kuat di a11y).

### 2. Forms (Auth, Profile, Generator, dll.)
- Migrasi ke `<Form action="..." method="post">` Inertia v2 sebanyak mungkin (dengan `resetOnSuccess`, dll.).
- Gunakan shadcn Input, Label, Button, dan error handling yang konsisten.
- Pertahankan icon lucide untuk visual affordance (sudah bagus di Login).

### 3. Layouts & Navigation
- Perbarui AuthenticatedLayout & GuestLayout dengan shadcn Card, Button, dan struktur yang lebih clean.
- Mobile navigation bisa ditingkatkan dengan Sheet jika dianggap perlu (tetap sederhana).

### 4. Pages Lain
- Dashboard: Gunakan bento-grid untuk stats, magic-card untuk upcoming/recent, shine effects pada alert.
- Schedules: ScheduleCard sudah bagus — tingkatkan dengan magic-card + animated-list untuk list.
- Welcome: Tingkatkan hero & feature cards dengan bento-grid + subtle magicui.
- Auth & Profile: Full shadcn + konsisten Bahasa Indonesia.

### 5. Cleanup
- Hapus file & import legacy setelah semua page bermigrasi dan diverifikasi.
- Update jsconfig alias jika diperlukan.

---

## Daftar Perubahan File (High-Level)

**Konfigurasi:**
- `components.json` (baru — via init)
- `tailwind.config.js`, `vite.config.js`, `resources/css/app.css` (perbaikan & standarisasi)
- `package.json` (mungkin tambah dependency jika shadcn/magicui butuh)

**Komponen Baru / Update:**
- Tambah banyak di `resources/js/Components/ui/`
- Rewrite besar: `Components/ScheduleEditModal.jsx`
- Migrasi: `Components/ConfirmDialog.jsx`
- Hapus: PrimaryButton, TextInput, InputLabel, old Modal, SecondaryButton, DangerButton, dll.

**Layouts:**
- `Layouts/AuthenticatedLayout.jsx`
- `Layouts/GuestLayout.jsx`

**Pages (semua disentuh):**
- `Pages/Auth/*` (semua)
- `Pages/Dashboard.jsx`
- `Pages/Schedules/Index.jsx` + `partials/*`
- `Pages/Profile/Partials/*`
- `Pages/Welcome.jsx`

**Util & Lainnya:**
- `utils/roles.js` (mungkin tambah helper)
- Update semua import terkait

Total estimasi: 25–35 file terpengaruh.

---

## Verification & Quality Gates

**Wajib di setiap perubahan / akhir fase:**
- `vendor/bin/pint --dirty`
- `npm run build` (no Vite error)
- `php artisan test --compact` (minimal test terkait + regression)
- Manual flow testing lengkap (login → dashboard → jadwal → edit petugas → broadcast → profile)
- Khusus modal: verifikasi semua 6 peran + kombinasi jabatan/gender yang kompleks tetap bekerja identik.

**Di akhir proyek keseluruhan:**
- Full test suite
- Playwright e2e (jika environment memungkinkan)
- Visual + a11y review (focus, contrast, keyboard, screen reader spot check)
- Cleanup worktree & branch

Kami akan menggunakan `todo_write` untuk tracking, dan shadcn + magicui MCP untuk mengambil kode komponen yang akurat.

---

## Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Regresi logic eligibility petugas di modal | Port logic terlebih dahulu ke util murni, test manual sangat ketat, verifikasi exhaustive sebelum commit fase |
| Perubahan visual terlalu besar sekaligus | Phased approach + human checkpoint di setiap fase |
| Magic UI level C menambah bundle size | Hanya import komponen yang benar-benar dipakai, manfaatkan tree-shaking |
| Tailwind v3/v4 conflict | Selesaikan di Fase 1 Foundation sebelum menyentuh UI |
| Breaking perubahan di banyak halaman sekaligus | Gunakan worktree terisolasi, verifikasi build & test di setiap langkah |

---

## Langkah Selanjutnya (setelah spec ini disetujui)

1. User mereview file spec ini.
2. Invoke `writing-plans` skill untuk memecah menjadi micro-task plan detail (dengan TDD, file paths, acceptance criteria).
3. Buat isolated git worktree.
4. Eksekusi fase-per-fase dengan checkpoint.
5. Verification-before-completion di setiap milestone penting.
6. Finishing-a-development-branch di akhir.

---

**Catatan Tambahan:**
- Semua komunikasi dan komentar kode tetap dalam Bahasa Indonesia.
- Ikuti CLAUDE.md, AGENTS.md, dan Laravel Boost guidelines secara ketat (termasuk search-docs jika diperlukan, pint, test enforcement).
- Manfaatkan MCP tools (shadcn, magicuidesign-mcp, laravel-boost) selama implementasi.

Spec ini adalah hasil dari proses brainstorming penuh Superpowers. Siap untuk ditinjau dan dilanjutkan ke implementation plan.