import Modal from "@/Components/Modal";
import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function ScheduleEditModal({ show, onClose, schedule, users }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        assignments: [],
    });

    const [localAssignments, setLocalAssignments] = useState([]);

    useEffect(() => {
        if (show && schedule) {
            const initialAssignments = schedule.assignments.map(
                (assignment) => ({
                    id: assignment.id,
                    role: assignment.role,
                    user_id: assignment.user?.id || "",
                }),
            );
            setLocalAssignments(initialAssignments);
            setData("assignments", initialAssignments);
        }
    }, [show, schedule]);

    const handleUserChange = (assignmentId, userId) => {
        setLocalAssignments((prev) =>
            prev.map((assignment) =>
                assignment.id === assignmentId
                    ? { ...assignment, user_id: userId }
                    : assignment,
            ),
        );
    };

    const handleSave = () => {
        setData("assignments", localAssignments);
        put(route("schedules.petugas.update", schedule.id), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    const getRoleCriteria = (role) => {
        // Sesuai dengan SchedulerService criteria
        const criteria = {
            "Pembina Apel": { jenis_jabatan: "pimpinan" },
            "Pembaca Doa": { jenis_pegawai: ["PNS", "CPNS"], gender: "L" },
            "Pembaca 8 Nilai MA": {
                jenis_pegawai: "PNS",
                jenis_jabatan: "Staff",
                gender: "P",
            },
            MC: {
                jenis_pegawai: ["CPNS", "PPPK"],
                jenis_jabatan: "Staff",
                gender: "P",
            },
            "Pemimpin Apel": { jenis_pegawai: "PPPK", gender: "L" },
            "Pembaca Lainnya": {
                jenis_pegawai: "CPNS",
                jenis_jabatan: "Staff",
            },
        };
        return criteria[role] || {};
    };

    const getFilteredUsers = (role) => {
        const criteria = getRoleCriteria(role);
        return users.filter((user) => {
            // Check jenis_jabatan
            if (
                criteria.jenis_jabatan &&
                user.jenis_jabatan !== criteria.jenis_jabatan
            ) {
                return false;
            }
            // Check jenis_pegawai (bisa string atau array)
            if (criteria.jenis_pegawai) {
                const allowed = Array.isArray(criteria.jenis_pegawai)
                    ? criteria.jenis_pegawai
                    : [criteria.jenis_pegawai];
                if (!allowed.includes(user.jenis_pegawai)) {
                    return false;
                }
            }
            // Check gender
            if (criteria.gender && user.gender !== criteria.gender) {
                return false;
            }
            return true;
        });
    };

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

    if (!schedule) return null;

    return (
        <Modal
            show={show}
            onClose={onClose}
            maxWidth="lg"
            closeable={!processing}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span>✏️</span>
                        Edit Petugas Apel
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={processing}
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

                <div className="mb-4 text-sm text-gray-600">
                    <p>
                        <strong>Tanggal:</strong>{" "}
                        {new Date(schedule.date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                    <p>
                        <strong>Jenis:</strong>{" "}
                        {schedule.type === "senin" ? "Senin" : "Jumat"}
                    </p>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {localAssignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className={`p-4 rounded-lg border ${getRoleColor(assignment.role)}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">
                                    {getRoleIcon(assignment.role)}
                                </span>
                                <span className="font-medium">
                                    {assignment.role}
                                </span>
                            </div>
                            <select
                                value={assignment.user_id}
                                onChange={(e) =>
                                    handleUserChange(
                                        assignment.id,
                                        e.target.value,
                                    )
                                }
                                disabled={processing}
                                className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                aria-label={`Pilih petugas untuk ${assignment.role}`}
                            >
                                <option value="">-- Pilih Petugas --</option>
                                {getFilteredUsers(assignment.role).map(
                                    (user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ),
                                )}
                            </select>
                            {errors[`assignments.${assignment.id}.user_id`] && (
                                <p className="mt-1 text-sm text-red-600">
                                    {
                                        errors[
                                            `assignments.${assignment.id}.user_id`
                                        ]
                                    }
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={processing}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center gap-2"
                    >
                        {processing ? (
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
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <span>💾</span>
                                Simpan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
