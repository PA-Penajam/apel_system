import { Form } from "@inertiajs/react";

/**
 * GeneratorSection
 *
 * Diekstrak dari Schedules/Index.jsx (Task 11 - split monolitik).
 * Komponen ini bertanggung jawab penuh atas section "Generate Jadwal Baru".
 *
 * Isi:
 * - Header gradient biru-indigo dengan icon, judul, dan deskripsi.
 * - Form Inertia v2 <Form> (direkomendasikan) dengan dua input date (start_date, end_date).
 * - Validasi error ditampilkan di bawah input dengan a11y (id, aria, role=alert).
 * - Tombol submit besar dengan loading spinner dan ikon.
 *
 * Tidak ada state lokal (useForm dihapus di Fase sebelumnya; <Form> menangani processing/errors/resetOnSuccess secara deklaratif).
 * Semua class Tailwind, aria, focus states, dan visual dipertahankan 100% identik.
 * Design token (bg-surface, text-danger, focus:ring-primary, ring-offset-...) digunakan sesuai update Fase 3.
 *
 * Dipanggil tanpa props dari coordinator Index.jsx.
 */
export default function GeneratorSection() {
    return (
        <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100">
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⚙️</span>
                    <div>
                        <h3 className="text-2xl font-bold">
                            Generate Jadwal Baru
                        </h3>
                        <p className="text-blue-100 text-sm">
                            Buat jadwal otomatis dengan distribusi
                            petugas yang merata
                        </p>
                    </div>
                </div>

                {/* Form generator — dimigrasikan ke Inertia v2 <Form> (rekomendasi resmi).
                    Pakai declarative <Form action={route('schedules.generate')} method="post"> + input dengan name (bukan controlled useForm).
                    Render children sebagai function untuk akses processing & errors (sesuai pola di CLAUDE.md & Inertia docs).
                    resetOnSuccess untuk clear otomatis setelah sukses (UX baik untuk form one-shot seperti ini).
                    Perbaikan visual & a11y Fase 3:
                    - Label pakai text-white (kontras tinggi di atas gradient).
                    - Input pakai bg-surface (putih solid) + text gelap agar sangat mudah dibaca (atasi isu "sulit dibaca" di review).
                    - Gunakan token danger untuk error message (lebih standout dibanding red-300).
                    - Focus state pakai ring-primary + offset agar visible di gradient.
                    - Tambah id + htmlFor + aria-describedby + role=alert untuk aksesibilitas screen reader.
                    - Tombol submit tetap inverted putih (identitas visual gradient tetap), tapi ditambah focus ring yang jelas.
                    Header gradient + icon + deskripsi tetap utuh (YAGNI, tidak redesign penuh). */}
                <Form
                    action={route("schedules.generate")}
                    method="post"
                    resetOnSuccess
                    className="flex flex-col sm:flex-row gap-4 items-end"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="w-full sm:w-auto flex-1">
                                <label
                                    htmlFor="start_date"
                                    className="block text-sm font-medium text-white mb-1"
                                >
                                    Tanggal Mulai
                                </label>
                                <input
                                    id="start_date"
                                    type="date"
                                    name="start_date"
                                    className="w-full rounded-lg bg-surface text-gray-900 placeholder:text-gray-400 border border-white/40 focus:border-primary focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-indigo-700 shadow-sm"
                                    aria-label="Tanggal mulai untuk generate jadwal apel"
                                    aria-describedby={
                                        errors.start_date
                                            ? "error-start-date"
                                            : undefined
                                    }
                                />
                                {errors.start_date && (
                                    <div
                                        id="error-start-date"
                                        className="text-danger text-sm mt-1 font-medium"
                                        role="alert"
                                    >
                                        {errors.start_date}
                                    </div>
                                )}
                            </div>
                            <div className="w-full sm:w-auto flex-1">
                                <label
                                    htmlFor="end_date"
                                    className="block text-sm font-medium text-white mb-1"
                                >
                                    Tanggal Selesai
                                </label>
                                <input
                                    id="end_date"
                                    type="date"
                                    name="end_date"
                                    className="w-full rounded-lg bg-surface text-gray-900 placeholder:text-gray-400 border border-white/40 focus:border-primary focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-indigo-700 shadow-sm"
                                    aria-label="Tanggal selesai untuk generate jadwal apel"
                                    aria-describedby={
                                        errors.end_date
                                            ? "error-end-date"
                                            : undefined
                                    }
                                />
                                {errors.end_date && (
                                    <div
                                        id="error-end-date"
                                        className="text-danger text-sm mt-1 font-medium"
                                        role="alert"
                                    >
                                        {errors.end_date}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
                            >
                                {processing ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        Generate Jadwal
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
