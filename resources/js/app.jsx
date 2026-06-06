import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

// Flash messages global ditangani oleh komponen FlashMessages.jsx
// yang di-render di dalam layout (AuthenticatedLayout & GuestLayout).
// Progress bar menggunakan warna indigo agar konsisten dengan gradient branding yang dipakai di UI.

const appName = import.meta.env.VITE_APP_NAME || 'Sistem Penjadwalan Apel PA Penajam';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#6366f1', // indigo-500
    },
});
