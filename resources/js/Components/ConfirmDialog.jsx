import { useEffect, useState } from "react";
import Modal from "@/Components/Modal";

/**
 * Komponen ConfirmDialog (SweetAlert-style Modal).
 *
 * Reusable confirmation dialog with stable content during enter/leave transitions,
 * loading spinner support, and clear danger/info icons.
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
    processing = false,
}) {
    // Preserve display content during enter and exit transitions so text/colors don't flash blank
    const [displayContent, setDisplayContent] = useState({
        title,
        message,
        isDanger,
        confirmText,
    });

    useEffect(() => {
        if (show) {
            setDisplayContent({
                title: title || "Konfirmasi",
                message: message || "",
                isDanger: Boolean(isDanger),
                confirmText: confirmText || "Konfirmasi",
            });
        }
    }, [show, title, message, isDanger, confirmText]);

    const handleConfirm = () => {
        if (typeof onConfirm === "function") {
            onConfirm();
        }
    };

    const confirmButtonClasses = displayContent.isDanger
        ? "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors font-medium text-sm flex items-center gap-2"
        : "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium text-sm flex items-center gap-2";

    return (
        <Modal show={show} onClose={onClose} maxWidth="md" closeable={!processing}>
            <div className="p-6">
                {/* Header with Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div
                        className={`p-2.5 rounded-full flex-shrink-0 ${
                            displayContent.isDanger
                                ? "bg-red-100 text-red-600"
                                : "bg-indigo-100 text-indigo-600"
                        }`}
                    >
                        {displayContent.isDanger ? (
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
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        ) : (
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
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {displayContent.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                            {displayContent.message}
                        </p>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={processing}
                        className={`${confirmButtonClasses} disabled:opacity-50`}
                    >
                        {processing && (
                            <svg
                                className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        )}
                        {displayContent.confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
