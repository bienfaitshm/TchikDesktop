import React, { useState, useMemo } from "react";
import { useGetStatsByClass } from "@/renderer/libs/queries/dashboard";
import { Users, ChevronLeft } from "lucide-react";

/**
 * Props for the CapacityInfo component.
 */
export interface CapacityInfoProps {
  yearId: string;
  schoolId: string;
}

/**
 * Displays total student count and an expandable horizontal grid breakdown per class.
 * @param props - Component parameters including schoolId and yearId.
 * @returns React element rendering the interactive capacity card.
 */
export const CapacityInfo: React.FC<CapacityInfoProps> = ({
  schoolId,
  yearId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: classStats = [] } = useGetStatsByClass({ schoolId, yearId });

  const totalStudents = useMemo(() => {
    return classStats.reduce(
      (total, currentClass) => total + currentClass.value,
      0,
    );
  }, [classStats]);

  const toggleExpand = () => {
    setIsExpanded((previousState) => !previousState);
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex items-start justify-end gap-2">
      <div
        onClick={toggleExpand}
        className="bg-card/60 backdrop-blur-md border border-border p-3.5 rounded-2xl flex items-center gap-3 shadow-sm cursor-pointer hover:bg-card/80 transition-all duration-300 select-none"
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
      </div>

      <div
        className={`bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-sm transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded
            ? "max-w-120 opacity-100 p-3.5"
            : "max-w-0 opacity-0 p-0 border-transparent"
        }`}
      >
        <div className="w-112.5">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2.5 border-b border-border/50 pb-1.5">
            Répartition par classe
          </h4>

          <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-accent">
            {classStats.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {classStats.map((item) => (
                  <div
                    key={item.classId}
                    className="flex justify-between items-center text-xs p-2 rounded-lg bg-background/50 border border-border/40"
                  >
                    <span className="text-muted-foreground truncate mr-2 font-medium">
                      {item.shortName ?? item.label}
                    </span>
                    <span className="font-bold text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-2">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
