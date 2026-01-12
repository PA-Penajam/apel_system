import Modal from "@/Components/Modal";

export default function SchedulePreviewModal({ show, onClose, schedules }) {
    const getRoleIcon = (role) => {
        const icons = {
            "Pembina Apel": "👔",
            "Pembaca Doa": "🤲",
            "Pembaca 8 Nilai MA": "📖",
            MC: "🎤",
            "Pemimpin Apel": "⭐",
            "Pembaca Lainnya": "📋",
        };
        return icons[role] || "📌";
    };

    const getRoleColor = (role) => {
        const colors = {
            "Pembina Apel": "bg-purple-100 border-purple-200 text-purple-800",
            "Pembaca Doa": "bg-green-100 border-green-200 text-green-800",
            "Pembaca 8 Nilai MA": "bg-pink-100 border-pink-200 text-pink-800",
            MC: "bg-yellow-100 border-yellow-200 text-yellow-800",
            "Pemimpin Apel": "bg-blue-100 border-blue-200 text-blue-800",
            "Pembaca Lainnya": "bg-gray-100 border-gray-200 text-gray-800",
        };
        return colors[role] || "bg-gray-100 border-gray-200 text-gray-800";
    };

    // Group schedules by week
    const groupedByWeek = schedules.reduce((acc, schedule) => {
        const date = new Date(schedule.date);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1);
        const weekKey = startOfWeek.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
        });

        if (!acc[weekKey]) {
            acc[weekKey] = [];
        }
        acc[weekKey].push(schedule);
        return acc;
    }, {});

    if (!show) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl" closeable>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span>📅</span>
                        Jadwal Akan Datang
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Tutup modal"
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

                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                    {Object.entries(groupedByWeek).map(([weekLabel, weekSchedules]) => (
                        <div key={weekLabel} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                <span className="font-semibold text-gray-700">
                                    Minggu {weekLabel}
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {weekSchedules.map((schedule) => (
                                    <div key={schedule.id} className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                    schedule.type === "senin"
                                                        ? "bg-blue-500"
                                                        : "bg-green-500"
                                                }`}
                                            >
                                                {schedule.type === "senin" ? "1" : "6"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {schedule.day_name},{" "}
                                                    {new Date(schedule.date).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-500 capitalize">
                                                    Apel {schedule.type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {schedule.assignments.map((assignment) => (
                                                <div
                                                    key={assignment.id}
                                                    className={`flex items-center gap-2 p-2 rounded-lg border ${getRoleColor(assignment.role)}`}
                                                >
                                                    <span className="text-lg">{getRoleIcon(assignment.role)}</span>
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </Modal>
    );
}
