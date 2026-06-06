import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const roles = [
        {
            name: "Pembina Apel",
            icon: "👔",
            color: "bg-purple-100 border-purple-200 text-purple-800",
        },
        {
            name: "Pembaca Doa",
            icon: "🤲",
            color: "bg-green-100 border-green-200 text-green-800",
        },
        {
            name: "Pembaca 8 Nilai MA",
            icon: "📖",
            color: "bg-pink-100 border-pink-200 text-pink-800",
        },
        {
            name: "MC",
            icon: "🎤",
            color: "bg-yellow-100 border-yellow-200 text-yellow-800",
        },
        {
            name: "Pemimpin Apel",
            icon: "⭐",
            color: "bg-blue-100 border-blue-200 text-blue-800",
        },
        {
            name: "Pembaca Lainnya",
            icon: "📋",
            color: "bg-gray-100 border-gray-200 text-gray-800",
        },
    ];

    const fiturUtama = [
        {
            icon: "📅",
            title: "Penjadwalan Terstruktur",
            desc: "Mengelola jadwal apel harian dengan mudah dan terorganisir untuk PA Penajam.",
        },
        {
            icon: "📱",
            title: "Notifikasi WhatsApp via Fonnte",
            desc: "Pengiriman notifikasi otomatis ke peserta apel menggunakan integrasi Fonnte.",
        },
        {
            icon: "👥",
            title: "Manajemen 6 Peran",
            desc: "Dukungan lengkap untuk semua peran apel: Pembina, Doa, 8 Nilai MA, MC, Pemimpin, dan Lainnya.",
        },
        {
            icon: "📊",
            title: "Dashboard & Riwayat",
            desc: "Pantau statistik, jadwal mendatang, dan riwayat notifikasi yang gagal.",
        },
    ];

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gray-50 text-gray-900">
                {/* Navigasi Atas - link auth kondisional (hanya Masuk/Dashboard berdasarkan auth.user, tanpa expose register) */}
                <nav className="border-b border-gray-200 bg-white">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚖️</span>
                            <span className="font-semibold text-xl text-gray-900">PA Penajam</span>
                        </div>
                        <div className="-mx-3 flex items-center">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                                >
                                    Masuk
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section - nama sistem + tagline, gradien biru-indigo mengikuti pola Dashboard */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20 text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                            Sistem Penjadwalan Apel
                            <span className="block text-blue-200">PA Penajam</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
                            Platform resmi untuk pengelolaan jadwal dan pelaksanaan apel di Pengadilan Agama Penajam.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold bg-white text-blue-700 rounded-lg shadow hover:bg-blue-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    Masuk ke Sistem
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold bg-white text-blue-700 rounded-lg shadow hover:bg-blue-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    Masuk ke Sistem
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Penjelasan Singkat - deskripsi PA Penajam + integrasi Fonnte */}
                <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Sistem Penjadwalan Apel PA Penajam dirancang khusus untuk mendukung pelaksanaan apel rutin di lingkungan Pengadilan Agama Penajam.
                        Dengan dukungan 6 peran utama dan integrasi notifikasi WhatsApp melalui Fonnte, sistem ini memastikan komunikasi yang cepat, akurat, dan terdokumentasi dengan baik.
                    </p>
                </div>

                {/* Fitur Utama cards */}
                <div className="bg-white py-12 border-t border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Fitur Utama</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {fiturUtama.map((fitur, index) => (
                                <div
                                    key={index}
                                    className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 p-6 hover:shadow-md transition"
                                >
                                    <div className="text-4xl mb-4">{fitur.icon}</div>
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{fitur.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{fitur.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid 6 Peran - ikon & warna Tailwind persis mengikuti pola Dashboard.jsx (getRoleIcon/getRoleColor: purple, green, pink, yellow, blue, gray) */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">6 Peran dalam Pelaksanaan Apel</h2>
                    <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                        Setiap apel melibatkan peran-peran berikut untuk memastikan kelancaran acara sesuai standar PA Penajam.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {roles.map((role, index) => (
                            <div
                                key={index}
                                className={`${role.color} border rounded-xl p-6 text-center transition hover:shadow-sm`}
                            >
                                <div className="text-5xl mb-3" aria-hidden="true">{role.icon}</div>
                                <div className="font-semibold text-base">{role.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Besar "Masuk ke Sistem" - route kondisional berdasarkan auth, gradien sesuai Dashboard */}
                <div className="bg-gray-100 py-16 border-t border-gray-200">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">Siap Mengelola Apel?</h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Masuk ke sistem untuk mengakses dashboard, mengelola jadwal, dan mengirim notifikasi.
                        </p>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                            >
                                Masuk ke Sistem
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                            >
                                Masuk ke Sistem
                            </Link>
                        )}
                    </div>
                </div>

                {/* Footer minimal - profesional, tanpa marketing Laravel/version */}
                <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        © {new Date().getFullYear()} Pengadilan Agama Penajam. Sistem Penjadwalan Apel.
                    </div>
                </footer>
            </div>
        </>
    );
}
