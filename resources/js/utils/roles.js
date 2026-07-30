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

/**
 * Ordered list of roles used in an apel schedule.
 */
export function getRoles() {
    return [
        "Pembina Apel",
        "Pembaca Doa",
        "Pembaca 8 Nilai MA",
        "MC",
        "Pemimpin Apel",
        "Pembaca Lainnya",
    ];
}

/**
 * Get the ordered criteria for a role.
 *
 * Each criterion is an object with optional keys:
 *   - jenis_jabatan: string|string[]
 *   - gender: 'L' | 'P'
 *
 * The first criterion is the primary rule; subsequent entries are fallbacks.
 */
export function getRoleCriteria(role) {
    const criteria = {
        "Pembina Apel": [{ jenis_jabatan: "pimpinan" }],

        "Pembaca Doa": [
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "L" },
            { jenis_jabatan: "Staff", gender: "L" },
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "P" },
            { jenis_jabatan: "Staff", gender: "P" },
        ],

        "Pembaca 8 Nilai MA": [
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "P" },
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "L" },
            { jenis_jabatan: "Staff", gender: "P" },
            { jenis_jabatan: "Staff", gender: "L" },
        ],

        MC: [
            { jenis_jabatan: "Staff", gender: "P" },
            { jenis_jabatan: "Staff", gender: "L" },
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "P" },
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "L" },
        ],

        "Pemimpin Apel": [
            { jenis_jabatan: "Staff", gender: "L" },
            { jenis_jabatan: "Staff", gender: "P" },
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "L" },
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "P" },
        ],

        "Pembaca Lainnya": [
            { jenis_jabatan: "Staff", gender: "P" },
            { jenis_jabatan: "Staff", gender: "L" },
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "P" },
            { jenis_jabatan: ["Struktural", "Fungsional"], gender: "L" },
        ],
    };

    return criteria[role] || [];
}

/**
 * Check whether a user matches a single criterion.
 */
export function userMatchesCriterion(user, criterion) {
    if (!user.is_active) {
        return false;
    }

    if (criterion.gender && user.gender !== criterion.gender) {
        return false;
    }

    if (criterion.jenis_jabatan) {
        const allowed = Array.isArray(criterion.jenis_jabatan)
            ? criterion.jenis_jabatan
            : [criterion.jenis_jabatan];

        if (
            !allowed.some(
                (value) =>
                    value.toLowerCase() ===
                    (user.jenis_jabatan || "").toLowerCase(),
            )
        ) {
            return false;
        }
    }

    return true;
}

/**
 * Check if a user is eligible for a role using any criterion.
 */
export function isEligibleForRole(user, role) {
    const criteria = getRoleCriteria(role);

    return criteria.some((criterion) => userMatchesCriterion(user, criterion));
}

/**
 * Filter a list of users for a specific role.
 */
export function getEligibleUsersForRole(users, role) {
    return users.filter((user) => isEligibleForRole(user, role));
}
