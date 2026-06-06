import Modal from "@/Components/Modal";

/**
 * Komponen ConfirmDialog.
 *
 * Dialog konfirmasi reusable berbasis Modal (Headless UI) untuk menggantikan window.confirm().
 * Mendukung aksi normal dan danger (destruktif).
 *
 * Props:
 * - show: boolean — kontrol visibilitas
 * - onClose: function — dipanggil saat menutup (overlay, tombol X, atau Batal)
 * - onConfirm: function — dipanggil saat tombol konfirmasi diklik, kemudian dialog otomatis ditutup
 * - title: string — judul dialog
 * - message: string — isi pesan konfirmasi (bisa multiline)
 * - confirmText: string — teks tombol konfirmasi (default: "Konfirmasi")
 * - cancelText: string — teks tombol batal (default: "Batal")
 * - isDanger: boolean — jika true, tombol konfirmasi berwarna merah
 */
export default function ConfirmDialog({
    show = false,
    onClose = () => {},
    onConfirm,
    title = "Konfirmasi",
    message = "",
    confirmText = "Konfirmasi",
    cancelText = "Batal",
    isDanger = false,
}) {
    const handleConfirm = () => {
        if (typeof onConfirm === "function") {
            onConfirm();
        }
        onClose();
    };

    const confirmButtonClasses = isDanger
        ? "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        : "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";

    return (
        <Modal show={show} onClose={onClose} maxWidth="md" closeable>
            <div className="p-6">
                {/* Header dengan judul dan tombol tutup */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Tutup dialog konfirmasi"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Area pesan */}
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {message}
                </div>

                {/* Footer dengan dua tombol */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={confirmButtonClasses}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
