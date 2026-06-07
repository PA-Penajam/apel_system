import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button component dengan style shadcn/ui + Magic UI polish.
 *
 * Variants mengikuti semantic tokens yang sudah ada (primary, danger, success, surface).
 * Size variants modern.
 * Mendukung asChild (Slot) untuk komposisi (misal <Button asChild><Link>...</Link></Button>).
 *
 * Magic UI touch:
 * - Subtle shine effect pada variant "magic" (bisa dikombinasikan).
 * - Smooth transitions + focus ring yang visible.
 *
 * Contoh penggunaan:
 * <Button variant="default">Primary</Button>
 * <Button variant="destructive" size="sm">Danger</Button>
 * <Button variant="outline">Secondary</Button>
 * <Button variant="success">Success</Button>
 * <Button variant="magic">Magic animated</Button>
 */

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                destructive: "bg-danger text-danger-foreground hover:bg-danger/90 shadow-sm",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-surface text-foreground hover:bg-muted shadow-sm border border-border",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
                // Magic UI inspired variant — subtle shine + premium feel
                magic: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm magic-shine relative overflow-hidden",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3 text-xs",
                lg: "h-11 rounded-lg px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

/**
 * Button shadcn + Magic UI
 *
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.variant] - default | destructive | outline | secondary | ghost | link | success | magic
 * @param {string} [props.size] - default | sm | lg | icon
 * @param {boolean} [props.asChild] - gunakan Slot untuk komposisi
 */
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    );
});
Button.displayName = "Button";

export { Button, buttonVariants };
