import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Link } from "react-router";
import { Users, ChevronDown, Pin, PinOff, Move } from "lucide-react";
import { useGetStatsByClass } from "@/renderer/libs/queries/dashboard";
import type { ClassStatsDTO } from "@/packages/@core/data-access/db";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  onClickClassroom?: (classId: string) => string;
}

/**
 * Position coordinates for floating components.
 */
export interface WidgetPosition {
  x: number;
  y: number;
}

/**
 * Persisted state structure for widget position and pin mode.
 */
export interface WidgetState {
  position: WidgetPosition;
  isPinned: boolean;
}

const STORAGE_KEY = "capacity_info_widget_settings";

const DEFAULT_WIDGET_STATE: WidgetState = {
  position: { x: 16, y: 16 },
  isPinned: false,
};

const SECTION_LABELS: Record<string, string> = {
  KINDERGARTEN: "Maternelle",
  PRIMARY: "Primaire",
  SECONDARY: "Secondaire",
};

/**
 * Formats a numeric value into a localized string.
 * @param value - Numeric value to format.
 * @returns Formatted number string.
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/**
 * Groups class items by section and computes total counts per section.
 * @param classStats - Array of class statistics objects.
 * @returns Array of grouped section items.
 */
export function groupClassStatsBySection(
  classStats: ClassStatsDTO[],
): SectionGroup[] {
  const groupsMap = classStats.reduce<Record<string, SectionGroup>>(
    (accumulator, item) => {
      const key = item.section || "OTHER";
      if (!accumulator[key]) {
        accumulator[key] = {
          sectionKey: key,
          sectionLabel: SECTION_LABELS[key] || key,
          total: 0,
          classes: [],
        };
      }
      accumulator[key].total += item.value;
      accumulator[key].classes.push(item);
      return accumulator;
    },
    {},
  );

  return Object.values(groupsMap);
}

/**
 * Manages floating widget coordinates, drag-and-drop interactions, pin state, and LocalStorage persistence.
 * @param storageKey - Storage key for local persistence.
 * @returns Object containing widget state and interaction handlers.
 */
export function useWidgetPosition(storageKey: string = STORAGE_KEY) {
  const [state, setState] = useState<WidgetState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? (JSON.parse(saved) as WidgetState) : DEFAULT_WIDGET_STATE;
    } catch {
      return DEFAULT_WIDGET_STATE;
    }
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save widget settings to localStorage:", error);
    }
  }, [state, storageKey]);

  const togglePin = useCallback(() => {
    setState((previous) => ({
      ...previous,
      isPinned: !previous.isPinned,
    }));
  }, []);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (state.isPinned) return;
      setIsDragging(true);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        initialX: state.position.x,
        initialY: state.position.y,
      };
    },
    [state.isPinned, state.position],
  );

  useEffect(() => {
    if (!isDragging) return;

    let animationFrameId: number;

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragRef.current) return;

      animationFrameId = requestAnimationFrame(() => {
        const deltaX = event.clientX - dragRef.current!.startX;
        const deltaY = event.clientY - dragRef.current!.startY;

        const nextX = Math.max(
          0,
          Math.min(window.innerWidth - 280, dragRef.current!.initialX + deltaX),
        );
        const nextY = Math.max(
          0,
          Math.min(
            window.innerHeight - 100,
            dragRef.current!.initialY + deltaY,
          ),
        );

        setState((previous) => ({
          ...previous,
          position: { x: nextX, y: nextY },
        }));
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging]);

  return {
    position: state.position,
    isPinned: state.isPinned,
    isDragging,
    togglePin,
    handleMouseDown,
  };
}

/**
 * Props for the ClassItem component.
 */
interface ClassItemProps {
  item: ClassStatsDTO;
  onClickClassroom?: (classId: string) => string;
}

/**
 * Renders an individual classroom link or static item.
 * @param props - Item payload and click action handler.
 * @returns Classroom view element.
 */
