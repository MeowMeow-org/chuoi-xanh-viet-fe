import * as React from "react";

import { cn } from "@/lib/utils";

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => {
    return (
        <select
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                props.className,
            )}
            {...props}
        >
            {children}
        </select>
    );
};

const SelectTrigger = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
        )}
        {...props}
    />
);

const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ children, value }: React.OptionHTMLAttributes<HTMLOptionElement>) => <option value={value}>{children}</option>;
const SelectValue = ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder}</option>;

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
