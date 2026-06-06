import { useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";

/**
 * FonntePanel
 *
 * Diekstrak dari Schedules/Index.jsx (Task 11 - split monolitik).
 * Komponen mandiri untuk seluruh section "Status Fonnte WhatsApp".
 *
 * Tanggung jawab:
 * - Dua tombol aksi: Test Koneksi & Cek Kuota (menggunakan PrimaryButton dengan variant, sudah distandarisasi Fase 3).
 * - Local state: checkingFonnte, fonnteStatus, quotaStatus (sebelumnya di Index, sekarang dienkapsulasi di sini karena tidak dibagi ke komponen lain).
 * - Handler fetch ke /fonnte/test dan /fonnte/quota (XHR, credentials same-origin).
 * - Render conditional result boxes untuk status koneksi (success/error + device info) dan kuota (remaining/total/expired).
 *
 * Semua logic, loading spinner inline, class warna (green/red/blue), dan teks Bahasa Indonesia dipertahankan persis.
 * Tidak ada props; sepenuhnya self-contained.
 * Dipanggil dari coordinator Index.jsx.
 */
export default function FonntePanel() {
    const [fonnteStatus, setFonnteStatus] = useState(null);
    const [quotaStatus, setQuotaStatus] = useState(null);
    const [checkingFonnte, setCheckingFonnte] = useState(false);

    const handleTestConnection = () => {
        setCheckingFonnte(true);
        setFonnteStatus(null);
        setQuotaStatus(null);

        fetch("/fonnte/test", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "same-origin",
        })
            .then((response) => response.json())
            .then((data) => {
                setFonnteStatus(data);
            })
            .catch(() => {
                setFonnteStatus({
                    success: false,
                    message: "Gagal terhubung",
                });
            })
            .finally(() => {
                setCheckingFonnte(false);
            });
    };

    const handleCheckQuota = () => {
        setCheckingFonnte(true);
        setFonnteStatus(null);
        setQuotaStatus(null);

        fetch("/fonnte/quota", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "same-origin",
        })
            .then((response) => response.json())
            .then((data) => {
                setQuotaStatus(data);
            })
            .catch(() => {
                setQuotaStatus({
                    success: false,
                    message: "Gagal mengambil kuota",
                });
            })
            .finally(() => {
                setCheckingFonnte(false);
            });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span>📱</span>
                Status Fonnte WhatsApp
            </h4>

            <div className="flex flex-wrap gap-4 mb-4">
                {/* Tombol Fonnte distandarisasi pakai PrimaryButton + token primary/success */}
                <PrimaryButton
                    variant="primary"
                    onClick={handleTestConnection}
                    disabled={checkingFonnte}
                >
                    {checkingFonnte ? (
                        <svg
                            className="animate-spin h-4 w-4"
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
                    ) : (
                        <span>🔗</span>
                    )}
                    Test Koneksi
                </PrimaryButton>

                <PrimaryButton
                    variant="success"
                    onClick={handleCheckQuota}
                    disabled={checkingFonnte}
                >
                    {checkingFonnte ? (
                        <svg
                            className="animate-spin h-4 w-4"
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
                    ) : (
                        <span>📊</span>
                    )}
                    Cek Kuota
                </PrimaryButton>
            </div>

            {/* Test Connection Result */}
            {fonnteStatus && (
                <div
                    className={`p-4 rounded-lg mb-4 ${fonnteStatus.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                >
                    <div className="flex items-start gap-2">
                        <span className="text-xl">
                            {fonnteStatus.success ? "✅" : "❌"}
                        </span>
                        <div>
                            <p
                                className={`font-medium ${fonnteStatus.success ? "text-green-800" : "text-red-800"}`}
                            >
                                {fonnteStatus.message}
                            </p>
                            {fonnteStatus.device && (
                                <p className="text-sm text-green-700 mt-1">
                                    Device:{" "}
                                    {fonnteStatus.device.phone || "Unknown"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quota Result */}
            {quotaStatus && (
                <div
                    className={`p-4 rounded-lg ${quotaStatus.success ? "bg-blue-50 border border-blue-200" : "bg-red-50 border border-red-200"}`}
                >
                    <div className="flex items-start gap-2">
                        <span className="text-xl">
                            {quotaStatus.success ? "📊" : "❌"}
                        </span>
                        <div>
                            <p
                                className={`font-medium ${quotaStatus.success ? "text-blue-800" : "text-red-800"}`}
                            >
                                {quotaStatus.message}
                            </p>
                            {quotaStatus.quota && (
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        Sisa Kuota:{" "}
                                        {quotaStatus.quota.remaining}
                                    </p>
                                    <p>
                                        Total Kuota: {quotaStatus.quota.total}
                                    </p>
                                    <p>
                                        Expired:{" "}
                                        {quotaStatus.quota.expired || "-"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
