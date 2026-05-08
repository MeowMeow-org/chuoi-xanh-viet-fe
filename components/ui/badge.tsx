import * as React from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "outline";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: BadgeVariant;
};

const variantClassMap: Record<BadgeVariant, string> = {
    default:
        "border-[hsl(142,15%,88%)] bg-white text-[hsl(142,50%,25%)] hover:bg-[hsl(120,10%,95%)]",
    secondary:
        "border-transparent bg-[hsl(120,10%,95%)] text-[hsl(150,10%,20%)] hover:bg-[hsl(120,10%,92%)]",
    outline:
        "border-[hsl(142,15%,82%)] bg-transparent text-[hsl(150,10%,20%)] hover:bg-[hsl(120,10%,95%)]",
};

const Badge = React.forwardRef<
    HTMLDivElement,
    BadgeProps
>(({ className, variant = "default", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
            variantClassMap[variant],
            className
        )}
        {...props}
    />
))
Badge.displayName = "Badge"

export { Badge }
