import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import Modal from "@/Components/Modal";
import { getRoleIcon, getRoleColor } from "@/utils/roles";

export default function Dashboard({
    auth,
    stats,
    upcomingSchedules,
    recentSchedules,
    failedNotifications,
    failedCount,
}) {
    const [broadcastingId, setBroadcastingId] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleRetryNotification = (scheduleId) => {
        if (confirm("Coba kirim notifikasi ulang untuk jadwal ini?")) {
            setBroadcastingId(scheduleId);
            router.post(
                route("schedules.force-send"),
                { schedule_id: scheduleId },
                {
                    onFinish: () => {
                        setBroadcastingId(null);
                        router.reload();
                    },
                },
            );
        }
    };

    const handleResetSchedules = () => {
        if (
            confirm(
                "Apakah Anda yakin ingin menghapus SEMUA jadwal? Tindakan ini tidak dapat dibatalkan!",
            )
        ) {
            setResetting(true);
            router.post(
                route("schedules.reset"),
                {},
                {
                    onFinish: () => {
                        setResetting(false);
                        router.reload();
                    },
                },
            );
        }
    };

    const handleViewDetail = (schedule) => {
        setSelectedSchedule(schedule);
        setShowDetailModal(true);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard - PA Penajam
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Welcome Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                            <h3 className="text-2xl font-bold mb-2">
                                Selamat Datang, {auth.user.name}!
                            </h3>
                            <p className="text-blue-100">
                                Sistem APEL Pengadilan Agama Penajam
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <span className="text-2xl">📅</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">
                                            Total Jadwal
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.total_schedules}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <span className="text-2xl">🗓️</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">
                                            Bulan Ini
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.schedules_this_month}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <span className="text-2xl">⏰</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">
                                            Akan Datang
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.upcoming_schedules}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`bg-white overflow-hidden shadow-sm sm:rounded-lg border ${
                                failedCount > 0
                                    ? "border-red-300"
                                    : "border-gray-100"
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div
                                        className={`p-3 rounded-full ${
                                            failedCount > 0
                                                ? "bg-red-100"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        <span className="text-2xl">🚨</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">
                                            Notif Gagal
                                        </p>
                                        <p
                                            className={`text-2xl font-bold ${
                                                failedCount > 0
                                                    ? "text-red-600"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {failedCount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Failed Notifications Alert */}
                    {failedCount > 0 && (
                        <div className="bg-red-50 overflow-hidden shadow-sm sm:rounded-lg border border-red-200">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                                        <span>🚨</span>
                                        Notifikasi Gagal - Perlu Tindakan
                                    </h3>
                                    <Link
                                        href={route("schedules.index")}
                                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Lihat Semua →
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {failedNotifications.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                        schedule.type ===
                                                        "senin"
                                                            ? "bg-blue-500"
                                                            : "bg-green-500"
                                                    }`}
                                                >
                                                    {schedule.type === "senin"
                                                        ? "1"
                                                        : "6"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {schedule.day_name},{" "}
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
                                                    <p className="text-sm text-gray-500 capitalize">
                                                        Apel {schedule.type} -{" "}
                                                        <span className="text-red-600 font-medium">
                                                            Notif Gagal
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleRetryNotification(
                                                        schedule.id,
                                                    )
                                                }
                                                disabled={
                                                    broadcastingId ===
                                                    schedule.id
                                                }
                                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                                            >
                                                {broadcastingId ===
                                                schedule.id ? (
                                                    <>
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
                                                        Mengirim...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🔄</span>
                                                        Coba Lagi
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                ⚡ Aksi Cepat
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href={route("schedules.index")}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <span className="mr-2">📅</span>
                                    Kelola Jadwal Apel
                                </Link>
                                {stats.total_schedules > 0 && (
                                    <button
                                        onClick={handleResetSchedules}
                                        disabled={resetting}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {resetting ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-4 w-4 mr-2"
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
                                                Menghapus...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">🗑️</span>
                                                Reset Jadwal
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Schedules */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    ⏳ Jadwal Akan Datang
                                </h3>
                                <Link
                                    href={route("schedules.index")}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Lihat Semua →
                                </Link>
                            </div>

                            {upcomingSchedules.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl">📭</span>
                                    <p className="mt-2">
                                        Belum ada jadwal upcoming
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {upcomingSchedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            onClick={() =>
                                                handleViewDetail(schedule)
                                            }
                                            className="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                                            schedule.type ===
                                                            "senin"
                                                                ? "bg-blue-500"
                                                                : "bg-green-500"
                                                        }`}
                                                    >
                                                        {schedule.type ===
                                                        "senin"
                                                            ? "1"
                                                            : "6"}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {schedule.day_name},{" "}
                                                            {new Date(
                                                                schedule.date,
                                                            ).toLocaleDateString(
                                                                "id-ID",
                                                                {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                },
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-gray-500 capitalize">
                                                            Apel {schedule.type}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-gray-400">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 text-center">
                                                {schedule.assignments_count}{" "}
                                                penugasan -{" "}
                                                <span className="text-blue-600 font-medium">
                                                    Klik untuk detail
                                                </span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Schedules */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                📜 Jadwal Terbaru
                            </h3>

                            {recentSchedules.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl">📭</span>
                                    <p className="mt-2">Belum ada jadwal</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentSchedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                                        schedule.type ===
                                                        "senin"
                                                            ? "bg-blue-500"
                                                            : "bg-green-500"
                                                    }`}
                                                >
                                                    {schedule.type === "senin"
                                                        ? "1"
                                                        : "6"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {schedule.day_name},{" "}
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
                                                    <p className="text-sm text-gray-500 capitalize">
                                                        Apel {schedule.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-400">
                                                {schedule.assignments_count}{" "}
                                                penugasan
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Schedule Detail Modal */}
                <Modal
                    show={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    maxWidth="lg"
                    closeable
                >
                    {selectedSchedule && (
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <span>📋</span>
                                    Detail Jadwal Apel
                                </h3>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
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

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                                        selectedSchedule.type === "senin"
                                            ? "bg-blue-500"
                                            : "bg-green-500"
                                    }`}
                                >
                                    {selectedSchedule.type === "senin"
                                        ? "1"
                                        : "6"}
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900">
                                        {selectedSchedule.day_name},{" "}
                                        {new Date(
                                            selectedSchedule.date,
                                        ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p className="text-gray-500 capitalize">
                                        Apel {selectedSchedule.type} -{" "}
                                        {selectedSchedule.assignments?.length ||
                                            0}{" "}
                                        penugasan
                                    </p>
                                </div>
                            </div>

                            {/* Assignments */}
                            <div className="space-y-3">
                                {selectedSchedule.assignments?.map(
                                    (assignment) => (
                                        <div
                                            key={assignment.id}
                                            className={`flex items-center gap-4 p-4 rounded-lg border ${getRoleColor(
                                                assignment.role,
                                            )}`}
                                        >
                                            <span className="text-2xl">
                                                {getRoleIcon(assignment.role)}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium opacity-75">
                                                    {assignment.role}
                                                </p>
                                                <p className="font-semibold text-gray-900">
                                                    {assignment.user?.name ||
                                                        "-"}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex justify-end gap-3">
                                <Link
                                    href={route("schedules.index")}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Kelola Jadwal
                                </Link>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
