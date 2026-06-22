"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { flexRender, type Row } from "@tanstack/react-table";
import { Button } from "@/renderer/components/ui/button";
import { TableCell, TableRow } from "@/renderer/components/ui/table";
import { cn } from "@/renderer/utils";

interface ExpandableContextValue {
  isExpanded: boolean;
  toggle: () => void;
}

interface ExpandableRowProps<
  TData,
> extends React.HTMLAttributes<HTMLTableRowElement> {
  row: Row<TData>;
  renderDetail?: React.ReactNode;
  showDetailOnClick?: boolean;
}

const ExpandableContext = React.createContext<
  ExpandableContextValue | undefined
>(undefined);

const useExpandable = () => {
  const context = React.useContext(ExpandableContext);
  if (!context) {
    throw new Error("useExpandable must be used within an <ExpandableRow />");
  }
  return context;
};

/**
 * ExpandableRowTrigger: La flèche de rotation isolée
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
        <ChevronDown
          className={cn(
            "h-4 w-4 rotate-none group-hover:text-foreground transition-all",
          )}
        />
      </motion.div>
    </Button>
  );
});
ExpandableTrigger.displayName = "ExpandableTrigger";

/**
 * ExpandableContent: Gère l'animation et le colspan automatique
 */
const ExpandableContent = ({
  children,
  colSpan,
}: {
  children?: React.ReactNode;
  colSpan: number;
}) => {
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
};

/**
 * Main ExpandableRow Component
 */
export const ExpandableRow = React.memo(
  <TData,>({
    row,
    renderDetail,
    children,
    className,
    onClick,
    showDetailOnClick = true,
    ...props
  }: ExpandableRowProps<TData>) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const toggle = React.useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const visibleColumnsCount = row.getVisibleCells().length;

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
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className="p-3 text-sm font-medium">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>

        <ExpandableContent colSpan={visibleColumnsCount}>
          {renderDetail}
        </ExpandableContent>
      </ExpandableContext.Provider>
    );
  },
);
ExpandableRow.displayName = "ExpandableRow";
