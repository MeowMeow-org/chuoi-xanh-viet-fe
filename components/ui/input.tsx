import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "my-2 w-full min-w-0 border transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        type === "file"
          ? cn(
              "min-h-11 rounded-lg border-[hsl(142,20%,88%)] bg-[hsl(120,25%,98%)] px-3 py-2.5 text-sm text-foreground file:me-3 file:inline-flex file:h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:text-sm file:font-semibold file:text-primary-foreground file:shadow-sm file:transition-colors hover:file:bg-primary/90 active:file:bg-primary/85 disabled:bg-input/50 dark:border-input dark:bg-input/30 dark:disabled:bg-input/80",
            )
          : cn(
              "h-8 rounded-sm border-input bg-transparent px-2.5 py-1 text-base text-foreground placeholder:text-muted-foreground disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80",
            ),
        className,
      )}
      {...props}
    />
  )
}

export { Input }
