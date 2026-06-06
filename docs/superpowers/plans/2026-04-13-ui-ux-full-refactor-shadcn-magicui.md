# UI/UX Full Refactor - Shadcn + Magic UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melakukan refactor total seluruh antarmuka pengguna proyek apel_system menjadi berbasis shadcn/ui sebagai foundation + Magic UI untuk polish visual dan interaksi tingkat C (profesional, expressive tapi cocok internal pemerintahan), termasuk inisialisasi resmi shadcn, penggantian semua legacy Breeze component, rewrite penuh ScheduleEditModal dengan preservasi 100% logic eligibility, dan integrasi Magic UI di tempat yang memberikan nilai.

**Architecture:** Pendekatan phased (5 fase) dengan human checkpoint di akhir setiap fase besar, menggunakan isolated git worktree untuk safety. Setiap perubahan UI mengikuti TDD-style (e2e Playwright untuk flow kritis + manual verification + build/lint), memanfaatkan fondasi existing (design tokens, cn util, framer-motion, lucide, partial shadcn ui/). Semua perilaku user (termasuk complex filtering di modal) dipertahankan 100%. Magic UI ditambahkan secara bertahap di fase akhir.

**Tech Stack:** 
- Laravel 12 + Inertia.js v2 + React 18 (JSX)
- Tailwind CSS 3 (dengan semantic tokens shadcn-style + magicui animations)
- shadcn/ui (New York style via official init + MCP)
- Magic UI components (via magicuidesign-mcp)
- framer-motion, lucide-react (sudah ada)
- Playwright untuk e2e verification
- Laravel Pint, phpunit, npm run build untuk quality gates

---

## Phase 0: Persiapan & Worktree (Sebelum mulai eksekusi)

**Files:**
- (worktree creation)

- [ ] **Step 0.1: Buat isolated git worktree untuk pekerjaan ini**
  ```bash
  git worktree add ../apel_system-ui-refactor -b feat/ui-ux-full-refactor-shadcn-magicui
  cd ../apel_system-ui-refactor
  ```
  Expected: Worktree bersih, branch baru dibuat, siap untuk perubahan tanpa mengganggu main.

- [ ] **Step 0.2: Verifikasi baseline bersih**
  Run: `git status`, `npm run build`, `vendor/bin/pint --dirty`, `php artisan test --compact --filter=Schedule`
  Expected: Clean, build sukses, tests terkait pass. Catat hash commit baseline.

- [ ] **Step 0.3: Baca spec dan rencana ini secara penuh**
  Baca: `docs/superpowers/specs/2026-04-13-ui-ux-shadcn-magicui-full-refactor-design.md` dan file plan ini.
  Pastikan paham: scope A total, modal logic 100% preserve, Magic UI level C (hanya komponen yang disetujui), phased dengan checkpoint.

---

## Phase 1: Foundation - Shadcn Init, Config, Core Primitives

**Goal fase ini:** Inisialisasi resmi shadcn, perbaiki konfigurasi Tailwind/vite, tambah komponen shadcn dasar (dialog, select, skeleton, dll.), pastikan existing tokens tetap berfungsi, tambah beberapa Magic UI base jika diperlukan.

**Files:**
- Create: `components.json`
- Modify: `tailwind.config.js`, `vite.config.js`, `resources/css/app.css`, `package.json` (jika perlu)
- Create/Modify: `resources/js/Components/ui/dialog.jsx`, `alert-dialog.jsx`, `select.jsx`, `command.jsx`, `skeleton.jsx`, `popover.jsx` (via shadcn add)
- Create: `resources/js/Components/ui/magic-card.jsx` dll (via magicui MCP, sesuaikan ke .jsx)
- Modify: `resources/js/lib/utils.js` (jika perlu extend)

- [ ] **Step 1.1: Jalankan shadcn init resmi (New York style)**
  ```bash
  npx shadcn@latest init
  ```
  Jawab pertanyaan:
  - TypeScript: No (project pakai JSX)
  - Style: new-york
  - Tailwind config: tailwind.config.js (existing)
  - CSS file: resources/css/app.css
  - Aliases: @/Components/ui dan @/lib/utils (sesuaikan dengan jsconfig)
  Expected: components.json dibuat dengan konfigurasi benar. Review file dan commit jika OK.

