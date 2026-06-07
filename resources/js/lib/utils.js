import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function untuk menggabungkan class names dengan Tailwind merge.
 * Ini adalah standar shadcn/ui untuk menghindari konflik class.
 * Digunakan di semua komponen baru untuk style yang bersih dan type-safe.
 *
 * @param {...any} inputs - Class names, objects, arrays, dll.
 * @returns {string} Class string yang sudah di-merge.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
