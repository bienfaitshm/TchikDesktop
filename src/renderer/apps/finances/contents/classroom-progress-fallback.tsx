import { Spinner } from "@/renderer/components/ui/spinner";
import { useOnClassroomSyncProgress } from "@/renderer/libs/queries/finances";

/**
 * Fallback component showing real-time classroom data synchronization progress.
 * @returns Rendered progress spinner with percentage bar.
 */
export const ClassroomProgressFallback: React.FC = () => {
  const { progress } = useOnClassroomSyncProgress();

  const currentMessage =
    progress?.message ?? "Chargement des données financières...";
  const currentPercent = progress?.pourcent ?? 0;

  return (
    <div className="flex h-full min-h-[45vh] flex-col justify-center items-center gap-4 text-muted-foreground px-6">
      <div className="relative flex items-center justify-center">
        <Spinner className="h-10 w-10 text-primary animate-spin" />
        {currentPercent > 0 && (
          <span className="absolute text-[10px] font-semibold text-primary">
            {currentPercent}%
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 max-w-sm w-full text-center">
        <span className="text-sm font-semibold text-foreground">
          Synchronisation en cours
        </span>
        <span className="text-xs text-muted-foreground line-clamp-1">
          {currentMessage}
        </span>

        <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${currentPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
