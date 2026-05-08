"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

const Tabs = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        defaultValue?: string
        value?: string
        onValueChange?: (value: string) => void
    }
>(({ defaultValue = "", value, onValueChange, className, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback(
        (newValue: string) => {
            setInternalValue(newValue)
            onValueChange?.(newValue)
        },
        [onValueChange]
    )

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div ref={ref} className={cn("", className)} {...props} />
        </TabsContext.Provider>
    )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex items-center gap-1 rounded-lg bg-[hsl(120,10%,94%)] p-1",
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, onClick, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    const isActive = context?.value === value

    return (
        <button
            ref={ref}
            type="button"
            onClick={(e) => {
                context?.onValueChange(value)
                onClick?.(e)
            }}
            className={cn(
                "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
                isActive && "bg-white text-foreground shadow-sm",
                !isActive && "text-[hsl(150,7%,45%)]",
                className
            )}
            {...props}
        />
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    const isActive = context?.value === value

    if (!isActive) return null

    return (
        <div
            ref={ref}
            className={cn(
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
            {...props}
        />
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }

