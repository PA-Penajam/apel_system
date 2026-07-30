import { useEffect, useState } from "react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

export default function AbsenceModal({ show, onClose, assignment, users }) {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [replacementUserId, setReplacementUserId] = useState("");

    useEffect(() => {
        if (!show || !assignment) {
            setPreview(null);
            setReplacementUserId("");
            return;
        }

        setLoading(true);
        fetch(route("assignments.absent.preview", assignment.id), {
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "same-origin",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Gagal memuat data");
                }
                return res.json();
            })
            .then((data) => {
                setPreview(data);
                setReplacementUserId("");
            })
            .catch(() => {
                setPreview({ error: "Gagal memuat data. Silakan coba lagi." });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [show, assignment]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!assignment) {
            return;
        }

        setSubmitting(true);

        const form = document.createElement("form");
        form.method = "POST";
        form.action = route("assignments.absent.store", assignment.id);

        const csrf = document.querySelector('meta[name="csrf-token"]');
        if (csrf) {
            const csrfInput = document.createElement("input");
            csrfInput.type = "hidden";
            csrfInput.name = "_token";
            csrfInput.value = csrf.content;
            form.appendChild(csrfInput);
        }

        if (replacementUserId) {
            const replacementInput = document.createElement("input");
            replacementInput.type = "hidden";
            replacementInput.name = "replacement_user_id";
            replacementInput.value = replacementUserId;
            form.appendChild(replacementInput);
        }

        document.body.appendChild(form);
        form.submit();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Tandai Petugas Berhalangan
                </h3>

                {loading && (
                    <p className="text-sm text-gray-600">
                        Memuat informasi penugasan...
                    </p>
                )}

                {!loading && preview?.error && (
                    <p className="text-sm text-red-600">{preview.error}</p>
                )}

                {!loading && preview && !preview.error && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-1">
                            <p>
                                <strong>Petugas:</strong>{" "}
                                {preview.assignment.user_name}
                            </p>
                            <p>
                                <strong>Role:</strong>{" "}
                                {preview.assignment.role}
                            </p>
                            <p>
                                <strong>Tanggal:</strong>{" "}
                                {preview.schedule.formatted_date}
                            </p>
                            <p>
                                <strong>Jenis Apel:</strong>{" "}
                                {preview.schedule.type === "senin"
                                    ? "Senin"
                                    : "Jumat"}
                            </p>
                        </div>

                        {preview.next_schedule ? (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-sm text-green-800">
                                <p className="font-medium mb-1">
                                    Jadwal berikutnya tersedia
                                </p>
                                <p>
                                    Petugas akan ditukar dengan{" "}
                                    <strong>{preview.next_schedule.current_user}</strong>{" "}
                                    pada{" "}
                                    <strong>
                                        {preview.next_schedule.formatted_date}
                                    </strong>
                                    .
                                </p>
                                <p className="mt-2 text-xs text-green-700">
                                    Atau pilih pengganti manual di bawah jika
                                    Anda ingin memasang orang lain.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                                <p className="font-medium mb-1">
                                    Belum ada jadwal sejenis berikutnya
                                </p>
                                <p>
                                    Anda wajib memilih pengganti manual. Petugas
                                    yang berhalangan akan diprioritaskan pada
                                    jadwal berikutnya.
                                </p>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="replacement_user_id"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Pengganti Manual{" "}
                                {!preview.next_schedule && (
                                    <span className="text-red-600">*</span>
                                )}
                            </label>
                            <select
                                id="replacement_user_id"
                                value={replacementUserId}
                                onChange={(e) =>
                                    setReplacementUserId(e.target.value)
                                }
                                disabled={submitting}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">
                                    -- Pilih pengganti (opsional) --
                                </option>
                                {preview.eligible_users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.jenis_jabatan} -
                                        {" "}
                                        {user.gender === "L"
                                            ? "Laki-laki"
                                            : "Perempuan"}
                                        )
                                    </option>
                                ))}
                            </select>
                            {preview.eligible_users.length === 0 && (
                                <p className="mt-1 text-xs text-red-600">
                                    Tidak ada pengganti yang eligible.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <SecondaryButton
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Batal
                            </SecondaryButton>
                            <PrimaryButton disabled={submitting}>
                                {submitting
                                    ? "Menyimpan..."
                                    : "Konfirmasi Berhalangan"}
                            </PrimaryButton>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
