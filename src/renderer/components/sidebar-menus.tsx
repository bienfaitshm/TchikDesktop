"use client";

import * as React from "react";
import { BookX } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/renderer/utils";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";

interface SidebarFlatListProps<TData> {
  data: TData[];
  renderItem: (item: TData, index: number) => React.ReactNode;
  listHeaderComponent?: React.ReactNode;
  className?: string;
  emptyTitle?: string;
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  asChild?: boolean;
}

const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ className, isActive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 px-3 h-9 rounded-md text-xs font-medium transition-all outline-hidden",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "cursor-pointer select-none",
          isActive
            ? "bg-secondary text-secondary-foreground-foreground shadow-xs"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarItem.displayName = "SidebarItem";

export function SidebarFlatList<TData>({
  data,
  renderItem,
  listHeaderComponent,
  className,
  emptyTitle = "Aucun résultat",
}: SidebarFlatListProps<TData>) {
  const content = React.useMemo(() => {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="rounded-full bg-muted p-3 mb-3">
            <BookX className="size-6 text-muted-foreground/60 stroke-[1.5]" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            {emptyTitle}
          </p>
        </div>
      );
    }

    return (
      <nav className="p-2 space-y-1">
        {data.map((item, index) => (
          <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
        ))}
      </nav>
    );
  }, [data, renderItem, emptyTitle]);

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r", className)}>
      {listHeaderComponent && (
        <header className="shrink-0 p-4 border-b bg-background/50 backdrop-blur-md z-10">
          {listHeaderComponent}
        </header>
      )}

      <ScrollArea className="flex-1">{content}</ScrollArea>
    </div>
  );
}

SidebarFlatList.displayName = "SidebarFlatList";
export { SidebarItem };
