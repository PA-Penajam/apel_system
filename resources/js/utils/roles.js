export const ROLE_ICONS = {
    "Pembina Apel": "👔",
    "Pembaca Doa": "🤲",
    "Pembaca 8 Nilai MA": "📖",
    MC: "🎤",
    "Pemimpin Apel": "⭐",
    "Pembaca Lainnya": "📋",
};

export const ROLE_COLORS = {
    "Pembina Apel": "bg-purple-100 border-purple-200 text-purple-800",
    "Pembaca Doa": "bg-green-100 border-green-200 text-green-800",
    "Pembaca 8 Nilai MA": "bg-pink-100 border-pink-200 text-pink-800",
    MC: "bg-yellow-100 border-yellow-200 text-yellow-800",
    "Pemimpin Apel": "bg-blue-100 border-blue-200 text-blue-800",
    "Pembaca Lainnya": "bg-gray-100 border-gray-200 text-gray-800",
};

export function getRoleIcon(role) {
    return ROLE_ICONS[role] || "📌";
}

export function getRoleColor(role) {
    return ROLE_COLORS[role] || "bg-gray-100 border-gray-200 text-gray-800";
}

// Untuk ScheduleEditModal (bisa di-expand nanti)
export function getRoleCriteria(role) {
    const criteria = {
        "Pembina Apel": { jenis_jabatan: "pimpinan" },
        "Pembaca Doa": { jenis_pegawai: ["PNS", "CPNS"], jenis_jabatan: "!pimpinan", gender: "L" },
        "Pembaca 8 Nilai MA": { jenis_pegawai: "PNS", jenis_jabatan: "!pimpinan", gender: "P" },
        MC: { jenis_pegawai: ["CPNS", "PPPK"], jenis_jabatan: ["!pimpinan", "Staff"], gender: "P" },
        "Pemimpin Apel": { jenis_pegawai: "PPPK", jenis_jabatan: "!pimpinan", gender: "L" },
        "Pembaca Lainnya": { jenis_pegawai: ["PNS", "CPNS"], jenis_jabatan: ["!pimpinan", "Staff"] },
    };
    return criteria[role] || {};
}
