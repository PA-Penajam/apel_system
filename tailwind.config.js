import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },

            // Semantic design tokens (Fase 3 foundation)
            // Warna primary mengikuti keluarga indigo/blue yang dipakai di hero/CTA.
            // Menggunakan hsl(var(--xxx) / <alpha-value>) agar modifier opacity seperti bg-primary/90 berfungsi.
            // Role colors (purple/green/pink untuk 6 peran) tetap via utils/roles.js + skala Tailwind agar tidak ada breakage di luar file yang disentuh.
            colors: {
                primary: 'hsl(var(--primary) / <alpha-value>)',
                danger: 'hsl(var(--danger) / <alpha-value>)',
                success: 'hsl(var(--success) / <alpha-value>)',
                surface: 'hsl(var(--surface) / <alpha-value>)',
            },

            // Border radius sebagai token untuk konsistensi modern (rounded-lg/xl/2xl sudah dipakai di banyak tempat)
            borderRadius: {
                lg: '0.5rem',
                xl: '0.75rem',
                '2xl': '1rem',
            },

            // Shadow tambahan untuk kartu (tidak override default shadow-sm/shadow agar visual existing tidak berubah)
            boxShadow: {
                card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            },

            // Transition timing modern default
            transitionTimingFunction: {
                DEFAULT: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            },
        },
    },

    plugins: [forms],
};
