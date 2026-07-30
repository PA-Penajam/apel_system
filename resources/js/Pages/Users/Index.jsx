import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import UserModal from "./UserModal";
import ConfirmDialog from "@/Components/ConfirmDialog";

export default function Index({ users, auth }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
    const [jenisFilter, setJenisFilter] = useState("all");

    const handleAdd = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleToggleStatus = (user) => {
        const isCurrentlyActive = Boolean(user.is_active);
        const actionText = isCurrentlyActive ? "menonaktifkan" : "mengaktifkan";
        
        setConfirmDialog({
            title: isCurrentlyActive ? "Nonaktifkan Pegawai" : "Aktifkan Pegawai",
            message: `Apakah Anda yakin ingin ${actionText} ${user.name}? ${isCurrentlyActive ? "Pegawai yang dinonaktifkan tidak akan mendapat jadwal baru." : ""}`,
            isDanger: isCurrentlyActive,
            action: () => {
                setIsProcessing(true);
                router.patch(
                    route("users.toggle-status", user.id),
                    {},
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onFinish: () => {
                            setIsProcessing(false);
                            setConfirmDialog(null);
                        },
                    }
                );
            },
        });
    };

    // Filtered users calculation
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            // Search query filter (Name, NIP, Jabatan)
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                !searchQuery ||
                user.name.toLowerCase().includes(query) ||
                (user.nip && user.nip.toLowerCase().includes(query)) ||
                (user.jabatan && user.jabatan.toLowerCase().includes(query));

            // Status filter
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && user.is_active) ||
                (statusFilter === "inactive" && !user.is_active);

            // Jenis pegawai filter
            const matchesJenis =
                jenisFilter === "all" || user.jenis_pegawai === jenisFilter;

            return matchesSearch && matchesStatus && matchesJenis;
        });
    }, [users, searchQuery, statusFilter, jenisFilter]);

    // Unique jenis pegawai options
    const jenisPegawaiOptions = useMemo(() => {
        const set = new Set(users.map((u) => u.jenis_pegawai).filter(Boolean));
        return Array.from(set);
    }, [users]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">👥 Manajemen Pegawai</h2>}
        >
            <Head title="Pegawai - PA Penajam" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Daftar Pegawai</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Kelola data pegawai dan status keaktifan petugas apel. Total: {users.length} pegawai.
                            </p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                        >
                            <span>+</span> Tambah Pegawai
                        </button>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="w-full md:w-96 relative">
                            <input
                                type="text"
                                placeholder="🔍 Cari nama, NIP, atau jabatan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                                >
                                    ✕ Clear
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Filter Status */}
                            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium text-gray-600">
                                <button
                                    onClick={() => setStatusFilter("all")}
                                    className={`px-3 py-1.5 rounded-md transition-all ${statusFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "hover:text-gray-900"}`}
                                >
                                    Semua ({users.length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter("active")}
                                    className={`px-3 py-1.5 rounded-md transition-all ${statusFilter === "active" ? "bg-white text-green-700 shadow-sm font-bold" : "hover:text-gray-900"}`}
                                >
                                    Aktif ({users.filter((u) => u.is_active).length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter("inactive")}
                                    className={`px-3 py-1.5 rounded-md transition-all ${statusFilter === "inactive" ? "bg-white text-red-700 shadow-sm font-bold" : "hover:text-gray-900"}`}
                                >
                                    Nonaktif ({users.filter((u) => !u.is_active).length})
                                </button>
                            </div>

                            {/* Filter Jenis Pegawai */}
                            {jenisPegawaiOptions.length > 0 && (
                                <select
                                    value={jenisFilter}
                                    onChange={(e) => setJenisFilter(e.target.value)}
                                    className="text-xs rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                                >
                                    <option value="all">Semua Tipe Pegawai</option>
                                    {jenisPegawaiOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left">Nama & NIP</th>
                                        <th className="px-6 py-3.5 text-left">Kategori Jabatan</th>
                                        <th className="px-6 py-3.5 text-left">Jenis Kelamin</th>
                                        <th className="px-6 py-3.5 text-left">Tipe Pegawai</th>
                                        <th className="px-6 py-3.5 text-left">Status</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={!user.is_active ? "bg-red-50/30 opacity-75" : "hover:bg-gray-50 transition-colors"}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.is_active ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-semibold text-gray-900">{user.name}</div>
                                                        <div className="text-xs text-gray-500">{user.nip || "NIP: -"}</div>
                                                        {user.jabatan && (
                                                            <div className="text-xs text-gray-400">{user.jabatan}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                                                    {user.jenis_jabatan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {user.gender === "L" ? "Laki-laki" : user.gender === "P" ? "Perempuan" : "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {user.jenis_pegawai}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.is_active ? (
                                                    <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                        ● Aktif
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                        ○ Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-3">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`font-semibold ${user.is_active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}`}
                                                >
                                                    {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                Tidak ada data pegawai yang sesuai dengan filter/pencarian.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <UserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    user={editingUser}
                />

                <ConfirmDialog
                    show={!!confirmDialog}
                    onClose={() => setConfirmDialog(null)}
                    onConfirm={confirmDialog?.action}
                    title={confirmDialog?.title}
                    message={confirmDialog?.message}
                    confirmText="Ya, Lanjutkan"
                    isDanger={confirmDialog?.isDanger}
                    processing={isProcessing}
                />
            </div>
        </AuthenticatedLayout>
    );
}
