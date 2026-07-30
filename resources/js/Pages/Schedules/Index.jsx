import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import ScheduleEditModal from "@/Components/ScheduleEditModal";
import ConfirmDialog from "@/Components/ConfirmDialog";

import GeneratorSection from "./partials/GeneratorSection";
import ScheduleTable from "./partials/ScheduleTable";
import FonntePanel from "./partials/FonntePanel";
import Legend from "./partials/Legend";
import AbsenceModal from "./partials/AbsenceModal";

export default function Index({ schedules, auth, users }) {
    const [broadcastingId, setBroadcastingId] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [absenceAssignment, setAbsenceAssignment] = useState(null);
    const [showAbsenceModal, setShowAbsenceModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // UX Filters & Search states (default to "all" so newly generated schedules are immediately visible)
    const monthKeys = useMemo(() => Object.keys(schedules), [schedules]);
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    // Automatically ensure selectedMonth remains valid if schedules change
    useEffect(() => {
        if (selectedMonth !== "all" && !monthKeys.includes(selectedMonth)) {
            setSelectedMonth("all");
        }
    }, [monthKeys, selectedMonth]);

    const handleBroadcast = (scheduleId) => {
        setConfirmAction({ type: "broadcast", scheduleId });
    };

    const handleManualSend = (scheduleId) => {
        setConfirmAction({ type: "manual", scheduleId });
    };

    const handleConfirmAction = () => {
        if (!confirmAction) return;

        switch (confirmAction.type) {
            case "broadcast": {
                const scheduleId = confirmAction.scheduleId;
                setBroadcastingId(scheduleId);
                router.post(
                    route("schedules.broadcast"),
                    { schedule_id: scheduleId },
                    { onFinish: () => setBroadcastingId(null) }
                );
                break;
            }
            case "manual": {
                const scheduleId = confirmAction.scheduleId;
                setBroadcastingId(scheduleId);
                router.post(
                    route("schedules.broadcast.all"),
                    { schedule_id: scheduleId },
                    { onFinish: () => setBroadcastingId(null) }
                );
                break;
            }
        }
        setConfirmAction(null);
    };

    const handleOpenEditModal = (schedule) => {
        setEditingSchedule(schedule);
        setShowEditModal(true);
    };

    const handleOpenAbsenceModal = (assignment) => {
        setAbsenceAssignment(assignment);
        setShowAbsenceModal(true);
    };

    // Filter schedules according to selected month, search query, and type
    const filteredSchedulesByMonth = useMemo(() => {
        const result = {};

        const monthsToProcess =
            selectedMonth === "all" ? monthKeys : [selectedMonth];

        monthsToProcess.forEach((month) => {
            const list = schedules[month] || [];
            const filteredList = list.filter((item) => {
                // Type filter
                if (typeFilter !== "all" && item.type !== typeFilter) {
                    return false;
                }

                // Search query filter (matches date or officer name)
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const matchesDate = item.date.toLowerCase().includes(q);
                    const matchesOfficer = item.assignments.some(
                        (a) =>
                            a.user &&
                            a.user.name.toLowerCase().includes(q)
                    );
                    return matchesDate || matchesOfficer;
                }

                return true;
            });

            if (filteredList.length > 0) {
                result[month] = filteredList;
            }
        });

        return result;
    }, [schedules, selectedMonth, searchQuery, typeFilter, monthKeys]);

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

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Generator Section */}
                    <GeneratorSection />

                    {/* Filter & Search Bar */}
                    {monthKeys.length > 0 && (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
                            {/* Month Tabs */}
                            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100">
                                <span className="text-xs font-bold text-gray-500 uppercase mr-2">
                                    Pilih Bulan:
                                </span>
                                <button
                                    onClick={() => setSelectedMonth("all")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        selectedMonth === "all"
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Semua Bulan
                                </button>
                                {monthKeys.map((month) => (
                                    <button
                                        key={month}
                                        onClick={() => setSelectedMonth(month)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            selectedMonth === month
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {month} ({schedules[month].length})
                                    </button>
                                ))}
                            </div>

                            {/* Search & Type Filter */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                                <div className="w-full sm:w-80 relative">
                                    <input
                                        type="text"
                                        placeholder="🔍 Cari petugas atau tanggal..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <span className="text-xs text-gray-500 font-medium">
                                        Jenis:
                                    </span>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) =>
                                            setTypeFilter(e.target.value)
                                        }
                                        className="text-xs rounded-lg border-gray-300 py-1.5 focus:ring-indigo-500"
                                    >
                                        <option value="all">Semua Tipe</option>
                                        <option value="senin">Apel Senin</option>
                                        <option value="jumat">Apel Jumat</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schedules List */}
                    {Object.keys(filteredSchedulesByMonth).length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                            <div className="text-5xl mb-3">📭</div>
                            <p className="text-gray-600 font-medium text-base mb-1">
                                Tidak ada jadwal ditemukan
                            </p>
                            <p className="text-gray-400 text-xs">
                                Coba ubah kata kunci pencarian atau tab bulan di atas
                            </p>
                        </div>
                    ) : (
                        Object.keys(filteredSchedulesByMonth).map((month) => (
                            <div key={month} className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <span>📆</span>
                                        {month}
                                    </h3>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                    <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm font-semibold">
                                        {filteredSchedulesByMonth[month].length} jadwal
                                    </span>
                                </div>

                                <ScheduleTable
                                    schedules={filteredSchedulesByMonth[month]}
                                    isBroadcastingId={broadcastingId}
                                    onBroadcast={handleBroadcast}
                                    onManualSend={handleManualSend}
                                    onEdit={handleOpenEditModal}
                                    onAbsence={handleOpenAbsenceModal}
                                />
                            </div>
                        ))
                    )}

                    <Legend />
                    <FonntePanel />
                </div>

                <ScheduleEditModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    schedule={editingSchedule}
                    users={users}
                />

                <AbsenceModal
                    show={showAbsenceModal}
                    onClose={() => setShowAbsenceModal(false)}
                    assignment={absenceAssignment}
                    users={users}
                />

                <ConfirmDialog
                    show={!!confirmAction}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={handleConfirmAction}
                    title={
                        confirmAction?.type === "broadcast"
                            ? "Broadcast Notifikasi Grup"
                            : confirmAction?.type === "manual"
                              ? "Kirim Notifikasi Manual"
                              : "Konfirmasi"
                    }
                    message={
                        confirmAction?.type === "broadcast"
                            ? "Kirim notifikasi jadwal ke grup WhatsApp?"
                            : confirmAction?.type === "manual"
                              ? "Kirim notifikasi manual ke petugas?"
                              : ""
                    }
                    confirmText="Ya, Kirim"
                    isDanger={false}
                />
            </div>
        </AuthenticatedLayout>
    );
}