- [ ] **Step 1.2: Perbaiki Tailwind + Vite config untuk konsistensi shadcn + Magic UI**
  Baca current tailwind.config.js dan vite.config.js.
  Pastikan:
  - content mencakup semua .jsx
  - CSS variables di app.css tetap (primary indigo brand, magicui shine/fade-in sudah ada)
  - Vite tidak conflict dengan @tailwindcss/vite ^4 vs tailwind ^3. Standarisasi ke pendekatan yang stabil (pertahankan config existing yang sudah bagus).
  Modify files seperlunya.
  Run: `npm run build`
  Expected: Build sukses, tidak ada error CSS.

- [ ] **Step 1.3: Tambah komponen shadcn inti via CLI/MCP**
  Gunakan shadcn MCP atau:
  ```bash
  npx shadcn@latest add dialog alert-dialog select command skeleton popover
  ```
  Expected: File .jsx baru di resources/js/Components/ui/ dengan forwardRef, cn(), dan menggunakan token existing.
  Commit: "chore: add core shadcn dialog, select, skeleton, etc."

- [ ] **Step 1.4: Tambah Magic UI komponen pilihan level C via MCP**
  Gunakan magicuidesign-mcp__getRegistryItem atau search untuk:
  - magic-card
  - bento-grid
  - animated-list
  - shine-border
  - blur-fade
  - shimmer-button / interactive-hover-button
  Copy code ke resources/js/Components/ui/ (sesuaikan import ke .jsx, pastikan pakai framer-motion & cn yang sudah ada).
  Buat index export jika perlu.
  Run build.
  Expected: Komponen berfungsi tanpa error.

- [ ] **Step 1.5: Verifikasi Foundation**
  - `vendor/bin/pint --dirty`
  - `npm run build`
  - Buka app, cek tidak ada visual breakage di halaman existing (gunakan existing ui/button & card masih work).
  - Manual: cek design tokens masih apply (primary color indigo).
  Commit: "feat: foundation shadcn init + magicui base + config cleanup"

**Checkpoint Fase 1:** Review dengan user (atau subagent review). Hanya lanjut jika build + manual OK.

---

## Phase 2: Layouts, Auth Pages, Guest, Welcome

**Goal:** Ganti semua komponen legacy di layout dan halaman auth/public. Migrasi ke shadcn primitives + Inertia <Form> v2. Tambah subtle Magic UI.

