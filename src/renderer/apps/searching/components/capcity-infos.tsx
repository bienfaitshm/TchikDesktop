"use client";

import React, { useState, useMemo } from "react";
import { Users, ChevronDown } from "lucide-react";
import { useGetStatsByClass } from "@/renderer/libs/queries/dashboard";
import type { ClassStatsDTO } from "@/packages/@core/data-access/db";
import { cn } from "@/renderer/utils";

/**
 * Represents a section group with computed cumulative total.
 */
export interface SectionGroup {
  sectionKey: string;
  sectionLabel: string;
  total: number;
  classes: ClassStatsDTO[];
}

/**
 * Props for the CapacityInfo component.
 */
export interface CapacityInfoProps {
  yearId: string;
  schoolId: string;
}

/**
 * Human-readable translations for academic section keys.
 */
const SECTION_LABELS: Record<string, string> = {
  KINDERGARTEN: "Maternelle",
  PRIMARY: "Primaire",
  SECONDARY: "Secondaire",
};

/**
 * Groups class items by section and computes totals per group.
 * @param classStats - Array of individual class statistics.
 * @returns Array of grouped sections sorted with computed totals.
 */
function groupClassStatsBySection(classStats: ClassStatsDTO[]): SectionGroup[] {
  const groupsMap = classStats.reduce<Record<string, SectionGroup>>(
    (acc, item) => {
      const key = item.section || "OTHER";
      if (!acc[key]) {
        acc[key] = {
          sectionKey: key,
          sectionLabel: SECTION_LABELS[key] || key,
          total: 0,
          classes: [],
        };
      }
      acc[key].total += item.value;
      acc[key].classes.push(item);
      return acc;
    },
    {},
  );

  return Object.values(groupsMap);
}

/**
 * Displays total student count and an expandable breakdown grouped by academic section.
 * @param props - Component parameters including schoolId and yearId.
 * @returns Accessible interactive capacity widget.
 */
export const CapacityInfo: React.FC<CapacityInfoProps> = ({
  schoolId,
  yearId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { data: classStats = [] } = useGetStatsByClass({ schoolId, yearId });

  const totalStudents = useMemo(() => {
    return classStats.reduce((total, current) => total + current.value, 0);
  }, [classStats]);

  const groupedSections = useMemo(() => {
    return groupClassStatsBySection(classStats);
  }, [classStats]);

  const toggleExpand = (): void => {
    setIsExpanded((previousState) => !previousState);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleExpand}
        aria-expanded={isExpanded}
        aria-controls="capacity-details-panel"
        className="bg-background/80 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl flex items-center gap-3 hover:bg-card transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
      >
        <div className="p-2 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
          <Users size={16} />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            Total Élèves
          </span>
          <span className="text-sm font-bold text-foreground leading-tight mt-0.5">
            {totalStudents.toLocaleString("fr-FR")}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-muted-foreground transition-transform duration-200 ml-1",
            isExpanded && "rotate-180",
          )}
        />
      </button>

      {isExpanded && (
        <div
          id="capacity-details-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl z-50 p-4 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Répartition par section
            </h4>
            <span className="text-xs font-medium text-muted-foreground">
              {groupedSections.length} Sections
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1 space-y-4">
            {groupedSections.length > 0 ? (
              groupedSections.map((group) => (
                <div key={group.sectionKey} className="space-y-2">
                  <div className="flex justify-between items-center bg-muted/40 px-3 py-1.5 rounded-lg border border-border/30">
                    <span className="text-xs font-bold text-foreground">
                      {group.sectionLabel}
                    </span>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {group.total.toLocaleString("fr-FR")} élèves
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {group.classes.map((item) => (
                      <div
                        key={item.classId}
                        className="flex justify-between items-center text-xs p-2 rounded-md bg-background/60 border border-border/40 hover:bg-accent/20 transition-colors"
                      >
                        <span
                          className="text-muted-foreground truncate mr-2 font-medium"
                          title={item.label}
                        >
                          {item.shortName || item.label}
                        </span>
                        <span className="font-bold text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
