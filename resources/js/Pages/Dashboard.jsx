import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({
    auth,
    stats,
    upcomingSchedules,
    recentSchedules,
}) {
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

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <span className="text-2xl">👥</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">
                                            Total Penugasan
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats.total_assignments}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                <div className="space-y-3">
                                    {upcomingSchedules.map((schedule) => (
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
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {schedule.assignments_count}{" "}
                                                    penugasan
                                                </p>
                                            </div>
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
            </div>
        </AuthenticatedLayout>
    );
}