**Files:**
- Modify: `resources/js/Layouts/AuthenticatedLayout.jsx`, `GuestLayout.jsx`
- Modify: `resources/js/Pages/Auth/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `ConfirmPassword.jsx`, `VerifyEmail.jsx`
- Modify: `resources/js/Pages/Welcome.jsx`
- Delete (nanti di akhir): PrimaryButton.jsx, TextInput.jsx, InputLabel.jsx, Checkbox.jsx (setelah tidak dipakai)
- Test: playwright tests untuk auth flows (jika ada atau buat baru)

- [ ] **Step 2.1: Extract & update shared form primitives**
  Buat/update ui/input.jsx, ui/label.jsx, ui/button.jsx (sudah ada sebagian, extend dengan variant magic/shimmer jika cocok).
  Pastikan support icon (seperti di Login saat ini).

- [ ] **Step 2.2: Migrasi GuestLayout**
  Ganti custom card dengan shadcn Card + magicui subtle (blur-fade pada mount).
  Modify: resources/js/Layouts/GuestLayout.jsx
  Run build + manual check login/register page.

- [ ] **Step 2.3: Migrasi Login (sudah sebagian shadcn)**
  Selesaikan full ke shadcn Input/Label/Button + <Form> Inertia jika memungkinkan.
  Tambah shimmer-button pada submit jika cocok level C.
  Write e2e test dasar untuk login flow (Playwright).
  Run: npx playwright test --grep=login
  Expected: Test pass setelah implement.

- [ ] **Step 2.4: Migrasi Register, Forgot, Reset, ConfirmPassword, VerifyEmail**
  Untuk setiap file:
  - Ganti semua PrimaryButton → Button shadcn (variant default)
  - Ganti TextInput + InputLabel → shadcn equivalents
  - Perbaiki label ke Bahasa Indonesia penuh (sudah ada di beberapa)
  - Gunakan Inertia <Form> v2
  - Tambah icon lucide jika relevan
  Commit per file atau per 2 file.
  Run build + e2e/manual setelah setiap.

- [ ] **Step 2.5: Migrasi Welcome.jsx**
  Tingkatkan feature cards menjadi bento-grid.
  Hero CTA pakai shiny-button atau interactive-hover.
  Role grid tetap pakai emoji + ROLE_COLORS (jangan ubah), tapi wrap dengan magic-card subtle.
  Preserve semua text dan logic.

- [ ] **Step 2.6: Migrasi AuthenticatedLayout (nav + header)**
  Ganti dropdown & nav link styling ke shadcn style (gunakan Button ghost/outline jika perlu).
  Mobile hamburger tetap fungsional.
  Tambah subtle animation (fade-in atau blur-fade pada content).

- [ ] **Step 2.7: Verifikasi Phase 2**
  - Full auth flow manual + Playwright (login, register, forgot, reset)
  - Welcome page visual
  - `npm run build`, `pint --dirty`, relevant tests
  - Tidak ada regression di layout
  Commit: "feat: migrate layouts, auth pages, welcome to shadcn + magicui subtle"

**Checkpoint Fase 2:** User / reviewer approve sebelum lanjut ke core app (fase paling kritis).

---

## Phase 3: Core Application - Dashboard, Schedules, ScheduleEditModal (Kritis)

**Goal:** Migrasi Dashboard & Schedules. **Rewrite penuh ScheduleEditModal** dengan shadcn Dialog + Command/Select searchable, port exact logic filtering dari getRoleCriteria + getFilteredUsers. Tambah Magic UI bernilai (magic-card, animated-list, shine-border).

**Files:**
- Modify: `resources/js/Pages/Dashboard.jsx`
- Modify: `resources/js/Pages/Schedules/Index.jsx`
- Modify: `resources/js/Pages/Schedules/partials/GeneratorSection.jsx`, `ScheduleCard.jsx`, `FonntePanel.jsx`, `Legend.jsx`
- **Rewrite besar:** `resources/js/Components/ScheduleEditModal.jsx` → gunakan Dialog, pertahankan logic
- Modify: `resources/js/Components/ConfirmDialog.jsx` (migrasi ke AlertDialog)
- Modify: `resources/js/utils/roles.js` (jika perlu extract pure filter function untuk testability)
- Test: Playwright untuk schedule generate, edit petugas, broadcast (paling penting)

- [ ] **Step 3.1: Extract pure logic dari roles.js untuk testability**
  Extract getRoleCriteria dan logic filtering ke pure functions.
  Jika memungkinkan, tambah simple JS test (atau document dan verifikasi via e2e).
  Pastikan ScheduleEditModal nanti import dari sini.

- [ ] **Step 3.2: Migrasi Dashboard.jsx**
  Stats cards → bento-grid + magic-card dengan whileHover framer.
  Failed notifications alert → shine-border.
  Upcoming & Recent list → animated-list.
  Quick actions pakai Button shadcn + magic shimmer jika cocok.
  Ganti custom Modal detail dengan shadcn Dialog.
  Preserve semua data & behavior.

- [ ] **Step 3.3: Migrasi ScheduleCard.jsx & partials Schedules**
  ScheduleCard: wrap dengan magic-card, tambah shine-border pada status tertentu.
  Buttons sudah pakai shadcn + lucide — tingkatkan dengan interactive-hover.
  FonntePanel, GeneratorSection, Legend: ganti sisa legacy ke shadcn, gunakan <Form> jika ada form.
  Animated list untuk daftar jadwal jika cocok.

- [ ] **Step 3.4: Rewrite ScheduleEditModal (tugas paling kritis - lakukan hati-hati)**
  **Langkah detail:**
  1. Buat versi baru menggunakan shadcn Dialog sebagai root.
  2. Port exact code dari getFilteredUsers + handleUserChange + handleSave + useEffect (jangan ubah logic sedikit pun).
  3. Untuk setiap role: gunakan Card + magic-card atau shine.
  4. User selector: implement shadcn Command (searchable) atau Select dengan filter. Pastikan filtered list sama persis dengan original.
  5. Loading spinner, error display, save button pakai shadcn Button + status.
  6. Close behavior & router.reload() identik.
  Tulis e2e test terlebih dahulu untuk edit petugas flow (6 peran, berbagai jabatan/gender).
  Run e2e → fail → implement → run pass.
  Verifikasi manual semua kombinasi kriteria di getRoleCriteria.

- [ ] **Step 3.5: Migrasi ConfirmDialog ke AlertDialog shadcn**
  Ganti implementasi internal, pertahankan API props (show, onClose, onConfirm, title, message, isDanger).
  Update semua pemanggil (Dashboard, Schedules).

- [ ] **Step 3.6: Verifikasi Phase 3 (sangat ketat)**
  - Playwright test lengkap untuk: generate jadwal, broadcast, edit petugas (termasuk kasus tidak eligible), force-send, reset.
  - Manual exhaustive: semua 6 role di modal, berbagai user type.
  - `npm run build`, pint, php artisan test --compact
  - Tidak ada perubahan behavior (data yang tersimpan sama, notif sama).
  Commit: "feat: core app migrated + critical ScheduleEditModal rewrite with 100% logic preserved"

**Checkpoint Fase 3:** WAJIB user approval + full verification sebelum lanjut. Ini adalah bagian paling berisiko.

---

## Phase 4: Profile, Magic UI Polish, Final Cleanup

**Goal:** Selesaikan Profile forms. Tambah Magic UI lebih ekspresif di tempat yang sudah disetujui. Hapus semua legacy component. Final polish.

**Files:**
- Modify: `resources/js/Pages/Profile/Edit.jsx` + Partials (DeleteUserForm, UpdatePasswordForm, UpdateProfileInformationForm)
- Tambah Magic UI di Dashboard/Schedules/Welcome jika belum penuh (bento, animated-list, dll.)
- Delete: PrimaryButton.jsx, TextInput.jsx, InputLabel.jsx, Modal.jsx, DangerButton.jsx, SecondaryButton.jsx, Checkbox.jsx (setelah grep konfirmasi 0 usage)
- Update imports di semua tempat.

- [ ] **Step 4.1: Migrasi Profile forms**
  Ganti semua InputLabel + TextInput + DangerButton ke shadcn.
  Gunakan Dialog shadcn untuk delete confirmation.
  Konsisten Bahasa Indonesia.
  Tambah subtle Magic UI (misal success state dengan blur-fade).

- [ ] **Step 4.2: Tambah Magic UI polish level C di halaman utama**
  - Dashboard: pastikan bento-grid + magic-card + animated-list + shine-border pada alert.
  - Schedules: ScheduleCard pakai magic-card, list pakai animated-list.
  - Welcome: bento-grid untuk fitur.
  - Button utama: shimmer atau interactive-hover.
  Test visual & build.

- [ ] **Step 4.3: Cleanup legacy components & imports**
  Grep seluruh codebase untuk memastikan 0 reference ke komponen lama.
  Hapus file-file tersebut.
  Run build untuk pastikan tidak ada import error.
  Commit: "chore: remove all legacy Breeze components"

- [ ] **Step 4.4: Verifikasi Phase 4**
  Full manual flow + e2e untuk profile update & delete.
  Build + lint + tests.
  Commit.

**Checkpoint Fase 4**

---

## Phase 5: Verification, Polish, Finishing

**Goal:** Full quality gates, a11y review, documentation jika perlu, cleanup worktree.

**Files:**
- playwright tests (update/extend jika perlu)
- Mungkin update README atau docs jika relevan (tapi YAGNI — minimal)

- [ ] **Step 5.1: Full verification suite**
  ```bash
  vendor/bin/pint --dirty
  npm run build
  php artisan test --compact
  npx playwright test
  ```
  Expected: Semua hijau.

- [ ] **Step 5.2: Manual end-to-end user journey**
  - Login → Dashboard (stats, upcoming, actions)
  - Generate jadwal
  - Edit petugas (semua 6 role + edge cases)
  - Broadcast & manual send
  - Fonnte panel
  - Profile update & delete account
  - Welcome (jika public)
  Catat screenshot atau catatan jika ada issue kecil.

- [ ] **Step 5.3: A11y & visual spot check**
  - Keyboard navigation di modal edit & form
  - Focus ring visible (shadcn sudah bagus)
  - Contrast (primary indigo di background terang)
  - Screen reader labels (role, buttons)
  - Mobile responsive (nav, cards)

- [ ] **Step 5.4: Final commit & cleanup**
  Commit semua perubahan.
  `git worktree remove ../apel_system-ui-refactor` (setelah merge atau PR jika ada).
  Update todo list atau spec jika diperlukan.

- [ ] **Step 5.5: Finishing-a-development-branch**
  Ikuti skill: verifikasi semua test pass, present opsi (merge, PR, keep, discard), cleanup.

---

## Ringkasan & Notes untuk Implementer

- **Selalu ikuti TDD mini-cycle** untuk perubahan logika & UI kritis (terutama modal).
- **Jangan pernah ubah logic getRoleCriteria atau filtering** tanpa explicit approval — ini adalah single source of truth.
- Manfaatkan **shadcn MCP** dan **magicuidesign-mcp** untuk mengambil component code terbaru dan contoh.
- Gunakan `todo_write` di setiap fase untuk tracking progress.
- Setiap commit harus atomic dan punya pesan jelas dalam Bahasa Indonesia jika memungkinkan.
- Jika menemukan issue di spec, catat dan tanyakan sebelum lanjut.
- Setelah setiap fase besar: pause untuk human review (atau subagent review + main agent approval).

**Plan ini dibuat berdasarkan spec yang disetujui 2026-04-13.** Setiap task traceable ke section di spec.

---

## Self-Review of This Plan (dilakukan setelah tulis)

1. **Spec coverage:** Semua section spec tercover:
   - Foundation & init → Phase 1
   - Layouts/Auth/Welcome → Phase 2
   - Core + ScheduleEditModal 100% logic → Phase 3 (detail)
   - Profile + Magic UI C + cleanup → Phase 4
   - Verification & finishing → Phase 5
   - Phased dengan checkpoint & worktree → seluruh plan + Phase 0
   - Magic UI spesifik → Phase 1 & 4
   - Risks (modal logic) → explicit di Phase 3 & mitigations

2. **Placeholder scan:** Tidak ada "TBD", "implement later", "add error handling" tanpa detail. Setiap step punya command atau code konkret.

3. **Granularity:** Kebanyakan task 2-10 menit (satu file, satu perubahan, satu verifikasi).

4. **TDD & verification:** Hampir setiap task punya "write/run test → implement → run pass → commit".

5. **No duplication:** Logic modal dijelaskan sekali di Phase 3, di-reference di verifikasi.

Plan siap dieksekusi. 

**Plan complete and saved to `docs/superpowers/plans/2026-04-13-ui-ux-full-refactor-shadcn-magicui.md`.**

Dua execution options:

**1. Subagent-Driven (recommended)** - Saya dispatch fresh subagent per task, two-stage review (spec compliance + code quality), cepat dan parallel untuk fase independen.

**2. Inline Execution** - Execute tasks di session ini menggunakan executing-plans skill, batch dengan human checkpoints per fase.

Pilihan mana yang Anda inginkan? Atau ada revisi plan dulu?