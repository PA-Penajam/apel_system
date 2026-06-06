import { getRoleIcon, getRoleColor } from "@/utils/roles";
// Catatan: RoleBadge diimpor/disediakan oleh ekstraksi sebelumnya untuk DRY.
// Namun untuk list assignments di card ini, kita gunakan struktur rendering asli
// (colored container row + icon terpisah + dua baris teks role+user) persis seperti
// di Index sebelum split. Ini menjamin visual, layout, dan spacing 100% identik.
// RoleBadge lebih cocok untuk tampilan compact badge (bukan item assignment dengan nama user).

/**
 * ScheduleCard
 *
 * Diekstrak dari Schedules/Index.jsx (Task 11 - split monolitik).
 * Komponen reusable untuk satu kartu jadwal apel.
 *
 * Menerima:
 * - schedule: object jadwal lengkap (id, date, type, notification_status, assignments[])
 * - isBroadcasting: boolean — apakah schedule ini sedang dalam proses kirim (dari state parent)
 * - onBroadcast: function — callback saat tombol "Kirim Grup" diklik (akan trigger confirm di parent)
 * - onManualSend: function — callback "Kirim Manual"
 * - onEdit: function — callback buka edit modal
 *
 * Tanggung jawab:
 * - Header berwarna (biru untuk senin / hijau untuk jumat) + emoji type + tanggal + status badge.
 * - Action buttons: Kirim Grup (dengan loading), Kirim Manual (conditional), Edit icon (standardized).
 * - List assignments: per peran dengan warna dari Role utils, icon, role label, nama user.
 * - Footer: jumlah penugasan.
 *
 * getStatusBadge dipindahkan ke sini (hanya dipakai di dalam kartu).
 * Semua logic, disabled states, title/tooltip, dan class tetap sama persis.
 * Tidak ada perubahan visual atau perilaku.
 */
export default function ScheduleCard({
    schedule,
    isBroadcasting = false,
    onBroadcast,
    onManualSend,
    onEdit,
}) {
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
        <div
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
                                schedule.type === "senin"
                                    ? "bg-blue-200"
                                    : "bg-green-200"
                            } w-10 h-10 rounded-full flex items-center justify-center`}
                        >
                            {schedule.type === "senin" ? "1️⃣" : "6️⃣"}
                        </span>
                        <div>
                            <span
                                className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                    schedule.type === "senin"
                                        ? "bg-blue-200 text-blue-800"
                                        : "bg-green-200 text-green-800"
                                }`}
                            >
                                {schedule.type}
                            </span>
                            <p className="font-bold text-gray-800 mt-1">
                                {new Date(schedule.date).toLocaleDateString(
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
                    {getStatusBadge(schedule.notification_status)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {/* Broadcast Button */}
                    <button
                        onClick={onBroadcast}
                        disabled={isBroadcasting}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            isBroadcasting
                                ? "bg-green-500 text-white"
                                : "bg-white text-gray-600 hover:text-green-600 hover:bg-green-50 border border-gray-200"
                        }`}
                        title="Broadcast ke Grup WhatsApp"
                    >
                        {isBroadcasting ? (
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
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                            </svg>
                        )}
                        Kirim Grup
                    </button>

                    {/* Kirim Manual Button */}
                    {(schedule.notification_status === "pending" ||
                        schedule.notification_status === "sent") && (
                        <button
                            onClick={onManualSend}
                            disabled={isBroadcasting}
                            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-white text-primary hover:bg-primary/10 border border-gray-200 transition-all flex items-center justify-center gap-2"
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
                                    strokeWidth={2}
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                            Kirim Manual
                        </button>
                    )}

                    {/* Edit Petugas Button - distandarisasi ke primary token */}
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center"
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
                {schedule.assignments.map((assignment) => (
                    <div
                        key={assignment.id}
                        className={`flex items-start gap-3 p-2 rounded-lg border ${getRoleColor(assignment.role)}`}
                    >
                        <span className="text-lg">
                            {getRoleIcon(assignment.role)}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium opacity-75 truncate">
                                {assignment.role}
                            </p>
                            <p className="font-semibold text-sm truncate">
                                {assignment.user?.name || "-"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                    {schedule.assignments.length} penugasan
                </p>
            </div>
        </div>
    );
}
