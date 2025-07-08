import { Input, InputProps } from "@renderer/components/ui/input"
import { cn } from "@renderer/utils"
import { Search } from "lucide-react"
import React from "react"

const InputSearch = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("flex items-center border-b px-3 w-full")}>
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)

InputSearch.displayName = "InputSearch"
export default InputSearch
