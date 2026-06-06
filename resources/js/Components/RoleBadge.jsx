import { getRoleIcon, getRoleColor } from '@/utils/roles';

/**
 * Komponen reusable untuk menampilkan badge peran apel.
 * Menggunakan utilitas terpusat untuk ikon dan warna (DRY).
 * Mendukung className kustom dan children untuk konten tambahan.
 *
 * @param {Object} props
 * @param {string} props.role - Nama peran (kunci di ROLE_ICONS/ROLE_COLORS)
 * @param {boolean} [props.showIcon=true] - Apakah menampilkan ikon emoji
 * @param {string} [props.className=''] - Class Tailwind tambahan untuk wrapper
 * @param {React.ReactNode} [props.children] - Konten tambahan setelah label role
 * @returns {JSX.Element}
 */
export default function RoleBadge({ role, showIcon = true, className = '', children }) {
    const icon = getRoleIcon(role);
    const colorClass = getRoleColor(role);

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
        >
            {showIcon && <span aria-hidden="true">{icon}</span>}
            <span>{role}</span>
            {children}
        </span>
    );
}
