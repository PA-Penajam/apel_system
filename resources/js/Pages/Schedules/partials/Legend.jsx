/**
 * Legend
 *
 * Diekstrak dari Schedules/Index.jsx (Task 11 - split monolitik).
 * Komponen kecil untuk "Keterangan Peran".
 *
 * Berisi grid 6 peran dengan emoji + nama (Pembina Apel, Pembaca Doa, dll).
 * Walaupun sederhana dan statis, diekstrak untuk:
 * - Konsistensi (semua section besar di Schedules punya partial sendiri).
 * - Kemudahan maintenance jika suatu saat legend perlu diubah (misal tambah tooltip atau warna).
 * - Menjaga Index tetap tipis sebagai pure coordinator.
 *
 * Tidak ada props/state. Visual & teks persis sama seperti sebelumnya.
 */
export default function Legend() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h4 className="font-semibold text-gray-700 mb-4">
                📋 Keterangan Peran
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span>👔</span>
                    <span>Pembina Apel</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>🤲</span>
                    <span>Pembaca Doa</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>📖</span>
                    <span>Pembaca 8 Nilai</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>🎤</span>
                    <span>MC</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>⭐</span>
                    <span>Pemimpin Apel</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>📋</span>
                    <span>Pembaca Lainnya</span>
                </div>
            </div>
        </div>
    );
}
