import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex items-center rounded-full border border-[hsl(142,15%,88%)] bg-white px-2.5 py-0.5 text-xs font-semibold text-[hsl(142,50%,25%)] transition-colors hover:bg-[hsl(120,10%,95%)]",
            className
        )}
        {...props}
    />
))
Badge.displayName = "Badge"

export { Badge }
