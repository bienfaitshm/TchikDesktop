"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { flexRender, RowData, type Row } from "@tanstack/react-table";
import { Button } from "@/renderer/components/ui/button";
import { TableCell, TableRow } from "@/renderer/components/ui/table";
import { cn } from "@/renderer/utils";
import { TableFeature } from "./hooks";

interface ExpandableContextValue {
  isExpanded: boolean;
  toggle: () => void;
}

export interface ExpandableRowProps<
  TData extends RowData,
> extends React.HTMLAttributes<HTMLTableRowElement> {
  row: Row<TableFeature, TData>;
  renderDetail?: React.ReactNode;
  showDetailOnClick?: boolean;
}

const ExpandableContext = React.createContext<
  ExpandableContextValue | undefined
>(undefined);

/**
 * Accesses the expandable row context, throwing an error if used outside a provider.
 * @returns The boolean expanded state and toggle function.
 */
function useExpandable(): ExpandableContextValue {
  const context = React.useContext(ExpandableContext);
  if (!context)
    throw new Error("useExpandable must be used within an <ExpandableRow />");
  return context;
}

/**
 * Renders a clickable trigger icon to toggle the expandable row state.
 */
export const ExpandableTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { isExpanded, toggle } = useExpandable();

  return (
    <Button
      {...props}
      ref={ref}
      variant="ghost"
      size="xs"
      onClick={() => toggle()}
      className={cn("cursor-pointer rounded-b-sm", className)}
    >
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <ChevronDown className="h-4 w-4 rotate-none group-hover:text-foreground transition-all" />
      </motion.div>
    </Button>
  );
});
ExpandableTrigger.displayName = "ExpandableTrigger";

/**
 * Renders the animated hidden content cell spanning all visible table columns.
 * @param props - Wrapper properties containing the child elements and total column span.
 * @returns The animated expandable cell component.
 */
function ExpandableContent({
  children,
  colSpan,
}: {
  children?: React.ReactNode;
  colSpan: number;
}) {
  const { isExpanded } = useExpandable();

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <TableRow className="border-none bg-muted/20">
          <TableCell colSpan={colSpan} className="p-0">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: {
                  height: { duration: 0.3, ease: "easeOut" },
                  opacity: { duration: 0.2, delay: 0.1 },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: { duration: 0.2, ease: "easeIn" },
                  opacity: { duration: 0.1 },
                },
              }}
              className="overflow-hidden"
            >
              <div className="p-4 w-full">
                {children || (
                  <p className="text-sm text-muted-foreground italic text-center">
                    Aucune information supplémentaire.
                  </p>
                )}
              </div>
            </motion.div>
          </TableCell>
        </TableRow>
      )}
    </AnimatePresence>
  );
}

/**
 * A table row component that can be expanded to reveal additional sub-content.
 */
export const ExpandableRow = React.memo(
  <TData extends RowData>({
    row,
    renderDetail,
    children,
    className,
    onClick,
    showDetailOnClick = true,
    ...props
  }: ExpandableRowProps<TData>) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const toggle = React.useCallback(() => setIsExpanded((prev) => !prev), []);
    const visibleCells = row.getVisibleCells();

    return (
      <ExpandableContext.Provider value={{ isExpanded, toggle }}>
        <TableRow
          data-state={row.getIsSelected() ? "selected" : undefined}
          aria-expanded={isExpanded}
          className={cn(
            "group transition-colors hover:bg-muted/20",
            isExpanded && "bg-muted/20",
            className,
          )}
          onClick={onClick}
          {...props}
        >
          {visibleCells.map((cell) => (
            <TableCell key={cell.id} className="p-3 text-sm font-medium">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
        <ExpandableContent colSpan={visibleCells.length}>
          {renderDetail}
        </ExpandableContent>
      </ExpandableContext.Provider>
    );
  },
);
ExpandableRow.displayName = "ExpandableRow";
