import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import Modal from "@/Components/Modal";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

export default function UserModal({ isOpen, onClose, user = null }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: "",
        nip: "",
        email: "",
        jabatan: "",
        jenis_pegawai: "PNS",
        jenis_jabatan: "Staff",
        gender: "L",
        phone: "",
        is_active: true,
    });

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setData({
                    name: user.name || "",
                    nip: user.nip || "",
                    email: user.email || "",
                    jabatan: user.jabatan || "",
                    jenis_pegawai: user.jenis_pegawai || "PNS",
                    jenis_jabatan: user.jenis_jabatan || "Staff",
                    gender: user.gender || "L",
                    phone: user.phone || "",
                    is_active: Boolean(user.is_active),
                });
            } else {
                reset();
                setData("is_active", true);
            }
            clearErrors();
        }
    }, [isOpen, user]);

    const submit = (e) => {
        e.preventDefault();

        if (user) {
            put(route("users.update", user.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route("users.store"), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                    {user ? "Edit Pegawai" : "Tambah Pegawai Baru"}
                </h2>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Lengkap *" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="nip" value="NIP" />
                            <TextInput
                                id="nip"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.nip}
                                onChange={(e) => setData("nip", e.target.value)}
                            />
                            <InputError message={errors.nip} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="gender" value="Jenis Kelamin *" />
                            <select
                                id="gender"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.gender}
                                onChange={(e) => setData("gender", e.target.value)}
                                required
                            >
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Jenis kelamin menentukan eligibility petugas untuk setiap role apel.
                            </p>
                            <InputError message={errors.gender} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="No. WhatsApp" />
                            <TextInput
                                id="phone"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                placeholder="08..."
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="jabatan" value="Jabatan Spesifik" />
                            <TextInput
                                id="jabatan"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.jabatan}
                                onChange={(e) => setData("jabatan", e.target.value)}
                            />
                            <InputError message={errors.jabatan} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="jenis_pegawai" value="Jenis Pegawai *" />
                            <select
                                id="jenis_pegawai"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.jenis_pegawai}
                                onChange={(e) => setData("jenis_pegawai", e.target.value)}
                                required
                            >
                                <option value="PNS">PNS</option>
                                <option value="CPNS">CPNS</option>
                                <option value="PPPK">PPPK</option>
                                <option value="Hakim">Hakim</option>
                                <option value="Honorer">Honorer</option>
                            </select>
                            <InputError message={errors.jenis_pegawai} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="jenis_jabatan" value="Kategori Jabatan *" />
                            <select
                                id="jenis_jabatan"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.jenis_jabatan}
                                onChange={(e) => setData("jenis_jabatan", e.target.value)}
                                required
                            >
                                <option value="pimpinan">Pimpinan</option>
                                <option value="Struktural">Struktural</option>
                                <option value="Fungsional">Fungsional</option>
                                <option value="Staff">Staff</option>
                            </select>
                            <InputError message={errors.jenis_jabatan} className="mt-2" />
                        </div>
                    </div>

                    {/* Status Keaktifan Checkbox */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
                        <label className="flex items-center cursor-pointer space-x-3">
                            <input
                                type="checkbox"
                                checked={Boolean(data.is_active)}
                                onChange={(e) => setData("is_active", e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 h-5 w-5"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Pegawai Aktif (Ikut serta dalam rotasi petugas apel)
                            </span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end mt-6 gap-3 pt-6 border-t border-gray-200">
                        <SecondaryButton onClick={onClose} disabled={processing}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? "Menyimpan..." : "Simpan Pegawai"}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
