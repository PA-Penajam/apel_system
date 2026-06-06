import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import ScheduleEditModal from "@/Components/ScheduleEditModal";
import ConfirmDialog from "@/Components/ConfirmDialog";

// Partial components hasil split Task 11 (refactor monolitik Schedules/Index.jsx).
// Setiap partial fokus pada satu tanggung jawab, max ~150-200 baris, perilaku & visual identik.
import GeneratorSection from "./partials/GeneratorSection";
import ScheduleCard from "./partials/ScheduleCard";
import FonntePanel from "./partials/FonntePanel";
import Legend from "./partials/Legend";

export default function Index({ schedules, auth, users }) {
    // Index.jsx sekarang adalah thin coordinator setelah split (Task 11).
    // Hanya mengelola:
    // - State high-level yang dibagikan antar partial/list (broadcastingId untuk aksi kirim, editing + modal, confirmAction untuk ConfirmDialog global).
    // - Handler untuk broadcast/manual/edit yang memicu confirm atau modal (state update + router call).
    // - Grouping schedules per bulan + render list via ScheduleCard.
    // - Compose 4 partials.
    //
    // State & handler Fonnte dipindah sepenuhnya ke FonntePanel (enkapsulasi).
    // Generator form sepenuhnya di GeneratorSection (pakai <Form> Inertia).
    // getStatusBadge dan role rendering ada di ScheduleCard.
    //
    // Semua perilaku, data flow, loading, confirm, modal tetap sama 100%.
    const [broadcastingId, setBroadcastingId] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // handleGenerate dihapus sejak migrasi <Form> (Fase sebelumnya).

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
                    {
                        schedule_id: scheduleId,
                    },
                    {
                        onFinish: () => setBroadcastingId(null),
                    },
                );
                break;
            }
            case "manual": {
                const scheduleId = confirmAction.scheduleId;
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
                break;
            }
        }

        setConfirmAction(null);
    };

    const handleOpenEditModal = (schedule) => {
        setEditingSchedule(schedule);
        setShowEditModal(true);
    };

    // handleTestConnection & handleCheckQuota + 3 state Fonnte sudah sepenuhnya dipindahkan
    // ke FonntePanel.jsx (enkapsulasi, tidak ada reference lagi di coordinator).
    // getStatusBadge juga sudah di ScheduleCard.

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
                    {/* Generator Section — sekarang sepenuhnya di partial (ekstraksi Task 11).
                        Index hanya compose; tidak ada lagi JSX generator di file ini. */}
                    <GeneratorSection />

                    {/* Schedules List (koordinasi grouping per bulan tetap di Index sebagai "list coordinator").
                        Setiap kartu individual dirender via ScheduleCard (dengan callback wiring). */}
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

                                {/* Schedule Cards — diganti dari inline div besar menjadi ScheduleCard.
                                    Wiring: isBroadcasting + callback yang close-over id/schedule agar parent state terupdate. */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {schedules[month].map((schedule) => (
                                        <ScheduleCard
                                            key={schedule.id}
                                            schedule={schedule}
                                            isBroadcasting={
                                                broadcastingId === schedule.id
                                            }
                                            onBroadcast={() =>
                                                handleBroadcast(schedule.id)
                                            }
                                            onManualSend={() =>
                                                handleManualSend(schedule.id)
                                            }
                                            onEdit={() =>
                                                handleOpenEditModal(schedule)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Legend — diekstrak ke partial (meski kecil, untuk konsistensi struktur). */}
                    <Legend />

                    {/* Fonnte Status Section — sepenuhnya dipindah ke FonntePanel (state + handler + JSX).
                        Index hanya me-render komponen; tidak ada lagi state fonnte atau PrimaryButton di file ini. */}
                    <FonntePanel />
                </div>

                {/* Edit Modal */}
                <ScheduleEditModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    schedule={editingSchedule}
                    users={users}
                />

                {/* Confirm Dialog untuk mengganti window.confirm */}
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
