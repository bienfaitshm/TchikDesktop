"use client";

import * as React from "react";
import { BookX } from "lucide-react";
import { cn } from "@/renderer/utils";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";

export interface Section<TData> {
  title?: string;
  data: TData[];
}

interface SidebarSectionListProps<TData> {
  sections: Section<TData>[];
  renderItem: (item: TData, index: number) => React.ReactNode;
  listHeaderComponent?: React.ReactNode;
  className?: string;
  emptyTitle?: string;
}

const SidebarSectionGroup = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <section className="px-2 py-4 space-y-1">
    {title && (
      <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 select-none">
        {title}
      </h3>
    )}
    <div className="space-y-1">{children}</div>
  </section>
);

export function SidebarSectionList<TData>({
  sections,
  renderItem,
  listHeaderComponent,
  className,
  emptyTitle = "Aucun élément",
}: SidebarSectionListProps<TData>) {
  const isEmpty = React.useMemo(
    () => sections.every((s) => s.data.length === 0),
    [sections],
  );

  const content = React.useMemo(() => {
    if (isEmpty) {
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
      <div className="divide-y divide-border/40">
        {sections.map(
          (section, sIndex) =>
            section.data.length > 0 && (
              <SidebarSectionGroup
                key={section.title ?? sIndex}
                title={section.title}
              >
                {section.data.map((item, iIndex) => renderItem(item, iIndex))}
              </SidebarSectionGroup>
            ),
        )}
      </div>
    );
  }, [sections, renderItem, emptyTitle, isEmpty]);

  return (
    <div className={cn("flex flex-col h-full bg-sidebar", className)}>
      {listHeaderComponent && (
        <header className="shrink-0 p-4 border-b bg-background/50 backdrop-blur-md z-5">
          {listHeaderComponent}
        </header>
      )}

      <ScrollArea className="flex-1 h-full">{content}</ScrollArea>
    </div>
  );
}

SidebarSectionList.displayName = "SidebarSectionList";
