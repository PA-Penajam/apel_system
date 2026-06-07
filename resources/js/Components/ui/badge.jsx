import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge component (shadcn style) — cocok untuk status, role labels, dll.
 * Magic UI: subtle border + modern rounded.
 *
 * Variants disesuaikan dengan role colors existing + semantic.
 */
const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
                destructive: "border-transparent bg-danger text-danger-foreground hover:bg-danger/80",
                success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
                outline: "text-foreground",
                // Role-specific variants (untuk 6 peran apel) — warna pastel existing
                pembina: "border-purple-200 bg-purple-100 text-purple-800",
                doa: "border-green-200 bg-green-100 text-green-800",
                nilai: "border-pink-200 bg-pink-100 text-pink-800",
                mc: "border-yellow-200 bg-yellow-100 text-yellow-800",
                pemimpin: "border-blue-200 bg-blue-100 text-blue-800",
                lainnya: "border-gray-200 bg-gray-100 text-gray-800",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
