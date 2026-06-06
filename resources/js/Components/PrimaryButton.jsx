export default function PrimaryButton({
    className = '',
    disabled,
    variant = 'primary',
    children,
    ...props
}) {
    // Variant support menggunakan design tokens baru (Fase 3).
    // Default diubah menjadi rounded-lg + text-sm (bukan xs uppercase Breeze lama)
    // agar cocok dengan tombol custom modern yang dipakai di Dashboard & Schedules.
    const baseClasses =
        'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ';

    const variantClasses = {
        primary:
            'bg-primary text-white hover:bg-primary/90 focus:ring-primary active:bg-primary/95',
        danger:
            'bg-danger text-white hover:bg-danger/90 focus:ring-danger active:bg-danger/95',
        success:
            'bg-success text-white hover:bg-success/90 focus:ring-success active:bg-success/95',
        secondary:
            'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border-gray-300 active:bg-gray-300',
    };

    const classes =
        baseClasses +
        (variantClasses[variant] || variantClasses.primary) +
        ' ' +
        className;

    return (
        <button {...props} className={classes} disabled={disabled}>
            {children}
        </button>
    );
}
