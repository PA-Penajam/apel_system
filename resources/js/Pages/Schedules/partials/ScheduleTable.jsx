import { getRoleIcon, getRoleColor, getRoles } from "@/utils/roles";

export default function ScheduleTable({ schedules, onBroadcast, onManualSend, onEdit, onAbsence, isBroadcastingId }) {
    const roles = getRoles();

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-yellow-100 text-yellow-800",
            sent: "bg-green-100 text-green-800",
            skipped: "bg-gray-100 text-gray-800",
            failed: "bg-red-100 text-red-800",
        };
        const labels = {
            pending: "Pending",
            sent: "Terkirim",
            skipped: "Dilewati",
            failed: "Gagal",
        };
        return (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || badges.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getAssignment = (schedule, roleName) => {
        return schedule.assignments.find(a => a.role === roleName);
    };

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                        {roles.map((role) => (
                            <th key={role} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                                {role}
                            </th>
                        ))}
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                                {new Date(schedule.date).toLocaleDateString("id-ID", {
                                    day: "numeric", month: "short", year: "numeric"
                                })}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${schedule.type === 'senin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                    {schedule.type}
                                </span>
                            </td>
                            {roles.map((role) => {
                                const assignment = getAssignment(schedule, role);
                                return (
                                    <td
                                        key={role}
                                        className="px-4 py-3 whitespace-nowrap truncate max-w-[140px]"
                                        title={assignment?.user?.name || "-"}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate">{assignment?.user?.name || "-"}</span>
                                            {assignment && (
                                                <button
                                                    onClick={() => onAbsence(assignment)}
                                                    className="text-xs text-red-600 hover:text-red-800 shrink-0"
                                                    title="Tandai berhalangan"
                                                >
                                                    Berhalangan
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                            <td className="px-4 py-3 whitespace-nowrap">
                                {getStatusBadge(schedule.notification_status)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right font-medium space-x-2">
                                <button
                                    onClick={() => onEdit(schedule)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Edit Petugas"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onBroadcast(schedule.id)}
                                    disabled={isBroadcastingId === schedule.id}
                                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                    title="Kirim Grup"
                                >
                                    Kirim
                                </button>
                                {(schedule.notification_status === "pending" || schedule.notification_status === "sent") && (
                                    <button
                                        onClick={() => onManualSend(schedule.id)}
                                        disabled={isBroadcastingId === schedule.id}
                                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                        title="Kirim Manual ke Petugas"
                                    >
                                        Personal
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