const ClassItem: React.FC<ClassItemProps> = ({ item, onClickClassroom }) => {
  const targetUrl = onClickClassroom?.(item.classId);
  const content = (
    <>
      <span
        className="text-muted-foreground group-hover:text-foreground truncate mr-2 font-medium transition-colors"
        title={item.label}
      >
        {item.shortName || item.label}
      </span>
      <span className="font-bold text-foreground">
        {formatNumber(item.value)}
      </span>
    </>
  );

  const className =
    "flex justify-between items-center text-xs p-2 rounded-lg bg-muted/40 border border-border/30 hover:bg-accent/30 hover:border-border transition-colors group";

  if (targetUrl) {
    return (
      <Link to={targetUrl} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
};

/**
 * Interactive floating widget displaying total school capacity with popover details.
 * @param props - School, academic year identifiers, and classroom link handler.
 * @returns Interactive floating capacity widget React element.
 */
export const CapacityInfo: React.FC<CapacityInfoProps> = ({
  schoolId,
  yearId,
  onClickClassroom,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { position, isPinned, isDragging, togglePin, handleMouseDown } =
    useWidgetPosition();

  const { data: classStats = [] } = useGetStatsByClass({ schoolId, yearId });

  const totalStudents = useMemo(() => {
    return classStats.reduce((total, current) => total + current.value, 0);
  }, [classStats]);

  const groupedSections = useMemo(() => {
    return groupClassStatsBySection(classStats);
  }, [classStats]);

  const widgetContainerStyle: React.CSSProperties = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  return (
    <div
      style={widgetContainerStyle}
      className={cn(
        "fixed top-4 left-4 z-50 flex items-center gap-1.5 transition-shadow duration-200",
        isDragging && "cursor-grabbing opacity-90 select-none",
      )}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="bg-background/90 backdrop-blur-md border border-border/80 hover:border-border p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:shadow-md cursor-pointer"
          >
            <div className="p-2 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Users size={14} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Total Élèves
              </span>
              <span className="text-sm font-bold text-foreground leading-none mt-0.5">
                {formatNumber(totalStudents)}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "text-muted-foreground transition-transform duration-200",
                isOpen ? "rotate-180" : "rotate-0",
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="w-80 bg-background/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl p-4"
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Répartition par section
            </h4>
            <span className="text-xs font-medium text-muted-foreground">
              {groupedSections.length} Sections
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20">
            {groupedSections.length > 0 ? (
              groupedSections.map((group) => (
                <div key={group.sectionKey} className="space-y-2">
                  <div className="sticky top-0 z-10 flex justify-between items-center bg-background/95 backdrop-blur-md py-1 px-1 rounded-md">
                    <span className="text-xs font-bold text-foreground">
                      {group.sectionLabel}
                    </span>
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {formatNumber(group.total)} élèves
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {group.classes.map((item) => (
                      <ClassItem
                        key={item.classId}
                        item={item}
                        onClickClassroom={onClickClassroom}
                      />
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
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-0.5 bg-background/90 backdrop-blur-md border border-border/80 p-1 rounded-xl shadow-sm">
        {!isPinned && (
          <button
            type="button"
            onMouseDown={handleMouseDown}
            title="Cliquer et glisser pour déplacer"
            aria-label="Déplacer le widget"
            className="p-1.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing rounded-lg hover:bg-muted transition-colors"
          >
            <Move size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={togglePin}
          title={isPinned ? "Désépingler le widget" : "Épingler le widget"}
          aria-label={isPinned ? "Désépingler le widget" : "Épingler le widget"}
          className={`p-1.5 rounded-lg transition-colors ${
            isPinned
              ? "text-primary bg-primary/10 hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
        </button>
      </div>
    </div>
  );
};

/**
 * Layout container embedding children with CapacityInfo overlay layer.
 * @param props - Wrapped React children and capacity parameters.
 * @returns Wrapped component layout React element.
 */
export const CapacityInfoContainer: React.FC<
  React.PropsWithChildren<Partial<CapacityInfoProps>>
> = ({ children, schoolId, yearId, onClickClassroom }) => {
  return (
    <div className="flex-1 h-full w-full relative">
      {children}
      {schoolId && yearId && (
        <CapacityInfo
          schoolId={schoolId}
          yearId={yearId}
          onClickClassroom={onClickClassroom}
        />
      )}
    </div>
  );
};
