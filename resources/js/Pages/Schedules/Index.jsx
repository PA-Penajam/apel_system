import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import ScheduleEditModal from "@/Components/ScheduleEditModal";
import { getRoleIcon, getRoleColor } from "@/utils/roles";

export default function Index({ schedules, auth, users }) {
    const { data, setData, post, processing, errors } = useForm({
        start_date: "",
        end_date: "",
    });

    const [broadcastingId, setBroadcastingId] = useState(null);
    const [fonnteStatus, setFonnteStatus] = useState(null);
    const [quotaStatus, setQuotaStatus] = useState(null);
    const [checkingFonnte, setCheckingFonnte] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleGenerate = (e) => {
        e.preventDefault();
        post(route("schedules.generate"));
    };

    const handleBroadcast = (scheduleId) => {
        if (confirm("Kirim notifikasi jadwal ke grup WhatsApp?")) {
            setBroadcastingId(scheduleId);
            router.post(
                route("schedules.broadcast"),
                {
                    schedule_id: scheduleId,
                },
                {
                    onFinish: () => setBroadcastingId(null),
                },
            );
        }
    };

    const handleManualSend = (scheduleId) => {
        if (confirm("Kirim notifikasi manual ke petugas?")) {
            setBroadcastingId(scheduleId);
            router.post(
                route("schedules.broadcast.all"),
                {
                    schedule_id: scheduleId,
                },
                {
                    onFinish: () => setBroadcastingId(null),
                },
            );
        }
    };

    const handleOpenEditModal = (schedule) => {
        setEditingSchedule(schedule);
        setShowEditModal(true);
    };

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

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            sent: "bg-green-100 text-green-800 border-green-200",
            skipped: "bg-gray-100 text-gray-800 border-gray-200",
            failed: "bg-red-100 text-red-800 border-red-200",
        };
        const labels = {
            pending: "Pending",
            sent: "Terkirim",
            skipped: "Dilewati",
            failed: "Gagal",
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[status] || badges.pending}`}
            >
                {labels[status] || status}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    📅 Jadwal Apel
                </h2>
            }
        >
            <Head title="Jadwal Apel - PA Penajam" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {/* Generator Section */}
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

                            <form
                                onSubmit={handleGenerate}
                                className="flex flex-col sm:flex-row gap-4 items-end"
                            >
                                <div className="w-full sm:w-auto flex-1">
                                    <label className="block text-sm font-medium text-blue-100 mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) =>
                                            setData(
                                                "start_date",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border-transparent focus:border-white focus:ring-2 focus:ring-white/50 bg-white/10 text-white placeholder-blue-200"
                                    />
                                    {errors.start_date && (
                                        <div className="text-red-300 text-sm mt-1">
                                            {errors.start_date}
                                        </div>
                                    )}
                                </div>
                                <div className="w-full sm:w-auto flex-1">
                                    <label className="block text-sm font-medium text-blue-100 mb-1">
                                        Tanggal Selesai
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) =>
                                            setData("end_date", e.target.value)
                                        }
                                        className="w-full rounded-lg border-transparent focus:border-white focus:ring-2 focus:ring-white/50 bg-white/10 text-white placeholder-blue-200"
                                    />
                                    {errors.end_date && (
                                        <div className="text-red-300 text-sm mt-1">
                                            {errors.end_date}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
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
                            </form>
                        </div>
                    </div>

                    {/* Schedules List */}
                    {Object.keys(schedules).length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-500 text-lg mb-2">
                                Belum ada jadwal yang dibuat
                            </p>
                            <p className="text-gray-400 text-sm">
                                Gunakan form di atas untuk generate jadwal apel
                            </p>
                        </div>
                    ) : (
                        Object.keys(schedules).map((month) => (
                            <div key={month} className="space-y-4">
                                {/* Month Header */}
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                                        <span>📆</span>
                                        {month}
                                    </h3>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {schedules[month].length} jadwal
                                    </span>
                                </div>

                                {/* Schedule Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {schedules[month].map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group"
                                        >
                                            {/* Header */}
                                            <div
                                                className={`p-4 flex flex-col gap-3 ${
                                                    schedule.type === "senin"
                                                        ? "bg-blue-50 border-b border-blue-100"
                                                        : "bg-green-50 border-b border-green-100"
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={`text-2xl ${
                                                                schedule.type ===
                                                                "senin"
                                                                    ? "bg-blue-200"
                                                                    : "bg-green-200"
                                                            } w-10 h-10 rounded-full flex items-center justify-center`}
                                                        >
                                                            {schedule.type ===
                                                            "senin"
                                                                ? "1️⃣"
                                                                : "6️⃣"}
                                                        </span>
                                                        <div>
                                                            <span
                                                                className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                                                    schedule.type ===
                                                                    "senin"
                                                                        ? "bg-blue-200 text-blue-800"
                                                                        : "bg-green-200 text-green-800"
                                                                }`}
                                                            >
                                                                {schedule.type}
                                                            </span>
                                                            <p className="font-bold text-gray-800 mt-1">
                                                                {new Date(
                                                                    schedule.date,
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "long",
                                                                        year: "numeric",
                                                                    },
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    {getStatusBadge(
                                                        schedule.notification_status,
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    {/* Broadcast Button */}
                                                    <button
                                                        onClick={() =>
                                                            handleBroadcast(
                                                                schedule.id,
                                                            )
                                                        }
                                                        disabled={
                                                            broadcastingId ===
                                                            schedule.id
                                                        }
                                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                                            broadcastingId ===
                                                            schedule.id
                                                                ? "bg-green-500 text-white"
                                                                : "bg-white text-gray-600 hover:text-green-600 hover:bg-green-50 border border-gray-200"
                                                        }`}
                                                        title="Broadcast ke Grup WhatsApp"
                                                    >
                                                        {broadcastingId ===
                                                        schedule.id ? (
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
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                                                />
                                                            </svg>
                                                        )}
                                                        Kirim Grup
                                                    </button>

                                                    {/* Kirim Manual Button */}
                                                    {(schedule.notification_status ===
                                                        "pending" ||
                                                        schedule.notification_status ===
                                                            "sent") && (
                                                        <button
                                                            onClick={() =>
                                                                handleManualSend(
                                                                    schedule.id,
                                                                )
                                                            }
                                                            disabled={
                                                                broadcastingId ===
                                                                schedule.id
                                                            }
                                                            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-white text-indigo-600 hover:bg-indigo-50 border border-gray-200 transition-all flex items-center justify-center gap-2"
                                                            title="Kirim notifikasi individual ke petugas"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                            Kirim Manual
                                                        </button>
                                                    )}

                                                    {/* Edit Petugas Button */}
                                                    <button
                                                        onClick={() =>
                                                            handleOpenEditModal(
                                                                schedule,
                                                            )
                                                        }
                                                        className="p-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center justify-center"
                                                        title="Edit petugas"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Assignments */}
                                            <div className="p-4 space-y-2">
                                                {schedule.assignments.map(
                                                    (assignment) => (
                                                        <div
                                                            key={assignment.id}
                                                            className={`flex items-start gap-3 p-2 rounded-lg border ${getRoleColor(assignment.role)}`}
                                                        >
                                                            <span className="text-lg">
                                                                {getRoleIcon(
                                                                    assignment.role,
                                                                )}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium opacity-75 truncate">
                                                                    {
                                                                        assignment.role
                                                                    }
                                                                </p>
                                                                <p className="font-semibold text-sm truncate">
                                                                    {assignment
                                                                        .user
                                                                        ?.name ||
                                                                        "-"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                                <p className="text-xs text-gray-500 text-center">
                                                    {
                                                        schedule.assignments
                                                            .length
                                                    }{" "}
                                                    penugasan
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Legend */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h4 className="font-semibold text-gray-700 mb-4">
                            📋 Keterangan Peran
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span>👔</span>
                                <span>Pembina Apel</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>🤲</span>
                                <span>Pembaca Doa</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>📖</span>
                                <span>Pembaca 8 Nilai</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>🎤</span>
                                <span>MC</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>⭐</span>
                                <span>Pemimpin Apel</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>📋</span>
                                <span>Pembaca Lainnya</span>
                            </div>
                        </div>
                    </div>

                    {/* Fonnte Status Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <span>📱</span>
                            Status Fonnte WhatsApp
                        </h4>

                        <div className="flex flex-wrap gap-4 mb-4">
                            <button
                                onClick={handleTestConnection}
                                disabled={checkingFonnte}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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
                            </button>

                            <button
                                onClick={handleCheckQuota}
                                disabled={checkingFonnte}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
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
                            </button>
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
                                                {fonnteStatus.device.phone ||
                                                    "Unknown"}
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
                                                    {
                                                        quotaStatus.quota
                                                            .remaining
                                                    }
                                                </p>
                                                <p>
                                                    Total Kuota:{" "}
                                                    {quotaStatus.quota.total}
                                                </p>
                                                <p>
                                                    Expired:{" "}
                                                    {quotaStatus.quota
                                                        .expired || "-"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                <ScheduleEditModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    schedule={editingSchedule}
                    users={users}
                />
            </div>
        </AuthenticatedLayout>
    );
}
