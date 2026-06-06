import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(true);
    const [currentFlash, setCurrentFlash] = useState(null);

    useEffect(() => {
        if (flash?.success || flash?.error || flash?.warning) {
            setCurrentFlash(flash);
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!currentFlash || !visible) return null;

    const { success, error, warning } = currentFlash;

    let message = success || error || warning;
    let type = success ? 'success' : error ? 'error' : 'warning';

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
    };

    return (
        <div className={`fixed top-4 right-4 z-[100] max-w-sm w-full shadow-lg rounded-lg border p-4 ${styles[type]}`}>
            <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{icons[type]}</span>
                <div className="flex-1 text-sm font-medium">{message}</div>
                <button
                    onClick={() => setVisible(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                    aria-label="Tutup notifikasi"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
