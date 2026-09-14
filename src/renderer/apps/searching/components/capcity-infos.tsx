import React, { useState, useMemo } from "react";
import { Users, ChevronLeft } from "lucide-react";
import { useGetStatsByClass } from "@/renderer/libs/queries/dashboard";
import type { ClassStatsDTO } from "@/packages/@core/data-access/db";

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
 * @param classStats - List of individual class statistics.
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

  const toggleExpand = () => {
    setIsExpanded((previousState) => !previousState);
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex items-start justify-end gap-2">
      <button
        type="button"
        onClick={toggleExpand}
        aria-expanded={isExpanded}
        aria-controls="capacity-details-panel"
        className="bg-background/80 backdrop-blur-md border border-border p-3.5 rounded-2xl flex items-center gap-3 hover:bg-card transition-all duration-300 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Users size={20} />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-muted-foreground font-medium">
            Total Élèves
          </span>
          <span className="text-base font-bold text-foreground leading-none mt-1">
            {totalStudents.toLocaleString("fr-FR")}
          </span>
        </div>
        <ChevronLeft
          size={16}
          className={`text-muted-foreground transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id="capacity-details-panel"
        className={`bg-background/90 backdrop-blur-md border border-border rounded-2xl shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded
            ? "w-96 opacity-100 p-4 border-border"
            : "w-0 opacity-0 p-0 border-transparent pointer-events-none"
        }`}
      >
        <div className="w-full">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Répartition par section
            </h4>
            <span className="text-xs font-medium text-muted-foreground">
              {groupedSections.length} Sections
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-accent">
            {groupedSections.length > 0 ? (
              groupedSections.map((group) => (
                <div key={group.sectionKey} className="space-y-2">
                  <div className="flex justify-between items-center bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/30">
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
              <div className="text-xs text-muted-foreground text-center py-4">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
