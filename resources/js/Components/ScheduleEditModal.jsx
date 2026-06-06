import Modal from "@/Components/Modal";
import { useForm, router } from "@inertiajs/react";
import { useEffect } from "react";
import { getRoleIcon, getRoleColor, getRoleCriteria } from "@/utils/roles";

export default function ScheduleEditModal({ show, onClose, schedule, users }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        assignments: [],
    });

    useEffect(() => {
        if (show && schedule) {
            const initialAssignments = schedule.assignments.map(
                (assignment) => ({
                    id: assignment.id,
                    role: assignment.role,
                    user_id: assignment.user?.id || "",
                }),
            );
            setData("assignments", initialAssignments);
        }
    }, [show, schedule]);

    const handleUserChange = (assignmentId, userId) => {
        setData((current) => ({
            ...current,
            assignments: current.assignments.map((assignment) =>
                assignment.id === assignmentId
                    ? { ...assignment, user_id: userId }
                    : assignment,
            ),
        }));
    };

    const handleSave = () => {
        put(route("schedules.petugas.update", schedule.id), {
            onSuccess: () => {
                onClose();
                reset();
                // Force page reload to show updated data
                router.reload();
            },
        });
    };

    const getFilteredUsers = (role) => {
        const criteria = getRoleCriteria(role);
        return users.filter((user) => {
            // Check jenis_jabatan (bisa string, array, atau negation)
            if (criteria.jenis_jabatan) {
                const jab = criteria.jenis_jabatan;

                if (Array.isArray(jab)) {
                    // Array: harus match SATU dari item (OR logic)
                    let passed = false;
                    for (const item of jab) {
                        if (item.startsWith("!")) {
                            // Negation: TIDAK boleh ini, tapi jika ada item lain yang match, tetap boleh
                            const excluded = item.substring(1).toLowerCase();
                            if (
                                user.jenis_jabatan?.toLowerCase() !== excluded
                            ) {
                                // Check apakah ada item lain yang match positive
                                const hasPositiveMatch = jab.some(
                                    (i) =>
                                        !i.startsWith("!") &&
                                        i.toLowerCase() ===
                                            user.jenis_jabatan?.toLowerCase(),
                                );
                                if (hasPositiveMatch) {
                                    passed = true;
                                } else if (
                                    !jab.some((i) => !i.startsWith("!"))
                                ) {
                                    // Jika semua item negation, berarti只要 bukan excluded
                                    passed = true;
                                }
                            }
                        } else {
                            // Positive: HARUS ini
                            if (
                                user.jenis_jabatan?.toLowerCase() ===
                                item.toLowerCase()
                            ) {
                                passed = true;
                            }
                        }
                    }
                    if (!passed) return false;
                } else {
                    // Single value
                    if (jab.startsWith("!")) {
                        const excluded = jab.substring(1).toLowerCase();
                        if (user.jenis_jabatan?.toLowerCase() === excluded) {
                            return false;
                        }
                    } else {
                        if (
                            user.jenis_jabatan?.toLowerCase() !==
                            jab.toLowerCase()
                        ) {
                            return false;
                        }
                    }
                }
            }
            // Check jenis_pegawai (case-insensitive)
            if (criteria.jenis_pegawai) {
                const allowed = Array.isArray(criteria.jenis_pegawai)
                    ? criteria.jenis_pegawai
                    : [criteria.jenis_pegawai];
                const userJenis = user.jenis_pegawai?.toUpperCase();
                const allowedUpper = allowed.map((j) => j.toUpperCase());
                if (!allowedUpper.includes(userJenis)) {
                    return false;
                }
            }
            // Check gender (case-insensitive)
            if (
                criteria.gender &&
                user.gender?.toLowerCase() !== criteria.gender.toLowerCase()
            ) {
                return false;
            }
            return true;
        });
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
                    {data.assignments.map((assignment, index) => {
                        const filteredUsers = getFilteredUsers(assignment.role);
                        return (
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
                                    <option value="">
                                        -- Pilih Petugas --
                                    </option>
                                    {filteredUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                {filteredUsers.length === 0 && (
                                    <p className="mt-1 text-sm text-red-600">
                                        Tidak ada petugas yang eligible untuk
                                        role ini
                                    </p>
                                )}
                                {errors[`assignments.${index}.user_id`] && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors[`assignments.${index}.user_id`]}
                                    </p>
                                )}
                            </div>
                        );
                    })}
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
